import { type NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File
  const sessionId = formData.get("sessionId") as string

  if (!file) return Response.json({ error: "No file" }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  let text = ""

  if (file.name.endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse")).default
    const data = await pdfParse(buffer)
    text = data.text
  } else if (file.name.endsWith(".docx")) {
    const mammoth = await import("mammoth")
    const result = await mammoth.extractRawText({ buffer })
    text = result.value
  } else if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
    text = buffer.toString("utf-8")
  } else if (file.name.endsWith(".csv")) {
    text = buffer.toString("utf-8")
  } else if (file.type.startsWith("image/")) {
    // Send to Gemini Vision
    const base64 = buffer.toString("base64")
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inline_data: { mime_type: file.type, data: base64 } },
                { text: "Describe and extract all text from this image in detail." },
              ],
            },
          ],
        }),
      }
    )
    const data = await res.json()
    text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
  }

  // Chunk into 2000 char pieces with 200 char overlap
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += 1800) {
    chunks.push(text.slice(Math.max(0, i - 200), i + 1800))
  }

  // Store in Redis with 2hr TTL
  const { redis } = await import("@/lib/redis")
  await redis.set(`session:${sessionId}:chunks`, JSON.stringify(chunks), { ex: 7200 })
  await redis.set(`session:${sessionId}:filename`, file.name, { ex: 7200 })

  return Response.json({
    success: true,
    chunks: chunks.length,
    filename: file.name,
    preview: text.slice(0, 300),
  })
}
