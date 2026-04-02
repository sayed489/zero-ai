export async function POST(req: Request) {
  const { text } = await req.json()
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_KEY!,
      },
      body: JSON.stringify({
        text: text.slice(0, 500),
        model_id: "eleven_turbo_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.8 },
      }),
    }
  )

  if (!res.ok) return Response.json({ error: "TTS failed" }, { status: 500 })

  return new Response(res.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Transfer-Encoding": "chunked",
    },
  })
}
