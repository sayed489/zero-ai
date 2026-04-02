import { Redis } from "@upstash/redis"

class MockRedis {
  async get() { return null }
  async set() { return 'OK' }
  async incr() { return 1 }
  async expire() { return 1 }
}

const isConfigured = process.env.UPSTASH_REDIS_URL?.startsWith('http')

export const redis = isConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_URL!,
      token: process.env.UPSTASH_REDIS_TOKEN!,
    })
  : (new MockRedis() as unknown as Redis)
