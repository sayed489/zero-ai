import { generateImage } from "@/lib/imageGen"

export async function POST(req: Request) {
  const { prompt } = await req.json()
  const result = await generateImage(prompt)
  return Response.json(result)
}
