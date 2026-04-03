import { redis } from "@/lib/redis"
import { PROVIDERS } from "./configs"
import { Message, ProviderConfig, StreamChunk } from "./types"
import {
  siliconFlowRotator,
  geminiFlashRotator,
  fireworksRotator,
  cerebrasRotator,
  githubRotator,
  openrouterRotator,
} from "@/lib/key-rotation"

const TIMEOUT_MS = 5000 // Very fast timeout so fallbacks trigger instantly if a provider is stalled

// Map provider id prefix → rotator for markKeyFailed
function getRotatorForProvider(id: string) {
  if (id.startsWith("siliconflow")) return siliconFlowRotator
  if (id.startsWith("gemini")) return geminiFlashRotator
  if (id.startsWith("fireworks")) return fireworksRotator
  if (id.startsWith("cerebras")) return cerebrasRotator
  if (id.startsWith("github")) return githubRotator
  if (id.startsWith("openrouter")) return openrouterRotator
  return null
}

export async function getAvailableProviders(tier: string): Promise<ProviderConfig[]> {
  const providers = PROVIDERS[tier] || []
  let available = providers

  // 1. Filter out unconfigured providers (missing keys)
  available = available.filter(p => !!p.apiKey && !p.apiKey.startsWith('your-'))

  // 2. Filter out Redis-marked exhausted/down providers (best effort)
  try {
    const statuses = await Promise.all(
      available.map((p) => redis.get(`provider:${p.id}:status`))
    )
    available = available.filter(
      (_, i) => statuses[i] !== "exhausted" && statuses[i] !== "down"
    )
  } catch {
    // Redis not configured or fails — proceed with filtered available
  }

  return available.sort((a, b) => a.priority - b.priority)
}

export async function streamWithFallback(
  messages: Message[],
  tier: string,
  systemPrompt?: string
): Promise<ReadableStream> {
  const providers = await getAvailableProviders(tier)

  return new ReadableStream({
    async start(controller) {
      const encode = (chunk: StreamChunk) =>
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`)
        )

      let succeeded = false

      for (const provider of providers) {
        try {
          encode({
            type: "provider_switch",
            provider: provider.name,
            model: provider.model,
          })

          const stream = callProvider(provider, messages, systemPrompt)

          for await (const token of stream) {
            encode({ type: "token", content: token })
          }

          encode({ type: "done", provider: provider.name, model: provider.model })

          // Mark success in Redis (best-effort)
          try {
            await redis.set(`provider:${provider.id}:status`, "ok")
          } catch { }

          succeeded = true
          break
        } catch (err: any) {
          console.error(`[router] Provider ${provider.id} failed:`, err.message)

          const rotator = getRotatorForProvider(provider.id)
          if (err.status === 429) {
            rotator?.markKeyFailed(provider.apiKey)
            try {
              await redis.set(`provider:${provider.id}:status`, "exhausted", { ex: 3600 })
            } catch { }
          } else if (err.status >= 500) {
            try {
              await redis.set(`provider:${provider.id}:status`, "down", { ex: 300 })
            } catch { }
          }
          // Continue to next provider
        }
      }

      if (!succeeded) {
        encode({
          type: "error",
          error: "Zero is experiencing high demand. All providers busy — try again in a moment.",
        })
      }

      controller.close()
    },
  })
}

// ─── Provider caller ──────────────────────────────────────────────────────────

async function* callProvider(
  provider: ProviderConfig,
  messages: Message[],
  systemPrompt?: string
): AsyncGenerator<string> {
  const allMessages = systemPrompt
    ? [{ role: "system" as const, content: systemPrompt }, ...messages]
    : messages

  if (provider.endpoint.includes("googleapis.com")) {
    yield* callGemini(provider, allMessages)
    return
  }

  // OpenAI-compatible (SiliconFlow, Fireworks, Cerebras, OpenRouter, GitHub Models)
  const res = await fetch(provider.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages: allMessages,
      max_tokens: provider.maxTokens,
      stream: true,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })

  if (!res.ok) {
    const err: any = new Error(`${provider.id}: HTTP ${res.status}`)
    err.status = res.status
    throw err
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""
    for (const line of lines) {
      if (!line.startsWith("data: ") || line === "data: [DONE]") continue
      try {
        const json = JSON.parse(line.slice(6))
        const token = json.choices?.[0]?.delta?.content
        if (token) yield token
      } catch { }
    }
  }
}

async function* callGemini(
  provider: ProviderConfig,
  messages: Message[]
): AsyncGenerator<string> {
  const url = `${provider.endpoint}?key=${provider.apiKey}&alt=sse`
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [
        {
          text:
            typeof m.content === "string"
              ? m.content
              : (m.content as any)[0]?.text || "",
        },
      ],
    }))
  const systemInstruction = messages.find((m) => m.role === "system")?.content

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      ...(systemInstruction && {
        systemInstruction: {
          parts: [
            {
              text:
                typeof systemInstruction === "string"
                  ? systemInstruction
                  : "",
            },
          ],
        },
      }),
      generationConfig: { maxOutputTokens: provider.maxTokens },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })

  if (!res.ok) {
    const err: any = new Error(`Gemini ${provider.model}: HTTP ${res.status}`)
    err.status = res.status
    throw err
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue
      try {
        const json = JSON.parse(line.slice(6))
        const token = json.candidates?.[0]?.content?.parts?.[0]?.text
        if (token) yield token
      } catch { }
    }
  }
}
