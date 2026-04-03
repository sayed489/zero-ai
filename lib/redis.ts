import { Redis } from "@upstash/redis"

class MockRedis {
  async get() { return null }
  async set() { return 'OK' }
  async incr() { return 1 }
  async expire() { return 1 }
  async del() { return 1 }
}

const isConfigured =
  process.env.UPSTASH_REDIS_REST_URL?.startsWith('http') &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  !process.env.UPSTASH_REDIS_REST_TOKEN.startsWith('your-')

export const redis = isConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : (new MockRedis() as unknown as Redis)
