export interface Message {
  role: "user" | "assistant" | "system"
  content: string | ContentPart[]
}

export interface ContentPart {
  type: "text" | "image_url"
  text?: string
  image_url?: { url: string }
}

export type TierName = "pico" | "nano" | "prime" | "apex" | "agentic"

export interface ProviderConfig {
  id: string
  name: string
  endpoint: string
  apiKey: string
  model: string
  tier: TierName | string
  maxTokens: number
  supportsVision: boolean
  supportsStreaming: boolean
  rateLimit: number   // RPM for this provider
  priority: number    // lower = tried first
}

export interface StreamChunk {
  type: "token" | "done" | "error" | "provider_switch" | "pico"
  content?: string
  provider?: string
  model?: string
  error?: string
}

export interface RouterResult {
  response: string
  modelUsed: string
  providerUsed: string
  tier: TierName
  latency: number
}
