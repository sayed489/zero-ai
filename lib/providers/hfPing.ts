import { redis } from "@/lib/redis"

const HF_SPACES = {
  prime: [
    process.env.HF_SPACE_PRIME_1,
    process.env.HF_SPACE_PRIME_2,
    process.env.HF_SPACE_PRIME_3,
    process.env.HF_SPACE_PRIME_4,
    process.env.HF_SPACE_PRIME_5,
    process.env.HF_SPACE_PRIME_6,
  ].filter(Boolean) as string[],
  apex: [
    process.env.HF_SPACE_APEX_1,
    process.env.HF_SPACE_APEX_2,
    process.env.HF_SPACE_APEX_3,
    process.env.HF_SPACE_APEX_4,
  ].filter(Boolean) as string[],
}

// Rotate space every 50 hours (180,000,000 ms) to spread load and avoid quota bans
const ROTATION_INTERVAL_MS = 50 * 60 * 60 * 1000

export async function pingAllSpaces() {
  const results: { space: string; status: string; latency?: number; error?: string; wakeRes?: number }[] = []
  const now = Date.now()

  for (const [tier, spaces] of Object.entries(HF_SPACES)) {
    if (spaces.length === 0) continue

    // Sequential rotation: Determine current active space for this tier based on epoch time.
    // This naturally rotates to the next index in the array every 50 hours.
    const currentIndex = Math.floor(now / ROTATION_INTERVAL_MS) % spaces.length
    const activeSpace = spaces[currentIndex]

    // Save the globally active space for the router to use
    await redis.set(`hf:${tier}:current`, activeSpace)

    const url = `https://${activeSpace.replace("/", "-")}.hf.space`
    const redisKey = `hf:space:${activeSpace}:status`

    try {
      const start = Date.now()
      const res = await fetch(`${url}/`, {
        signal: AbortSignal.timeout(8000),
        method: "HEAD",
      })
      const latency = Date.now() - start

      if (res.ok || res.status === 200) {
        await redis.set(redisKey, "awake", { ex: 300 })
        await redis.set(`hf:space:${activeSpace}:latency`, latency)
        results.push({ space: activeSpace, status: "awake", latency })
      } else if (res.status === 503 || res.status === 404) {
        // Space sleeping — wake it
        await redis.set(redisKey, "waking", { ex: 120 })
        const wakeRes = await fetch(`${url}/api/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: ["ping"] }),
        })
        results.push({ space: activeSpace, status: "waking", wakeRes: wakeRes.status })
      }
    } catch (err: any) {
      await redis.set(redisKey, "sleeping", { ex: 60 })
      results.push({ space: activeSpace, status: "sleeping", error: err.message })
    }
  }
  return results
}

// Auto-wake a specific space
export async function wakeSpace(spaceId: string) {
  const token = process.env.HF_TOKEN_1

  await fetch(`https://huggingface.co/api/spaces/${spaceId}/restart`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {})
}
