import type { Message } from './router'

const MODEL = 'gemini-1.5-flash'
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

export async function streamGemini(
  messages: Message[],
  system: string
): Promise<ReadableStream> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set')
  }

  // Convert messages to Gemini format
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const response = await fetch(
    `${API_URL}/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: system }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw { status: response.status, message: error }
  }

  const reader = response.body!.getReader()
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)

              try {
                const parsed = JSON.parse(data)
                const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text
                if (content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                  )
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (error) {
        controller.error(error)
      } finally {
        controller.close()
      }
    },
  })
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set')
  }

  const response = await fetch(
    `${API_URL}/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: {
          parts: [{ text }],
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to generate embedding')
  }

  const data = await response.json()
  return data.embedding.values
}
