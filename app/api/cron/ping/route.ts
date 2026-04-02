import { pingAllSpaces } from "@/lib/providers/hfPing"
import { NextResponse } from "next/server"

export const runtime = "edge"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  const results = await pingAllSpaces()
  return NextResponse.json({ pinged: results.length, results })
}
