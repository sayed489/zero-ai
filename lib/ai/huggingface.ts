import type { Message } from './router'

const HF_API_URL = 'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-Coder-32B-Instruct'

export async function streamHuggingFace(
  messages: Message[],
  system: string
): Promise<ReadableStream> {
  const apiKey = process.env.HUGGINGFACE_API_KEY

  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY not configured')
  }

  // Format messages for Hugging Face
  const formattedMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  // Add system message at the start
  if (system) {
    formattedMessages.unshift({
      role: 'system',
      content: system,
    })
  }

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: formatPromptForQwen(formattedMessages),
      parameters: {
        max_new_tokens: 2048,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
        stream: true,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw { 
      status: response.status, 
      message: error,
      provider: 'huggingface'
    }
  }

  // Transform HuggingFace stream to standard format
  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  return new ReadableStream({
    async start(controller) {
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value, { stream: true })
          const lines = text.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                const token = parsed.token?.text || parsed.generated_text || ''
                if (token) {
                  controller.enqueue(new TextEncoder().encode(token))
                }
              } catch {
                // Skip unparseable lines
              }
            }
          }
        }
      } finally {
        controller.close()
        reader.releaseLock()
      }
    },
  })
}

// Format messages into Qwen chat format
function formatPromptForQwen(messages: { role: string; content: string }[]): string {
  let prompt = ''
  
  for (const msg of messages) {
    if (msg.role === 'system') {
      prompt += `<|im_start|>system\n${msg.content}<|im_end|>\n`
    } else if (msg.role === 'user') {
      prompt += `<|im_start|>user\n${msg.content}<|im_end|>\n`
    } else if (msg.role === 'assistant') {
      prompt += `<|im_start|>assistant\n${msg.content}<|im_end|>\n`
    }
  }
  
  // Add assistant start token for generation
  prompt += '<|im_start|>assistant\n'
  
  return prompt
}
