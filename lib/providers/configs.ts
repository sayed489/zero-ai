import { ProviderConfig } from "./types"
import {
  siliconFlowRotator,
  geminiFlashRotator,
  fireworksRotator,
  cerebrasRotator,
  openrouterRotator,
  githubRotator,
} from "@/lib/key-rotation"

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER CONFIGS — Ordered by priority (lower = tried first).
// Rate limits are per-key. Key rotation multiplies effective RPM.
// ─────────────────────────────────────────────────────────────────────────────

export const PROVIDERS: Record<string, ProviderConfig[]> = {

  // ─── NANO (cloud fallback when local WebLLM unavailable) ──────────────────
  nano: [
    // Fallback 1: Cerebras Llama 8B (experiencing timeouts)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `cerebras-nano-${i + 1}`,
      name: "Cerebras Fast",
      endpoint: "https://api.cerebras.ai/v1/chat/completions",
      get apiKey() { return cerebrasRotator.getNextKey() },
      model: "llama3.1-8b",
      tier: "nano" as const,
      maxTokens: 2048,
      supportsVision: false,
      supportsStreaming: true,
      rateLimit: 30,
      priority: 5 + i,
    })),
    // Primary 1: GitHub Models GPT-4o-mini
    {
      id: "github-nano-gpt4o-mini",
      name: "GitHub GPT-4o Mini",
      endpoint: "https://models.github.ai/inference/chat/completions",
      get apiKey() { return githubRotator.getNextKey() },
      model: "openai/gpt-4o-mini",
      tier: "nano" as const,
      maxTokens: 2048,
      supportsVision: false,
      supportsStreaming: true,
      rateLimit: 15,
      priority: 1,
    },
    // Fallback 1: SiliconFlow Qwen3-14B (Warning: Keys currently 401)
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `siliconflow-nano-${i + 1}`,
      name: "SiliconFlow Qwen3",
      endpoint: "https://api.siliconflow.cn/v1/chat/completions",
      get apiKey() { return siliconFlowRotator.getNextKey() },
      model: "Qwen/Qwen3-14B",
      tier: "nano" as const,
      maxTokens: 2048,
      supportsVision: false,
      supportsStreaming: true,
      rateLimit: 100,
      priority: 10 + i,
    })),
    // Fallback 2: Gemini 2.5 Flash Lite
    {
      id: "gemini-flash-nano",
      name: "Gemini Flash Lite",
      endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:streamGenerateContent",
      get apiKey() { return geminiFlashRotator.getNextKey() },
      model: "gemini-2.5-flash-lite",
      tier: "nano" as const,
      maxTokens: 2048,
      supportsVision: false,
      supportsStreaming: true,
      rateLimit: 15,
      priority: 20,
    },
    // Fallback 3: OpenRouter Free
    {
      id: "openrouter-free-nano",
      name: "OpenRouter Free",
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      get apiKey() { return openrouterRotator.getNextKey() },
      model: "meta-llama/llama-3.1-8b-instruct:free",
      tier: "nano" as const,
      maxTokens: 2048,
      supportsVision: false,
      supportsStreaming: true,
      rateLimit: 20,
      priority: 30,
    },
  ],

  // ─── PRIME (balanced cloud power) ─────────────────────────────────────────
  prime: [
    // Fallback 1: SiliconFlow Qwen3-14B (3 keys rotated) - 401 issues
    ...Array.from({ length: 3 }, (_, i) => ({
      id: `siliconflow-prime-${i + 1}`,
      name: "SiliconFlow Qwen3",
      endpoint: "https://api.siliconflow.cn/v1/chat/completions",
      get apiKey() { return siliconFlowRotator.getNextKey() },
      model: "Qwen/Qwen3-14B",
      tier: "prime" as const,
      maxTokens: 8192,
      supportsVision: false,
      supportsStreaming: true,
      rateLimit: 100,
      priority: 10 + i,
    })),
    // Fallback 2: Cerebras Llama 8B (experiencing timeouts)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `cerebras-prime-${i + 1}`,
      name: "Cerebras Fast",
      endpoint: "https://api.cerebras.ai/v1/chat/completions",
      get apiKey() { return cerebrasRotator.getNextKey() },
      model: "llama3.1-8b",
      tier: "prime" as const,
      maxTokens: 8192,
      supportsVision: false,
      supportsStreaming: true,
      rateLimit: 30,
      priority: 5 + i,
    })),
    // Fallback 2: Fireworks Qwen 2.5 72B (10 RPM × 6 keys = 60 RPM)
    {
      id: "fireworks-prime",
      name: "Fireworks AI",
      endpoint: "https://api.fireworks.ai/inference/v1/chat/completions",
      get apiKey() { return fireworksRotator.getNextKey() },
      model: "accounts/fireworks/models/qwen2p5-72b-instruct",
      tier: "prime" as const,
      maxTokens: 8192,
      supportsVision: false,
      supportsStreaming: true,
      rateLimit: 10,
      priority: 20,
    },
    // Primary 1: GitHub Models GPT-4o-mini
    {
      id: "github-prime-gpt4o-mini",
      name: "GitHub GPT-4o Mini",
      endpoint: "https://models.github.ai/inference/chat/completions",
      get apiKey() { return githubRotator.getNextKey() },
      model: "openai/gpt-4o-mini",
      tier: "prime" as const,
      maxTokens: 8192,
      supportsVision: false,
      supportsStreaming: true,
      rateLimit: 15,
      priority: 1,
    },
  ],

  // ─── APEX (maximum reasoning power) ───────────────────────────────────────
  apex: [
    // Fallback 1: SiliconFlow Qwen3-32B (3 keys rotated)
    ...Array.from({ length: 3 }, (_, i) => ({
      id: `siliconflow-apex-${i + 1}`,
      name: "SiliconFlow Qwen3-32B",
      endpoint: "https://api.siliconflow.cn/v1/chat/completions",
      get apiKey() { return siliconFlowRotator.getNextKey() },
      model: "Qwen/Qwen3-32B",
      tier: "apex" as const,
      maxTokens: 16384,
      supportsVision: false,
      supportsStreaming: true,
      rateLimit: 100,
      priority: 20 + i,
    })),
    // Fallback 2: SiliconFlow Qwen3-235B-A22B MoE (smaller active params, fast)
    ...Array.from({ length: 3 }, (_, i) => ({
      id: `siliconflow-apex-ultra-${i + 1}`,
      name: "SiliconFlow Qwen3-235B",
      endpoint: "https://api.siliconflow.cn/v1/chat/completions",
      get apiKey() { return siliconFlowRotator.getNextKey() },
      model: "Qwen/Qwen3-235B-A22B-Instruct-2507",
      tier: "apex" as const,
      maxTokens: 16384,
      supportsVision: false,
      supportsStreaming: true,
      rateLimit: 100,
      priority: 25 + i,
    })),
    // Primary 1: Fireworks Qwen3-235B
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `fireworks-apex-${i + 1}`,
      name: "Fireworks Qwen3-235B",
      endpoint: "https://api.fireworks.ai/inference/v1/chat/completions",
      get apiKey() { return fireworksRotator.getNextKey() },
      model: "accounts/fireworks/models/qwen3-235b-a22b",
      tier: "apex" as const,
      maxTokens: 16384,
      supportsVision: false,
      supportsStreaming: true,
      rateLimit: 10,
      priority: i + 1,
    })),
    // Fallback 3: Gemini 2.5 Pro
    {
      id: "gemini-15-pro-apex",
      name: "Gemini 2.5 Pro",
      endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:streamGenerateContent",
      get apiKey() { return geminiFlashRotator.getNextKey() },
      model: "gemini-2.5-pro",
      tier: "apex" as const,
      maxTokens: 16384,
      supportsVision: true,
      supportsStreaming: true,
      rateLimit: 5,
      priority: 25,
    },
    // Fallback 4: GitHub Models GPT-4o (Premium reasoning)
    {
      id: "github-apex-gpt4o",
      name: "GitHub GPT-4o",
      endpoint: "https://models.github.ai/inference/chat/completions",
      get apiKey() { return githubRotator.getNextKey() },
      model: "openai/gpt-4o",
      tier: "apex" as const,
      maxTokens: 16384,
      supportsVision: true,
      supportsStreaming: true,
      rateLimit: 15,
      priority: 5,
    },
    // Fallback 5: GitHub Models Llama 3.1 70B
    {
      id: "github-apex-llama-70b",
      name: "GitHub Models Llama 70B",
      endpoint: "https://models.github.ai/inference/chat/completions",
      get apiKey() { return githubRotator.getNextKey() },
      model: "meta-llama-3.1-70b-instruct",
      tier: "apex" as const,
      maxTokens: 16384,
      supportsVision: false,
      supportsStreaming: true,
      rateLimit: 15,
      priority: 30,
    },
  ],

  // ─── AGENTIC CHAD (code-execution sub-agent, not orchestrator) ──────────
  'agentic-chad': [
    // Primary: Cerebras Llama 8B (ultra-fast for tool loop speed)
    {
      id: "cerebras-agentic-fast",
      name: "Cerebras Fast",
      endpoint: "https://api.cerebras.ai/v1/chat/completions",
      get apiKey() { return cerebrasRotator.getNextKey() },
      model: "llama3.1-8b",
      tier: "agentic" as const,
      maxTokens: 8192,
      supportsVision: false,
      supportsStreaming: true,
      rateLimit: 30,
      priority: 1,
    },
    // Fallback: Fireworks Qwen3-235B (heavy reasoning)
    {
      id: "fireworks-agentic",
      name: "Fireworks Qwen3-235B",
      endpoint: "https://api.fireworks.ai/inference/v1/chat/completions",
      get apiKey() { return fireworksRotator.getNextKey() },
      model: "accounts/fireworks/models/qwen3-235b-a22b",
      tier: "agentic" as const,
      maxTokens: 16384,
      supportsVision: false,
      supportsStreaming: true,
      rateLimit: 10,
      priority: 10,
    },
  ],
}
