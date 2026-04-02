import type { Message } from './router'

const SAMBANOVA_API_URL = 'https://api.sambanova.ai/v1/chat/completions'

export async function streamSambaNova(
  messages: Message[],
  system: string,
  extendedThinking = false
): Promise<ReadableStream> {
  const apiKey = process.env.SAMBANOVA_API_KEY

  if (!apiKey) {
    throw new Error('SAMBANOVA_API_KEY not configured')
  }

  // Format messages
  const formattedMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  // Add system message
  if (system) {
    formattedMessages.unshift({
      role: 'system',
      content: extendedThinking 
        ? `${system}\n\nThink step by step and show your reasoning process before providing the final answer.`
        : system,
    })
  }

  const response = await fetch(SAMBANOVA_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'Meta-Llama-3.1-405B-Instruct',
      messages: formattedMessages,
      stream: true,
      max_tokens: extendedThinking ? 4096 : 2048,
      temperature: extendedThinking ? 0.3 : 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw { 
      status: response.status, 
      message: error,
      provider: 'sambanova'
    }
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

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
              const data = line.slice(6).trim()
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) {
                  controller.enqueue(new TextEncoder().encode(content))
                }
              } catch {
                // Skip unparseable lines
              }
            }
          }
        }

        // Process remaining buffer
        if (buffer.startsWith('data: ') && buffer.slice(6).trim() !== '[DONE]') {
          try {
            const parsed = JSON.parse(buffer.slice(6))
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              controller.enqueue(new TextEncoder().encode(content))
            }
          } catch {
            // Skip
          }
        }
      } finally {
        controller.close()
        reader.releaseLock()
      }
    },
  })
}
