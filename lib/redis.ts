import { Redis } from "@upstash/redis"

// Create Redis client for caching and rate limiting
// Note: Requires Upstash for Redis integration to be set up
let redis: Redis | null = null

try {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  }
} catch (error) {
  console.warn("[v0] Redis not configured. Caching disabled.")
}

export { redis }

// Cache keys
export const CACHE_KEYS = {
  THREATS_LIST: (limit: number) => `threats:list:${limit}`,
  THREAT_DETAIL: (id: number) => `threat:${id}`,
  STATISTICS: "threats:statistics",
  TRENDS: (days: number) => `threats:trends:${days}`,
}

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  THREATS_LIST: 30, // 30 seconds
  THREAT_DETAIL: 60, // 1 minute
  STATISTICS: 60, // 1 minute
  TRENDS: 300, // 5 minutes
}

// Helper functions for caching
export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null

  try {
    const cached = await redis.get<T>(key)
    return cached
  } catch (error) {
    console.error("[v0] Redis get error:", error)
    return null
  }
}

export async function setCached<T>(key: string, value: T, ttl: number): Promise<void> {
  if (!redis) return

  try {
    await redis.set(key, value, { ex: ttl })
  } catch (error) {
    console.error("[v0] Redis set error:", error)
  }
}

export async function deleteCached(key: string): Promise<void> {
  if (!redis) return

  try {
    await redis.del(key)
  } catch (error) {
    console.error("[v0] Redis delete error:", error)
  }
}

export async function invalidateThreatCache(): Promise<void> {
  if (!redis) return

  try {
    // Delete all threat-related cache keys
    const keys = await redis.keys("threats:*")
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error("[v0] Redis invalidate error:", error)
  }
}

// Rate limiting helper
export async function checkRateLimit(identifier: string, limit: number, window: number): Promise<boolean> {
  if (!redis) return true // Allow if Redis not configured

  try {
    const key = `ratelimit:${identifier}`
    const current = await redis.incr(key)

    if (current === 1) {
      await redis.expire(key, window)
    }

    return current <= limit
  } catch (error) {
    console.error("[v0] Rate limit error:", error)
    return true // Allow on error
  }
}
