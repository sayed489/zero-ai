import { redis } from "@/lib/redis"

const LIMITS = {
  nano: { daily: 200, hourly: 30 },
  prime: { daily: 1000, hourly: 100 },
  apex: { daily: 999999, hourly: 999999 },
  agent: { daily: 999999, hourly: 999999 },
}

export async function checkRateLimit(
  userId: string,
  plan: string
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  try {
    const limit = LIMITS[plan as keyof typeof LIMITS] || LIMITS.nano
    const dayKey = `rl:${userId}:${plan}:${new Date().toISOString().slice(0, 10)}`
    const hourKey = `rl:${userId}:${plan}:${new Date().toISOString().slice(0, 13)}`

    const [dayCount, hourCount] = await Promise.all([
      redis.incr(dayKey),
      redis.incr(hourKey),
    ])

    if (dayCount === 1) await redis.expire(dayKey, 86400)
    if (hourCount === 1) await redis.expire(hourKey, 3600)

    const allowed = dayCount <= limit.daily && hourCount <= limit.hourly
    const remaining = Math.max(0, limit.daily - dayCount)
    const resetAt = new Date().setHours(24, 0, 0, 0)

    return { allowed, remaining, resetAt }
  } catch (err) {
    console.error("Redis rate limit error:", err)
    // If Redis isn't set up yet or crashes, degrade gracefully - let them use the app
    const limit = LIMITS[plan as keyof typeof LIMITS] || LIMITS.nano
    return { allowed: true, remaining: limit.daily, resetAt: new Date().setHours(24, 0, 0, 0) }
  }
}
