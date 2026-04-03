// User & Auth Types
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

export interface Profile {
  id: string
  name: string | null
  email: string | null
  plan: 'starter' | 'pro' | 'ultra'
  plan_expires_at: string | null
  messages_today: number
  messages_reset_at: string
  location_country: string | null
  location_currency: string
  razorpay_subscription_id: string | null
  stripe_subscription_id: string | null
  created_at: string
}

// Conversation Types
export interface Conversation {
  id: string
  user_id: string
  title: string | null
  model: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model_used: string | null
  tokens_used: number | null
  has_image: boolean
  image_url: string | null
  created_at: string
}

// Memory Types
export interface Memory {
  id: string
  user_id: string
  fact: string
  category: 'preference' | 'project' | 'skill' | 'personal' | 'goal'
  confidence: number
  source_conversation_id: string | null
  created_at: string
  last_reinforced_at: string
}

export interface MemoryMatch {
  id: string
  fact: string
  category: string
  similarity: number
}

// ─── AI Model Types — Zero's 5-tier system ──────────────────────────────────
export type AIModel =
  | 'pico'
  | 'nano'
  | 'prime'
  | 'apex'
  | 'agentic-chad'

export type ModelTier = 'local' | 'cloud' | 'agent'

export interface ModelInfo {
  id: AIModel
  name: string
  description: string
  provider: string
  speed: 'fast' | 'balanced' | 'powerful'
  tier: ModelTier
  freeDailyLimit?: number   // shown in selector badge
  isLocal?: boolean
  supportsExtendedThinking?: boolean
  supportsVision?: boolean
  supportsSearch?: boolean
}

// Zero's 5-tier model lineup
export const MODELS: ModelInfo[] = [
  {
    id: 'pico',
    name: 'Zero Pico',
    description: 'Runs 100% on your device · No cloud',
    provider: 'WebLLM (Local)',
    speed: 'fast',
    tier: 'local',
    isLocal: true,
    freeDailyLimit: 999999,
  },
  {
    id: 'nano',
    name: 'Zero Nano',
    description: 'Fast everyday tasks · 10/day free',
    provider: 'Zero AI',
    speed: 'fast',
    tier: 'cloud',
    freeDailyLimit: 10,
  },
  {
    id: 'prime',
    name: 'Zero Prime',
    description: 'Deep reasoning · 5/day free',
    provider: 'Zero AI',
    speed: 'balanced',
    tier: 'cloud',
    freeDailyLimit: 5,
  },
  {
    id: 'apex',
    name: 'Zero Apex',
    description: 'Maximum intelligence · 3/day free',
    provider: 'Zero AI',
    speed: 'powerful',
    tier: 'cloud',
    freeDailyLimit: 3,
    supportsExtendedThinking: true,
  },
  {
    id: 'agentic-chad',
    name: 'Agentic Chad',
    description: 'Autonomous · Web search · Code exec',
    provider: 'Zero AI',
    speed: 'powerful',
    tier: 'agent',
    supportsExtendedThinking: true,
    supportsSearch: true,
  },
]

// Skills that can be added via '+' button
export interface Skill {
  id: string
  name: string
  description: string
  icon: string
  category: 'create' | 'tools' | 'memory'
}

export const SKILLS: Skill[] = [
  {
    id: 'image-gen',
    name: 'Generate Image',
    description: 'Create images from text descriptions',
    icon: '🎨',
    category: 'create'
  },
  {
    id: 'app-factory',
    name: 'Build App',
    description: 'Generate web applications and components',
    icon: '🏗️',
    category: 'create'
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm',
    description: 'Creative ideation and problem solving',
    icon: '💡',
    category: 'tools'
  },
  {
    id: 'web-search',
    name: 'Search Web',
    description: 'Search the internet for information',
    icon: '🔍',
    category: 'tools'
  },
  {
    id: 'code-exec',
    name: 'Run Code',
    description: 'Execute code in sandbox environment',
    icon: '⚡',
    category: 'tools'
  },
  {
    id: 'memory-export',
    name: 'Export Memory',
    description: 'Export memories for Claude/Cursor',
    icon: '📤',
    category: 'memory'
  },
  {
    id: 'memory-add',
    name: 'Add Memory',
    description: 'Save information to memory',
    icon: '🧠',
    category: 'memory'
  },
  {
    id: 'analyze-image',
    name: 'Analyze Image',
    description: 'Understand and describe images',
    icon: '👁️',
    category: 'tools'
  },
  {
    id: 'analyze-file',
    name: 'Analyze File',
    description: 'Read and extract data from documents',
    icon: '📄',
    category: 'tools'
  },
  {
    id: 'roast',
    name: 'Roast Me',
    description: 'Provide savage, witty roasts based on my input',
    icon: '🔥',
    category: 'tools'
  }
]

// Chat Types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  model?: string
  isStreaming?: boolean
  hasImage?: boolean
  imageUrl?: string
  sources?: SearchSource[]
  thinkingContent?: string
  skill?: string
  hasAppFactory?: boolean
  appFactoryFiles?: Record<string, string>
  appFactoryUrl?: string
  appFactoryDescription?: string
  createdAt: Date
}

export interface SearchSource {
  title: string
  url: string
  snippet: string
  favicon?: string
}

// Pricing Types
export interface PricingInfo {
  country: string
  country_name: string
  currency: string
  symbol: string
  pro: {
    amount: number
    display: string
    period: string
  }
  ultra: {
    amount: number
    display: string
    period: string
  }
  provider: 'razorpay' | 'stripe'
}

// MCP (Model Context Protocol) Connector Types
export interface MCPConnector {
  id: string
  name: string
  description: string
  icon: string
  status: 'connected' | 'disconnected' | 'pending'
  capabilities: string[]
}

export const MCP_CONNECTORS: MCPConnector[] = [
  {
    id: 'filesystem',
    name: 'File System',
    description: 'Read and write local files',
    icon: '📁',
    status: 'disconnected',
    capabilities: ['read', 'write', 'search']
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Access repositories and code',
    icon: '🐙',
    status: 'disconnected',
    capabilities: ['repos', 'issues', 'pull_requests']
  },
  {
    id: 'web-search',
    name: 'Web Search',
    description: 'Search the internet in real-time',
    icon: '🔍',
    status: 'connected',
    capabilities: ['search', 'browse']
  },
  {
    id: 'memory',
    name: 'Memory',
    description: 'Persistent context across chats',
    icon: '🧠',
    status: 'connected',
    capabilities: ['store', 'retrieve', 'export']
  },
  {
    id: 'astra-db',
    name: 'Astra DB',
    description: '10GB free vector memory storage',
    icon: '🗄️',
    status: 'disconnected',
    capabilities: ['vector_store', 'search', 'scale']
  },
  {
    id: 'code-exec',
    name: 'Code Execution',
    description: 'Run code in sandboxed environment',
    icon: '⚡',
    status: 'disconnected',
    capabilities: ['python', 'javascript', 'shell']
  },
  {
    id: 'browser',
    name: 'Browser Control',
    description: 'Automate web interactions',
    icon: '🌐',
    status: 'disconnected',
    capabilities: ['navigate', 'click', 'screenshot']
  }
]

// Feature detection
export function shouldTriggerSearch(message: string): boolean {
  const searchTriggers = [
    'today', 'latest', 'news', 'current', '2024', '2025', '2026',
    'price', 'weather', 'who is', 'what is happening', 'recent'
  ]
  const lower = message.toLowerCase()
  return searchTriggers.some(trigger => lower.includes(trigger))
}

export function shouldTriggerImageGen(message: string): boolean {
  const imageTriggers = [
    'generate', 'create', 'draw', 'make', 'show me'
  ]
  const imageNouns = ['image', 'picture', 'photo', 'illustration', 'artwork']
  const lower = message.toLowerCase()
  return imageTriggers.some(t => lower.includes(t)) && imageNouns.some(n => lower.includes(n))
}

export function shouldTriggerAppFactory(message: string): boolean {
  const buildTriggers = ['build', 'create', 'make', 'generate']
  const appNouns = ['app', 'website', 'tool', 'dashboard', 'landing page', 'web app']
  const lower = message.toLowerCase()
  return buildTriggers.some(t => lower.includes(t)) && appNouns.some(n => lower.includes(n))
}

export function shouldTriggerComplexApp(message: string): boolean {
  const complexTriggers = [
    'database', 'auth', 'login', 'backend', 'fullstack', 'stripe', 'payment',
    'threejs', '3d', 'complex', 'api', 'saas', 'commerce', 'multi-page'
  ]
  const lower = message.toLowerCase()
  return complexTriggers.some(t => lower.includes(t)) || message.length > 200
}

export function shouldTriggerRoast(message: string): boolean {
  const lower = message.toLowerCase()
  return lower.includes('roast my') || lower.includes('roast this')
}

export function shouldTriggerExtendedThinking(message: string): boolean {
  const thinkingTriggers = [
    'think step by step', 'reason through', 'analyze carefully',
    'complex', 'difficult', 'hard problem', 'explain your reasoning'
  ]
  const lower = message.toLowerCase()
  return thinkingTriggers.some(t => lower.includes(t))
}
