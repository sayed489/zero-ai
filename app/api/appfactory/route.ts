import { buildApp } from "@/lib/appFactory"
import { checkTierRateLimit } from "@/lib/rateLimit"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const maxDuration = 60

function getUser(req: Request): string | null {
  const auth = req.headers.get("Authorization")
  if (!auth?.startsWith("Bearer ")) return null
  try {
    // Decode JWT to get user ID (sub claim) without verifying (server does that via Supabase)
    const payload = JSON.parse(
      Buffer.from(auth.slice(7).split(".")[1], "base64url").toString()
    )
    return payload.sub || null
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      description,
      complexity = "simple",
      plan = "free",
    } = body as { description?: string; complexity?: string; plan?: string }

    if (!description?.trim()) {
      return Response.json({ error: "description is required" }, { status: 400 })
    }

    const userId = getUser(req) || "anonymous"
    const resolvedPlan = (["free", "pro", "ultra"].includes(plan) ? plan : "free") as "free" | "pro" | "ultra"

    // Rate limit check (app factory uses nano tier quota for free)
    if (userId !== "anonymous") {
      const rateTier = resolvedPlan === "free" ? "nano" : resolvedPlan === "pro" ? "prime" : "nano"
      const limit = await checkTierRateLimit(userId, rateTier, resolvedPlan)
      if (!limit.allowed) {
        return Response.json(
          {
            error: "rate_limit",
            message: "Daily app generation limit reached",
            remaining: 0,
            resetAt: limit.resetAt,
            upgradeUrl: "/pricing",
          },
          { status: 429 }
        )
      }
    }

    const result = await buildApp(
      description,
      complexity as "simple" | "complex",
      userId !== "anonymous" ? userId : undefined
    )

    return Response.json(result)
  } catch (err: any) {
    console.error("[appfactory] Error:", err.message)
    return Response.json(
      { error: "generation_failed", message: err.message },
      { status: 500 }
    )
  }
}
