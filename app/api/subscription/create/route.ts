const PLANS = {
  prime: { amount: 9900, name: "Zero Prime", period: "monthly" },
  apex: { amount: 29900, name: "Zero Apex", period: "monthly" },
  agent: { amount: 99900, name: "Zero Agent CEO", period: "monthly" },
}

export async function POST(req: Request) {
  const { plan, userId } = await req.json()
  const planConfig = PLANS[plan as keyof typeof PLANS]
  if (!planConfig) return Response.json({ error: "Invalid plan" }, { status: 400 })

  const credentials = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  ).toString("base64")

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify({
      amount: planConfig.amount,
      currency: "INR",
      receipt: `zero_${userId}_${Date.now()}`,
      notes: { userId, plan },
    }),
  })

  const order = await res.json()
  return Response.json({
    orderId: order.id,
    amount: planConfig.amount,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID,
    planName: planConfig.name,
  })
}
