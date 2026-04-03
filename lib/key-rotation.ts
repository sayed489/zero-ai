/**
 * KeyRotator — Round-robin API key rotation with per-key cooldown on rate limits.
 * When a key hits a 429, it's skipped for `cooldownMs` then re-added automatically.
 */
export class KeyRotator {
  private keys: string[]
  private index: number = 0
  private cooldowns: Map<string, number> = new Map()
  private readonly cooldownMs: number

  constructor(keys: (string | undefined)[], cooldownMs = 60_000) {
    this.keys = keys.filter((k): k is string => !!k && !k.startsWith('your-'))
    this.cooldownMs = cooldownMs
  }

  /** Returns the next healthy key, skipping cooled-down ones */
  getNextKey(): string {
    const healthy = this.getHealthyKeys()
    if (healthy.length === 0) {
      // All keys on cooldown — return least-recently failed key
      const now = Date.now()
      const sorted = this.keys
        .map(k => ({ key: k, expiry: this.cooldowns.get(k) || 0 }))
        .sort((a, b) => a.expiry - b.expiry)
      return sorted[0]?.key || ''
    }
    const key = healthy[this.index % healthy.length]
    this.index = (this.index + 1) % healthy.length
    return key
  }

  /** Mark a key as failed — puts it on cooldown */
  markKeyFailed(key: string): void {
    this.cooldowns.set(key, Date.now() + this.cooldownMs)
    console.warn(`[KeyRotator] Key …${key.slice(-6)} on cooldown for ${this.cooldownMs / 1000}s`)
  }

  /** How many keys are currently available (not on cooldown) */
  getHealthyKeyCount(): number {
    return this.getHealthyKeys().length
  }

  /** Total number of keys registered */
  getTotalKeyCount(): number {
    return this.keys.length
  }

  /** Whether any keys are available at all */
  hasKeys(): boolean {
    return this.keys.length > 0
  }

  private getHealthyKeys(): string[] {
    const now = Date.now()
    return this.keys.filter(k => {
      const expiry = this.cooldowns.get(k)
      if (!expiry || now > expiry) {
        if (expiry) this.cooldowns.delete(k)
        return true
      }
      return false
    })
  }
}

// ---------------------------------------------------------------------------
// Pre-built rotators (singleton per process)
// ---------------------------------------------------------------------------

export const siliconFlowRotator = new KeyRotator([
  process.env.SILICONFLOW_API_KEY_1,
  process.env.SILICONFLOW_API_KEY_2,
  process.env.SILICONFLOW_API_KEY_3,
  process.env.SILICONFLOW_API_KEY_4,
  process.env.SILICONFLOW_API_KEY_5,
  process.env.SILICONFLOW_API_KEY_6,
])

export const geminiFlashRotator = new KeyRotator([
  process.env.GEMINI_FLASH_KEY_1,
  process.env.GEMINI_FLASH_KEY_2,
  process.env.GEMINI_FLASH_KEY_3,
  process.env.GEMINI_FLASH_KEY_4,
])

export const gemini25FlashRotator = new KeyRotator([
  process.env.GEMINI_2_5_FLASH_KEY_1,
  process.env.GEMINI_2_5_FLASH_KEY_2,
])

export const fireworksRotator = new KeyRotator([
  process.env.FIREWORKS_API_KEY_1,
  process.env.FIREWORKS_API_KEY_2,
  process.env.FIREWORKS_API_KEY_3,
  process.env.FIREWORKS_API_KEY_4,
  process.env.FIREWORKS_API_KEY_5,
  process.env.FIREWORKS_API_KEY_6,
])

export const cerebrasRotator = new KeyRotator([
  process.env.CEREBRAS_API_KEY_1,
  process.env.CEREBRAS_API_KEY_2,
  process.env.CEREBRAS_API_KEY_3,
  process.env.CEREBRAS_API_KEY_4,
])

export const githubRotator = new KeyRotator([
  process.env.GITHUB_TOKEN_1,
  process.env.GITHUB_TOKEN_2,
])

export const openrouterRotator = new KeyRotator([
  process.env.OPENROUTER_API_KEY_1,
  process.env.OPENROUTER_API_KEY_2,
])
