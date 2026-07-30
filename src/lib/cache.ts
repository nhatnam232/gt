import { Redis } from "@upstash/redis"
import { env, features } from "./env"

type Entry = { value: unknown; expiresAt: number }

/** Dev/test fallback so the app boots with zero external services. */
class MemoryCache {
  private store = new Map<string, Entry>()
  private max = 500

  get<T>(key: string): T | null {
    const hit = this.store.get(key)
    if (!hit) return null
    if (hit.expiresAt < Date.now()) {
      this.store.delete(key)
      return null
    }
    return hit.value as T
  }

  set(key: string, value: unknown, ttlSeconds: number) {
    if (this.store.size >= this.max) {
      const oldest = this.store.keys().next().value
      if (oldest) this.store.delete(oldest)
    }
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
  }

  delPrefix(prefix: string) {
    for (const key of this.store.keys()) if (key.startsWith(prefix)) this.store.delete(key)
  }
}

const memory = new MemoryCache()

export const redis = features.redis
  ? new Redis({ url: env.UPSTASH_REDIS_REST_URL!, token: env.UPSTASH_REDIS_REST_TOKEN! })
  : null

const k = (key: string) => `${env.CACHE_PREFIX}:${key}`

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return memory.get<T>(k(key))
    try {
      return (await redis.get<T>(k(key))) ?? null
    } catch {
      return null
    }
  },

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!redis) return memory.set(k(key), value, ttlSeconds)
    try {
      await redis.set(k(key), value, { ex: ttlSeconds })
    } catch {
      /* cache writes are best effort */
    }
  },

  async invalidate(prefix: string): Promise<void> {
    if (!redis) return memory.delPrefix(k(prefix))
    try {
      let cursor = 0
      do {
        const [next, keys] = await redis.scan(cursor, { match: `${k(prefix)}*`, count: 200 })
        cursor = Number(next)
        if (keys.length) await redis.del(...keys)
      } while (cursor !== 0)
    } catch {
      /* noop */
    }
  },

  /** Read-through helper. A cache failure never breaks the request. */
  async remember<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    const hit = await cache.get<T>(key)
    if (hit !== null && hit !== undefined) return hit
    const fresh = await fn()
    await cache.set(key, fresh, ttlSeconds)
    return fresh
  },
}

/** Deterministic cache key from an arbitrary params object. */
export function cacheKey(namespace: string, params: Record<string, unknown>): string {
  const normalized = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${Array.isArray(value) ? value.slice().sort().join("|") : String(value)}`)
    .join("&")
  return `${namespace}:${normalized || "all"}`
}
