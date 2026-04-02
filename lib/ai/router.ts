import { streamCloudflare } from './cloudflare'
import { streamGroq } from './groq'
import { streamGemini } from './gemini'
import { streamHuggingFace } from './huggingface'
import { streamSambaNova } from './sambanova'

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Model routing - maps Zero model names to providers
export type ZeroModel = 'nano' | 'prime' | 'apex' | 'agentic-chad'

// Internal provider mapping
type Provider = 
  | 'cloudflare-qwen'
  | 'groq-llama'
  | 'gemini-flash'
  | 'sambanova'
  | 'huggingface-qwen'

const modelToProvider: Record<ZeroModel, Provider> = {
  'nano': 'cloudflare-qwen',       // Fast & efficient
  'prime': 'groq-llama',           // Balanced
  'apex': 'sambanova',             // Maximum reasoning
  'agentic-chad': 'huggingface-qwen' // Autonomous agent
}

export async function routeToModel(
  model: string,
  messages: Message[],
  system: string,
  extendedThinking = false
): Promise<ReadableStream> {
  // Build fallback chain based on what's actually configured
  const hasGroq = !!process.env.GROQ_API_KEY
  const hasGemini = !!(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY)
  const hasSambaNova = !!process.env.SAMBANOVA_API_KEY_1
  const hasHuggingFace = !!process.env.HUGGINGFACE_API_KEY
  const hasCloudflare = !!(process.env.CF_ACCOUNT_ID && process.env.CF_API_TOKEN_1)

  // Adaptive fallback order - only try providers with credentials
  const fallbackOrder: Provider[] = []
  
  // Always try Groq first if available (most reliable for prod)
  if (hasGroq) fallbackOrder.push('groq-llama')
  
  // Add Gemini if available (good fallback)
  if (hasGemini) fallbackOrder.push('gemini-flash')
  
  // Add other providers if available
  if (hasCloudflare) fallbackOrder.push('cloudflare-qwen')
  if (hasSambaNova) fallbackOrder.push('sambanova')
  if (hasHuggingFace) fallbackOrder.push('huggingface-qwen')

  // Fallback if somehow no providers configured - this shouldn't happen
  if (fallbackOrder.length === 0) {
    throw new Error('No AI providers are configured. Please set up at least GROQ_API_KEY.')
  }

  let lastError: Error | null = null

  for (const provider of fallbackOrder) {
    try {
      console.log(`[v0] Routing to ${provider}...`)
      
      switch (provider) {
        case 'groq-llama':
          return await streamGroq(messages, system)
        case 'gemini-flash':
          return await streamGemini(messages, system)
        case 'huggingface-qwen':
          return await streamHuggingFace(messages, system)
        case 'sambanova':
          return await streamSambaNova(messages, system, extendedThinking)
        default:
          continue
      }
    } catch (e: unknown) {
      const error = e as Error & { status?: number; message?: string }
      const errorMsg = error?.message || String(error)
      
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Skip provider if credentials missing - don't retry
      if (errorMsg.includes('credentials') || errorMsg.includes('API key') || errorMsg.includes('not set') || errorMsg.includes('not configured')) {
        console.log(`[v0] ${provider} - credentials not configured, skipping`)
        continue
      }
      
      // Skip provider if rate limited - move to next
      if (errorMsg.includes('rate') || errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('exceeded')) {
        console.log(`[v0] ${provider} rate limited (429), trying next provider...`)
        continue
      }
      
      // Other errors - log but try next provider
      console.log(`[v0] ${provider} error: ${errorMsg}`)
    }
  }

  // All providers failed
  const errorMsg = lastError?.message || 'All providers failed'
  console.error(`[v0] All AI providers exhausted: ${errorMsg}`)
  
  // Provide helpful debugging info
  const providersStatus = `Groq=${hasGroq}, Gemini=${hasGemini}, Cloudflare=${hasCloudflare}, SambaNova=${hasSambaNova}, HuggingFace=${hasHuggingFace}`
  const message = `All AI providers are currently busy or rate-limited. (${providersStatus}) Please try again in a moment, or add additional provider API keys to increase capacity.`
  
  throw new Error(message)
}

export function detectBestModel(content: string): ZeroModel {
  const lower = content.toLowerCase()

  // Complex reasoning tasks -> Apex
  const reasoningKeywords = [
    'explain', 'step by step', 'analyze', 'compare', 'think through',
    'complex', 'reasoning', 'logic', 'proof', 'derive'
  ]
  if (reasoningKeywords.some(k => lower.includes(k))) {
    return 'apex'
  }

  // Autonomous tasks -> Agentic Chad
  const agentKeywords = [
    'build', 'create app', 'make website', 'automate', 'agent',
    'multi-step', 'workflow', 'execute', 'run code'
  ]
  if (agentKeywords.some(k => lower.includes(k))) {
    return 'agentic-chad'
  }

  // Code tasks -> Prime
  const codeKeywords = [
    'code', 'function', 'bug', 'error', 'implement', 'debug',
    'typescript', 'javascript', 'python', 'react', 'api'
  ]
  if (codeKeywords.some(k => lower.includes(k))) {
    return 'prime'
  }

  // Default to Nano for speed
  return 'nano'
}

// Get model display info
export function getModelInfo(model: ZeroModel) {
  const info = {
    'nano': {
      name: 'Zero Nano',
      description: 'Fast & efficient for everyday tasks',
      speed: 'fast'
    },
    'prime': {
      name: 'Zero Prime',
      description: 'Balanced power & speed',
      speed: 'balanced'
    },
    'apex': {
      name: 'Zero Apex',
      description: 'Maximum reasoning power',
      speed: 'powerful'
    },
    'agentic-chad': {
      name: 'Agentic Chad',
      description: 'Autonomous agent for complex tasks',
      speed: 'powerful'
    }
  }
  return info[model]
}
