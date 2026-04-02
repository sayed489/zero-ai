import { search } from "@/lib/search"

export async function POST(req: Request) {
  const { query } = await req.json()
  const results = await search(query)
  return Response.json({ results })
}
