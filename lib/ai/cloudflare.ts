import type { Message } from './router'

const MODEL = '@cf/qwen/qwen2.5-coder-7b-instruct-awq'

export async function streamCloudflare(
  messages: Message[],
  system: string
): Promise<ReadableStream> {
  const accountId = process.env.CF_ACCOUNT_ID
  const apiToken = process.env.CF_API_TOKEN_1

  if (!accountId || !apiToken) {
    throw new Error('Cloudflare credentials not set')
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: system },
        ...messages,
      ],
      stream: true,
    }),
  })

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
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                continue
              }

              try {
                const parsed = JSON.parse(data)
                const content = parsed.response
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
      } catch (error) {
        controller.error(error)
      } finally {
        controller.close()
      }
    },
  })
}
