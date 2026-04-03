// Long-term agentic memory backed by Supabase pgvector
import { createClient } from "@/lib/supabase/server"

export async function saveAgenticMemory(
  userId: string,
  key: string,
  value: string,
  category = "general"
): Promise<void> {
  const supabase = await createClient()
  await supabase.from("agentic_memory").upsert({
    user_id: userId,
    key,
    value,
    category,
    created_at: new Date().toISOString(),
  }, { onConflict: "user_id, key" })
}

export async function recallAgenticMemory(
  userId: string,
  query: string,
  limit = 5
): Promise<Array<{ key: string; value: string; category: string }>> {
  const supabase = await createClient()

  // Simple text search fallback (vector search requires embedding model)
  const { data, error } = await supabase
    .from("agentic_memory")
    .select("key, value, category")
    .eq("user_id", userId)
    .ilike("value", `%${query.slice(0, 30)}%`)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[agentic/memory] Recall error:", error)
    return []
  }

  return data ?? []
}

export async function getFullAgenticContext(userId: string): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("agentic_memory")
    .select("key, value, category")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20)

  if (!data?.length) return ""
  return data.map(m => `[${m.category}] ${m.key}: ${m.value}`).join("\n")
}

export async function logAgenticAction(
  sessionId: string,
  userId: string,
  toolName: string,
  parameters: any,
  result: any,
  success: boolean,
  durationMs: number
): Promise<void> {
  const supabase = await createClient()
  await supabase.from("agentic_actions").insert({
    session_id: sessionId,
    user_id: userId,
    tool_name: toolName,
    parameters,
    result: typeof result === "string" ? { text: result.slice(0, 5000) } : result,
    success,
    duration_ms: durationMs,
  })
}
