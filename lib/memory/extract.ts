import { generateEmbedding } from '@/lib/ai/gemini'
import { getMemoryExtractionPrompt } from '@/lib/ai/prompts'
import type { Message } from '@/lib/ai/router'

interface ExtractedMemory {
  fact: string
  category: 'preference' | 'project' | 'skill' | 'personal' | 'goal'
}

export async function extractMemories(
  messages: Message[]
): Promise<ExtractedMemory[]> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) {
    console.error('GOOGLE_GEMINI_API_KEY not set, skipping memory extraction')
    return []
  }

  try {
    // Format conversation for analysis
    const conversation = messages
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n\n')

    // Call Gemini for extraction
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: getMemoryExtractionPrompt() },
                { text: `\n\nConversation:\n${conversation}` },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Memory extraction API call failed')
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return []
    }

    const memories: ExtractedMemory[] = JSON.parse(jsonMatch[0])

    // Validate and filter
    return memories.filter(
      (m) =>
        typeof m.fact === 'string' &&
        m.fact.length > 0 &&
        ['preference', 'project', 'skill', 'personal', 'goal'].includes(m.category)
    )
  } catch (error) {
    console.error('Memory extraction error:', error)
    return []
  }
}

export async function storeMemory(
  userId: string,
  fact: string,
  category: string,
  conversationId: string | null,
  supabase: ReturnType<typeof import('@/lib/supabase/server').createServiceClient> extends Promise<infer T> ? T : never
): Promise<void> {
  try {
    // Generate embedding for the fact
    const embedding = await generateEmbedding(fact)

    // Store in database
    await supabase.from('user_memories').insert({
      user_id: userId,
      fact,
      category,
      source_conversation_id: conversationId,
      embedding,
      confidence: 1.0,
    })
  } catch (error) {
    console.error('Failed to store memory:', error)
  }
}
