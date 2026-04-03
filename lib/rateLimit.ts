import { redis } from "@/lib/redis"

// ─── Plan & Tier Types ────────────────────────────────────────────────────────
export type Plan = "free" | "pro" | "ultra"
export type Tier = "nano" | "prime" | "apex" | "pico" | "agentic-chad"

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number  // epoch ms
  limit: number
}

export interface TierStatus {
  tier: Tier
  used: number
  limit: number
  remaining: number
  resetAt: number
  percent: number
}

// ─── Per-tier daily limits per plan ──────────────────────────────────────────
function getLimit(tier: Tier, plan: Plan): number {
  if (tier === "pico") return 999999        // Always unlimited (local)
  if (tier === "agentic-chad") {
    if (plan === "ultra") return 9999
    return 0                                // Not available on free/pro
  }

  const envMap: Record<Tier, Record<Plan, string>> = {
    nano: {
      free:  process.env.FREE_NANO_DAILY_LIMIT  || "10",
      pro:   process.env.PRO_NANO_DAILY_LIMIT   || "200",
      ultra: process.env.ULTRA_NANO_DAILY_LIMIT || "9999",
    },
    prime: {
      free:  process.env.FREE_PRIME_DAILY_LIMIT  || "5",
      pro:   process.env.PRO_PRIME_DAILY_LIMIT   || "100",
      ultra: process.env.ULTRA_PRIME_DAILY_LIMIT || "9999",
    },
    apex: {
      free:  process.env.FREE_APEX_DAILY_LIMIT  || "3",
      pro:   process.env.PRO_APEX_DAILY_LIMIT   || "50",
      ultra: process.env.ULTRA_APEX_DAILY_LIMIT || "9999",
    },
    pico:           { free: "999999", pro: "999999", ultra: "999999" },
    "agentic-chad": { free: "0",      pro: "0",      ultra: "9999"   },
  }

  return parseInt(envMap[tier]?.[plan] ?? "10", 10)
}

function todayKey(): string {
  return new Date().toISOString().split("T")[0] // "2026-04-03"
}

/**
 * Check & increment rate limit for a given user + tier + plan.
 * Key format: rl:{userId}:{tier}:{date}
 */
export async function checkTierRateLimit(
  userId: string,
  tier: Tier,
  plan: Plan
): Promise<RateLimitResult> {
  const limit = getLimit(tier, plan)
  const resetAt = new Date().setHours(24, 0, 0, 0)

  // Pico is always local — no server rate limiting needed
  if (tier === "pico") {
    return { allowed: true, remaining: 999999, resetAt, limit }
  }

  // Agentic-Chad only for Ultra
  if (tier === "agentic-chad" && plan !== "ultra") {
    return { allowed: false, remaining: 0, resetAt, limit: 0 }
  }

  try {
    const key = `rl:${userId}:${tier}:${todayKey()}`
    const count = await redis.incr(key)
    if (count === 1) {
      // Set TTL to 48h (covers midnight edge cases)
      await redis.expire(key, 172800)
    }

    const allowed = count <= limit
    const remaining = Math.max(0, limit - count)
    return { allowed, remaining, resetAt, limit }

  } catch {
    // Redis down — fail open (allow the request)
    return { allowed: true, remaining: limit, resetAt, limit }
  }
}

/**
 * Get current usage status for all tiers (for the usage bar UI).
 */
export async function getTierStatus(
  userId: string,
  plan: Plan
): Promise<TierStatus[]> {
  const tiers: Tier[] = ["nano", "prime", "apex"]
  const dateKey = todayKey()
  const resetAt = new Date().setHours(24, 0, 0, 0)

  const statuses = await Promise.all(
    tiers.map(async (tier) => {
      const limit = getLimit(tier, plan)
      let used = 0

      try {
        const key = `rl:${userId}:${tier}:${dateKey}`
        const raw = await redis.get<string>(key)
        used = raw ? parseInt(raw, 10) : 0
      } catch {
        used = 0
      }

      const remaining = Math.max(0, limit - used)
      const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0

      return { tier, used, limit, remaining, resetAt, percent } as TierStatus
    })
  )

  return statuses
}

/**
 * Check tier access — whether a plan can use a tier at all.
 * Pico: always. Nano/Prime: all plans. Apex: Pro+. Agentic-Chad: Ultra only.
 */
export function canAccessTier(plan: Plan, tier: Tier): boolean {
  if (tier === "pico") return true
  if (tier === "nano" || tier === "prime") return true
  if (tier === "apex") return plan === "pro" || plan === "ultra"
  if (tier === "agentic-chad") return plan === "ultra"
  return false
}

/**
 * Legacy compat: general chat rate limit check (maps to nano limits).
 */
export async function checkRateLimit(
  userId: string,
  plan: string = "free",
  type: string = "chat"
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const resolvedPlan = (["free", "pro", "ultra"].includes(plan) ? plan : "free") as Plan
  const tier: Tier = type === "apex" ? "apex" : type === "prime" ? "prime" : "nano"
  const result = await checkTierRateLimit(userId, tier, resolvedPlan)
  return { allowed: result.allowed, remaining: result.remaining, resetAt: result.resetAt }
}
