// Multi-account API key rotation system
// Rotates through multiple API keys per provider to maximize daily rate limits

interface ProviderConfig {
  keys: (string | undefined)[];
  currentIndex: number;
  name: string;
  dailyLimit: number;
}

class ModelRouter {
  private providers: Record<string, ProviderConfig> = {
    groq: {
      keys: [
        process.env.GROQ_API_KEY_1,
        process.env.GROQ_API_KEY_2,
        process.env.GROQ_API_KEY_3,
      ],
      currentIndex: 0,
      name: 'Groq',
      dailyLimit: 14400 * 3, // 3 keys × 14.4k each
    },
    gemini: {
      keys: [
        process.env.GEMINI_API_KEY_1,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
      ],
      currentIndex: 0,
      name: 'Gemini',
      dailyLimit: 1500 * 3, // 3 projects × 1.5k each
    },
    openrouter: {
      keys: [
        process.env.OPENROUTER_API_KEY_1,
        process.env.OPENROUTER_API_KEY_2,
      ],
      currentIndex: 0,
      name: 'OpenRouter',
      dailyLimit: 10000, // $1 credit per account
    },
    sambanova: {
      keys: [process.env.SAMBANOVA_API_KEY_1],
      currentIndex: 0,
      name: 'SambaNova',
      dailyLimit: 600,
    },
    cloudflare: {
      keys: [
        process.env.CF_API_TOKEN_1,
        process.env.CF_API_TOKEN_2,
      ],
      currentIndex: 0,
      name: 'Cloudflare',
      dailyLimit: 10000 * 2, // 2 tokens × 10k each
    },
  };

  /**
   * Get next available key for provider, rotating through all keys
   */
  getNextKey(provider: string): string | null {
    const config = this.providers[provider];
    if (!config) return null;

    // Filter out undefined keys
    const validKeys = config.keys.filter((k): k is string => !!k);
    if (validKeys.length === 0) return null;

    // Rotate to next key
    config.currentIndex = (config.currentIndex + 1) % validKeys.length;
    return validKeys[config.currentIndex];
  }

  /**
   * Get current key without rotating
   */
  getCurrentKey(provider: string): string | null {
    const config = this.providers[provider];
    if (!config) return null;

    const validKeys = config.keys.filter((k): k is string => !!k);
    if (validKeys.length === 0) return null;

    return validKeys[config.currentIndex] || null;
  }

  /**
   * Check if provider has any configured keys
   */
  hasProvider(provider: string): boolean {
    const config = this.providers[provider];
    if (!config) return false;
    return config.keys.some((k) => !!k);
  }

  /**
   * Get provider config info
   */
  getProviderInfo(provider: string) {
    const config = this.providers[provider];
    if (!config) return null;

    const validKeyCount = config.keys.filter((k) => !!k).length;
    return {
      name: config.name,
      availableKeys: validKeyCount,
      dailyLimit: config.dailyLimit,
      requestsPerKey: Math.floor(config.dailyLimit / validKeyCount),
    };
  }

  /**
   * Log rate limit hit to tracking table
   */
  async logRateLimitHit(provider: string, keyIndex: number) {
    try {
      // This will be implemented in Supabase integration
      console.log(`[v0] Rate limit hit for ${provider} key ${keyIndex}`)
    } catch (e) {
      console.error('[v0] Failed to log rate limit:', e)
    }
  }

  /**
   * Get all configured providers
   */
  getAvailableProviders(): string[] {
    return Object.entries(this.providers)
      .filter(([_, config]) => config.keys.some((k) => !!k))
      .map(([name]) => name);
  }

  /**
   * Calculate total daily request capacity
   */
  getTotalCapacity(): number {
    return Object.values(this.providers).reduce((sum, config) => {
      return sum + config.dailyLimit;
    }, 0);
  }
}

export const modelRouter = new ModelRouter();

/**
 * Model tier definitions with provider priority
 */
export const modelTiers = {
  nano: {
    name: 'Zero Nano',
    providers: ['gemini', 'cloudflare', 'openrouter'],
    dailyLimit: 3000,
    freeOnly: true,
  },
  smart: {
    name: 'Zero Smart',
    providers: ['cloudflare', 'openrouter', 'groq'],
    dailyLimit: 20000,
    freeOnly: true,
  },
  prime: {
    name: 'Zero Prime',
    providers: ['groq', 'gemini', 'cloudflare'],
    dailyLimit: 25000,
    freeOnly: true,
  },
  apex: {
    name: 'Zero Apex',
    providers: ['gemini', 'sambanova', 'openrouter'],
    dailyLimit: 1200,
    proOnly: true,
  },
  agentic: {
    name: 'Agentic Chad',
    providers: ['gemini', 'groq'],
    dailyLimit: 800,
    ultraOnly: true,
  },
};

export type ModelTier = keyof typeof modelTiers;
