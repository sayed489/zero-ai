import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("x-razorpay-signature")

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex")

  if (signature !== expected) {
    return Response.json({ error: "Invalid signature" }, { status: 400 })
  }

  const event = JSON.parse(body)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (event.event === "payment.captured") {
    const { userId, plan } = event.payload.payment.entity.notes
    await supabase.from("subscriptions").upsert({
      user_id: userId,
      plan,
      status: "active",
      razorpay_payment_id: event.payload.payment.entity.id,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { plan },
    })
  }

  return Response.json({ received: true })
}
