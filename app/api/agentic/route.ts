import { runOrchestrator } from "@/lib/agentic/orchestrator"

export const runtime = "nodejs"
export const maxDuration = 120

export async function POST(req: Request) {
  const { message, sessionId, userId, conversationHistory = [], agentConnected = false } = await req.json()

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }

      try {
        await runOrchestrator(
          message,
          sessionId || `sess_${Date.now()}`,
          userId || "anonymous",
          conversationHistory,
          agentConnected,
          send
        )
      } catch (e: any) {
        send({ type: "final", content: `Zero Agentic encountered an error: ${e.message}` })
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  })
}
