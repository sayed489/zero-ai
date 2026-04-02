export interface Message {
  role: "user" | "assistant" | "system"
  content: string | ContentPart[]
}

export interface ContentPart {
  type: "text" | "image_url"
  text?: string
  image_url?: { url: string }
}

export interface ProviderConfig {
  id: string
  name: string
  endpoint: string
  apiKey: string
  model: string
  tier: "nano" | "prime" | "apex" | "agent"
  maxTokens: number
  supportsVision: boolean
  supportsStreaming: boolean
  rateLimit: number
  priority: number
}

export interface StreamChunk {
  type: "token" | "done" | "error" | "provider_switch"
  content?: string
  provider?: string
  model?: string
  error?: string
}
