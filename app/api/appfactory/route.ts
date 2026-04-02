import { buildApp } from "@/lib/appFactory"

export async function POST(req: Request) {
  const { description, complexity } = await req.json()
  if (!description) return Response.json({ error: "No description" }, { status: 400 })
  const result = await buildApp(description, complexity || 'simple')
  return Response.json(result)
}
