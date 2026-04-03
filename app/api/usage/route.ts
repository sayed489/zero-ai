import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const runtime = "edge"

// ─── GET /api/usage — fetch current usage ─────────────────────────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    const today = new Date().toISOString().slice(0, 10)

    const { data: usage } = await supabase
      .from("user_usage")
      .select("tier, model_used, request_count")
      .eq("user_id", userId)
      .eq("date", today)

    const { data: apexBudget } = await supabase
      .from("apex_budget")
      .select("requests_used, max_requests")
      .eq("date", today)
      .single()

    return NextResponse.json({
      usage: usage || [],
      apexBudget: apexBudget || { requests_used: 0, max_requests: 18 },
    })
  } catch (err: any) {
    console.error("[usage/GET]", err)
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 })
  }
}

// ─── POST /api/usage — log a request ─────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const { userId, tier, modelUsed } = await req.json()
    if (!userId || !tier) {
      return NextResponse.json({ error: "userId and tier required" }, { status: 400 })
    }

    const today = new Date().toISOString().slice(0, 10)

    // Upsert user_usage (increment request_count)
    await supabase.rpc("increment_usage", {
      p_user_id: userId,
      p_tier: tier,
      p_model: modelUsed || "unknown",
      p_date: today,
    })

    // Guard Apex Gemini 2.5 Flash daily budget (max 18)
    if (tier === "apex" && modelUsed?.includes("gemini-2.5")) {
      const { data: budget } = await supabase
        .from("apex_budget")
        .select("requests_used, max_requests")
        .eq("date", today)
        .single()

      const used = budget?.requests_used || 0
      const max = budget?.max_requests || 18

      if (used >= max) {
        return NextResponse.json({
          ok: false,
          reason: "gemini_25_budget_exhausted",
          message: "Apex Gemini 2.5 Flash daily budget reached, using Fireworks fallback",
        })
      }

      // Increment apex budget
      await supabase
        .from("apex_budget")
        .upsert({ date: today, requests_used: used + 1, max_requests: max })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[usage/POST]", err)
    return NextResponse.json({ ok: true }) // Don't block users on tracking errors
  }
}
