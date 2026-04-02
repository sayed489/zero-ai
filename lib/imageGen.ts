export async function generateImage(prompt: string): Promise<{ url: string; provider: string }> {
  const encoded = encodeURIComponent(prompt)
  const seed = Math.floor(Math.random() * 99999)

  // Primary: Pollinations (no key, handles 2000+ users)
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`

  try {
    const check = await fetch(pollinationsUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(15000),
    })
    if (check.ok) return { url: pollinationsUrl, provider: "pollinations" }
  } catch {}

  // Fallback 1: Stable Horde (free, community GPUs)
  try {
    const genRes = await fetch("https://stablehorde.net/api/v2/generate/async", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.STABLE_HORDE_KEY || "0000000000",
      },
      body: JSON.stringify({
        prompt,
        params: { width: 512, height: 512, steps: 20, sampler_name: "k_euler" },
        models: ["Deliberate"],
        r2: true,
      }),
    })
    const { id } = await genRes.json()
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 3000))
      const checkRes = await fetch(`https://stablehorde.net/api/v2/generate/status/${id}`)
      const status = await checkRes.json()
      if (status.done && status.generations?.[0]?.img) {
        return { url: status.generations[0].img, provider: "stable-horde" }
      }
    }
  } catch {}

  // Fallback 2: HF FLUX Schnell
  try {
    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN_1}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
        signal: AbortSignal.timeout(30000),
      }
    )
    if (hfRes.ok) {
      const blob = await hfRes.blob()
      const buffer = await blob.arrayBuffer()
      const base64 = Buffer.from(buffer).toString("base64")
      return { url: `data:image/jpeg;base64,${base64}`, provider: "hf-flux" }
    }
  } catch {}

  // Final fallback: Pollinations smaller
  return {
    url: `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&seed=${seed}`,
    provider: "pollinations-fallback",
  }
}
