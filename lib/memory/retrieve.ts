import { generateEmbedding } from '@/lib/ai/gemini'
import type { MemoryMatch } from '@/lib/types'

export async function retrieveMemories(
  userId: string,
  query: string,
  supabase: ReturnType<typeof import('@/lib/supabase/server').createServiceClient> extends Promise<infer T> ? T : never,
  limit = 20
): Promise<MemoryMatch[]> {
  try {
    // Generate embedding for the query
    const embedding = await generateEmbedding(query)

    // Call the match_memories function
    const { data, error } = await supabase.rpc('match_memories', {
      query_embedding: embedding,
      match_user_id: userId,
      match_count: limit,
    })

    if (error) {
      console.error('Memory retrieval error:', error)
      return []
    }

    return (data || []).filter(
      (m: MemoryMatch) => m.similarity > 0.5 // Only return relevant matches
    )
  } catch (error) {
    console.error('Memory retrieval error:', error)
    return []
  }
}

export async function getAllMemories(
  userId: string,
  supabase: ReturnType<typeof import('@/lib/supabase/server').createServiceClient> extends Promise<infer T> ? T : never
): Promise<Array<{ id: string; fact: string; category: string; created_at: string }>> {
  try {
    const { data, error } = await supabase
      .from('user_memories')
      .select('id, fact, category, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Get all memories error:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Get all memories error:', error)
    return []
  }
}

export async function deleteMemory(
  memoryId: string,
  userId: string,
  supabase: ReturnType<typeof import('@/lib/supabase/server').createServiceClient> extends Promise<infer T> ? T : never
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_memories')
      .delete()
      .eq('id', memoryId)
      .eq('user_id', userId)

    if (error) {
      console.error('Delete memory error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete memory error:', error)
    return false
  }
}

export function generateMCPExport(
  memories: Array<{ fact: string; category: string }>,
  userToken: string
): object {
  return {
    mcpServers: {
      'zero-memory': {
        command: 'npx',
        args: ['-y', '@zero-ai/memory-mcp@latest'],
        env: {
          ZERO_USER_TOKEN: userToken,
        },
      },
    },
    memories: memories.map((m) => ({
      fact: m.fact,
      category: m.category,
    })),
  }
}
