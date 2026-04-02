import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text }] },
      }),
    }
  )
  const data = await res.json()
  return data.embedding?.values || []
}

export async function getMemories(userId: string, query: string): Promise<string[]> {
  try {
    const embedding = await getEmbedding(query)
    const { data } = await supabase.rpc("match_memories", {
      query_embedding: embedding,
      match_user_id: userId,
      match_count: 20,
    })
    return data?.map((r: any) => r.fact) || []
  } catch {
    return []
  }
}

export async function extractMemoriesBackground(messages: any[], userId: string) {
  // Fire and forget — don't await
  extractMemories(messages, userId).catch(console.error)
}

async function extractMemories(messages: any[], userId: string) {
  const conversation = messages.map((m) => `${m.role}: ${m.content}`).join("\n")
  const apiKey = process.env.GEMINI_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Extract 3-5 specific facts about the USER (not the AI) from this conversation.
Return ONLY a valid JSON array of short strings. No markdown. No explanation.
Example: ["Works as a developer", "Lives in Mumbai", "Prefers dark mode"]

Conversation:
${conversation}`,
              },
            ],
          },
        ],
        generationConfig: { maxOutputTokens: 256 },
      }),
    }
  )

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]"

  let facts: string[] = []
  try {
    facts = JSON.parse(text.replace(/```json|```/g, "").trim())
  } catch {
    return
  }

  for (const fact of facts) {
    const embedding = await getEmbedding(fact)
    await supabase.from("user_memories").insert({
      user_id: userId,
      fact,
      embedding: JSON.stringify(embedding),
    })
  }
}
