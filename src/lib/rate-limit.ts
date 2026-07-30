import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "./cache"
import { env } from "./env"

type Duration = Parameters<typeof Ratelimit.slidingWindow>[1]

const buckets = new Map<string, Ratelimit>()

function limiter(name: string, max: number, window: Duration) {
  const key = `${name}:${max}:${window}`
  const existing = buckets.get(key)
  if (existing) return existing
  const instance = new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(max, window),
    prefix: `${env.CACHE_PREFIX}:rl:${name}`,
    analytics: false,
  })
  buckets.set(key, instance)
  return instance
}

/** In-process fallback when Redis is not configured. */
const local = new Map<string, { count: number; reset: number }>()

function localLimit(id: string, max: number, windowMs: number) {
  const now = Date.now()
  const hit = local.get(id)
  if (!hit || hit.reset < now) {
    local.set(id, { count: 1, reset: now + windowMs })
    return { success: true, remaining: max - 1, reset: now + windowMs }
  }
  hit.count += 1
  return { success: hit.count <= max, remaining: Math.max(0, max - hit.count), reset: hit.reset }
}

export type RateLimitVerdict = { success: boolean; remaining: number; reset: number }

export async function rateLimit(
  identifier: string,
  options?: { name?: string; max?: number; window?: Duration; windowMs?: number },
): Promise<RateLimitVerdict> {
  const name = options?.name ?? "api"
  const max = options?.max ?? env.RATE_LIMIT_MAX
  const window = (options?.window ?? env.RATE_LIMIT_WINDOW) as Duration

  if (!redis) return localLimit(`${name}:${identifier}`, max, options?.windowMs ?? 60_000)

  const result = await limiter(name, max, window).limit(identifier)
  return { success: result.success, remaining: result.remaining, reset: result.reset }
}

/** Best-effort client identity for anonymous rate limiting. */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    "unknown"
  )
}
