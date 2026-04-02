import { createClient, createServiceClient } from '@/lib/supabase/server'
import { retrieveMemories, getAllMemories, deleteMemory } from '@/lib/memory/retrieve'

export async function POST(req: Request) {
  try {
    const { query, limit = 20 } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceClient = await createServiceClient()
    const memories = await retrieveMemories(user.id, query, serviceClient, limit)

    return Response.json({ memories })
  } catch (error) {
    console.error('Memory retrieve API error:', error)
    return Response.json(
      { error: 'Failed to retrieve memories' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceClient = await createServiceClient()
    const memories = await getAllMemories(user.id, serviceClient)

    return Response.json({ memories })
  } catch (error) {
    console.error('Memory list API error:', error)
    return Response.json(
      { error: 'Failed to list memories' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { memoryId } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceClient = await createServiceClient()
    const success = await deleteMemory(memoryId, user.id, serviceClient)

    if (!success) {
      return Response.json({ error: 'Failed to delete memory' }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Memory delete API error:', error)
    return Response.json(
      { error: 'Failed to delete memory' },
      { status: 500 }
    )
  }
}
