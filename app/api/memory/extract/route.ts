import { createClient } from '@/lib/supabase/server'
import { extractMemories, storeMemory } from '@/lib/memory/extract'
import { createServiceClient } from '@/lib/supabase/server'
import type { Message } from '@/lib/ai/router'

export async function POST(req: Request) {
  try {
    const { messages, conversationId } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract memories from the conversation
    const memories = await extractMemories(messages as Message[])

    if (memories.length === 0) {
      return Response.json({ extracted: 0 })
    }

    // Store memories with service client (to bypass RLS for vector operations)
    const serviceClient = await createServiceClient()

    for (const memory of memories) {
      await storeMemory(
        user.id,
        memory.fact,
        memory.category,
        conversationId || null,
        serviceClient
      )
    }

    return Response.json({ extracted: memories.length })
  } catch (error) {
    console.error('Memory extraction API error:', error)
    return Response.json(
      { error: 'Failed to extract memories' },
      { status: 500 }
    )
  }
}
