import { createClient } from "@supabase/supabase-js"
import { sign } from "jsonwebtoken"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return Response.json({ error: "No userId" }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: memories } = await supabase
    .from("user_memories")
    .select("fact")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100)

  const token = sign(
    { userId, memories: memories?.map((m) => m.fact) },
    process.env.MEMORY_SECRET!,
    { expiresIn: "90d" }
  )

  const mcpConfig = JSON.stringify(
    {
      mcpServers: {
        zeroMemory: {
          command: "npx",
          args: ["-y", "@zero-ai/memory-mcp"],
          env: {
            USER_TOKEN: token,
            SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
          },
        },
      },
    },
    null,
    2
  )

  return new Response(mcpConfig, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=zero-memory-mcp.json",
    },
  })
}
