import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  const { promptHash, winner, modelA, modelB, modelC, userId } = await req.json()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  await supabase.from("comparison_votes").insert({
    user_id: userId,
    prompt_hash: promptHash,
    winner,
    model_a: modelA,
    model_b: modelB,
    model_c: modelC,
  })
  return Response.json({ saved: true })
}
