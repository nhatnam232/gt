import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? "http://localhost:8079",
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "local_token",
})

export const TTL = {
  short: 60,
  medium: 300,
  long: 900,
  day: 86400,
} as const

export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = TTL.medium,
): Promise<T> {
  const hit = await redis.get<T>(key)
  if (hit !== null && hit !== undefined) return hit
  const value = await fn()
  await redis.setex(key, ttl, value)
  return value
}

export async function invalidate(...keys: string[]): Promise<void> {
  if (keys.length === 0) return
  await redis.del(...keys)
}

export async function invalidatePattern(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) await redis.del(...keys)
}
