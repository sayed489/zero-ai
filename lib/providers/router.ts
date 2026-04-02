import { redis } from "@/lib/redis"
import { PROVIDERS } from "./configs"
import { Message, ProviderConfig, StreamChunk } from "./types"

export async function getAvailableProviders(tier: string): Promise<ProviderConfig[]> {
  const providers = PROVIDERS[tier] || []
  const statuses = await Promise.all(
    providers.map((p) => redis.get(`provider:${p.id}:status`))
  )
  return providers
    .filter((p, i) => statuses[i] !== "exhausted" && statuses[i] !== "down")
    .sort((a, b) => a.priority - b.priority)
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
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`))

      for (const provider of providers) {
        try {
          encode({ type: "provider_switch", provider: provider.name, model: provider.model })

          const stream = callProvider(provider, messages, systemPrompt)

          for await (const token of stream) {
            encode({ type: "token", content: token })
          }

          encode({ type: "done", provider: provider.name, model: provider.model })

          await redis.set(`provider:${provider.id}:status`, "ok")
          await redis.incr(`provider:${provider.id}:success_count`)
          controller.close()
          return
        } catch (err: any) {
          console.error(`Provider ${provider.id} failed:`, err.message)

          if (err.status === 429) {
            await redis.set(`provider:${provider.id}:status`, "exhausted", { ex: 3600 })
          } else if (err.status >= 500) {
            await redis.set(`provider:${provider.id}:status`, "down", { ex: 300 })
          }

          await redis.incr(`provider:${provider.id}:error_count`)
          continue
        }
      }

      encode({ type: "error", error: "All providers temporarily unavailable. Try again in a moment." })
      controller.close()
    },
  })
}

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

  // Dynamic HF spaces handling using sequentially active space from Redis
  if (provider.endpoint === "dynamic" && provider.id.startsWith("hf-")) {
    yield* callHFSpace(provider, allMessages)
    return
  }

  const res = await fetch(provider.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model, // Correctly requests Qwen2.5-7B Instruct or similar 
      messages: allMessages,
      max_tokens: provider.maxTokens,
      stream: true,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) {
    const err: any = new Error(`${provider.id} error: ${res.status}`)
    err.status = res.status
    throw err
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const lines = decoder.decode(value).split("\n")
    for (const line of lines) {
      if (!line.startsWith("data: ") || line === "data: [DONE]") continue
      try {
        const json = JSON.parse(line.slice(6))
        const token = json.choices?.[0]?.delta?.content
        if (token) yield token
      } catch {}
    }
  }
}

async function* callGemini(provider: ProviderConfig, messages: Message[]): AsyncGenerator<string> {
  const url = `${provider.endpoint}?key=${provider.apiKey}&alt=sse`
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: typeof m.content === "string" ? m.content : (m.content as any)[0]?.text || "" }],
    }))
  const systemInstruction = messages.find((m) => m.role === "system")?.content

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      ...(systemInstruction && {
        systemInstruction: { parts: [{ text: systemInstruction }] },
      }),
      generationConfig: { maxOutputTokens: provider.maxTokens },
    }),
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) {
    const err: any = new Error(`Gemini error: ${res.status}`)
    err.status = res.status
    throw err
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const lines = decoder.decode(value).split("\n")
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue
      try {
        const json = JSON.parse(line.slice(6))
        const token = json.candidates?.[0]?.content?.parts?.[0]?.text
        if (token) yield token
      } catch {}
    }
  }
}

async function* callHFSpace(provider: ProviderConfig, messages: Message[]): AsyncGenerator<string> {
  const activeSpace = await redis.get(`hf:${provider.tier}:current`) as string
  if (!activeSpace) throw new Error("No HF space active for tier " + provider.tier)

  const status = await redis.get(`hf:space:${activeSpace}:status`)
  if (status === "sleeping" || status === "waking") {
    throw Object.assign(new Error("HF space sleeping"), { status: 503 })
  }

  const endpoint = `https://${activeSpace.replace("/", "-")}.hf.space/api/predict`
  const lastMessage = messages[messages.length - 1]
  const prompt = typeof lastMessage.content === "string" ? lastMessage.content : ""

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(provider.apiKey && { Authorization: `Bearer ${provider.apiKey}` }),
    },
    body: JSON.stringify({ data: [prompt, "", 512, 0.7, 0.95] }),
    signal: AbortSignal.timeout(60000), // Longer timeout for HF Spaces
  })

  if (!res.ok) {
    const err: any = new Error(`HF error on space ${activeSpace}: ${res.status}`)
    err.status = res.status
    throw err
  }

  const json = await res.json()
  const text = json.data?.[0] || ""
  const words = text.split(" ")
  for (const word of words) {
    yield word + " "
    await new Promise((r) => setTimeout(r, 20)) // Simulates streaming effectively
  }
}
