export const runtime = "edge"

export async function POST(req: Request) {
  const { prompt, userId } = await req.json()

  const models = [
    {
      name: "Zero Prime (Qwen 7B)",
      endpoint: "https://api.siliconflow.cn/v1/chat/completions",
      apiKey: process.env.SILICONFLOW_KEY_1!,
      model: "Qwen/Qwen2.5-7B-Instruct",
    },
    {
      name: "Zero Apex (Qwen 72B)",
      endpoint: "https://api.fireworks.ai/inference/v1/chat/completions",
      apiKey: process.env.FIREWORKS_KEY!,
      model: "accounts/fireworks/models/qwen2p5-72b-instruct",
    },
    {
      name: "Gemini Flash",
      endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      apiKey: process.env.GEMINI_KEY!,
      model: "gemini-1.5-flash",
    },
  ]

  const results = await Promise.allSettled(
    models.map(async (model) => {
      const isGemini = model.endpoint.includes("googleapis")
      const body = isGemini
        ? {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1024 },
          }
        : {
            model: model.model,
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1024,
          }

      const res = await fetch(model.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(!isGemini && { Authorization: `Bearer ${model.apiKey}` }),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20000),
      })
      const data = await res.json()
      const text = isGemini
        ? data.candidates?.[0]?.content?.parts?.[0]?.text
        : data.choices?.[0]?.message?.content
      return { name: model.name, response: text || "No response", success: true }
    })
  )

  const responses = results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { name: models[i].name, response: "Failed to respond", success: false }
  )

  return Response.json({ responses })
}
