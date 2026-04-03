import { createClient } from "@supabase/supabase-js"
import { astraMemories } from "./astra"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Get embedding for a text snippet using Gemini text-embedding-004.
 * Dimension: 768.
 */
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

/**
 * Retrieve user memories from Astra DB (Primary) or Supabase (Fallback)
 */
export async function getMemories(userId: string, query: string): Promise<string[]> {
  try {
    const embedding = await getEmbedding(query)
    
    // PRIMARY: DataStax Astra DB (Vector Similarity Search)
    if (process.env.ASTRA_DB_TOKEN && !process.env.ASTRA_DB_TOKEN.startsWith('your-')) {
      try {
        const results = await astraMemories.find({}, {
          sort: { $vector: embedding },
          limit: 10,
          includeSimilarity: true
        }).toArray()
        
        const facts = results
          .filter(r => (r as any).user_id === userId)
          .map(r => (r as any).fact) as string[]
        
        if (facts.length > 0) return facts
      } catch (err: any) {
        if (err?.message?.includes("COLLECTION_NOT_EXIST")) {
          // Silent fallback — Astra collection not initialized, pass to Supabase
        } else {
          console.error("[AstraDB] Match error:", err.message || err)
        }
      }
    }

    // FALLBACK: Supabase Vector RPC
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

/**
 * Extract facts from conversation and store them in Astra DB
 */
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
    
    // PRIMARY: Save to DataStax Astra DB
    if (process.env.ASTRA_DB_TOKEN && !process.env.ASTRA_DB_TOKEN.startsWith('your-')) {
      try {
        await astraMemories.insertOne({
          user_id: userId,
          fact,
          $vector: embedding,
          timestamp: new Date().toISOString()
        })
      } catch (err: any) {
        if (err?.message?.includes("COLLECTION_NOT_EXIST")) {
           // Silently skip
        } else {
           console.error("[AstraDB] Save error:", err.message || err)
        }
      }
    }

    // LEGACY: Save to Supabase (Double write for migration phase)
    await supabase.from("user_memories").insert({
      user_id: userId,
      fact,
      embedding: JSON.stringify(embedding),
    })
  }
}
