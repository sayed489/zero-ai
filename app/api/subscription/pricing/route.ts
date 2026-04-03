// /api/subscription/pricing
// Returns geo-aware pricing based on IP country

export const runtime = "edge"

// Country → pricing map
const PRICING: Record<string, {
  currency: string
  symbol: string
  country_name: string
  pro_amount: number
  pro_display: string
  ultra_amount: number
  ultra_display: string
  provider: "razorpay" | "stripe"
}> = {
  // India — Razorpay, INR
  IN: {
    currency: "INR", symbol: "₹", country_name: "India",
    pro_amount: 29900,    pro_display: "₹299",
    ultra_amount: 499900, ultra_display: "₹4,999",
    provider: "razorpay",
  },
  // United States
  US: {
    currency: "USD", symbol: "$", country_name: "United States",
    pro_amount: 399,    pro_display: "$3.99",
    ultra_amount: 5999, ultra_display: "$59.99",
    provider: "stripe",
  },
  // UK
  GB: {
    currency: "GBP", symbol: "£", country_name: "United Kingdom",
    pro_amount: 349,    pro_display: "£3.49",
    ultra_amount: 4999, ultra_display: "£49.99",
    provider: "stripe",
  },
  // EU countries → EUR
  DE: { currency: "EUR", symbol: "€", country_name: "Germany",      pro_amount: 399, pro_display: "€3.99", ultra_amount: 5499, ultra_display: "€54.99", provider: "stripe" },
  FR: { currency: "EUR", symbol: "€", country_name: "France",       pro_amount: 399, pro_display: "€3.99", ultra_amount: 5499, ultra_display: "€54.99", provider: "stripe" },
  NL: { currency: "EUR", symbol: "€", country_name: "Netherlands",  pro_amount: 399, pro_display: "€3.99", ultra_amount: 5499, ultra_display: "€54.99", provider: "stripe" },
  // Canada
  CA: { currency: "CAD", symbol: "CA$", country_name: "Canada",    pro_amount: 549, pro_display: "CA$5.49", ultra_amount: 7999, ultra_display: "CA$79.99", provider: "stripe" },
  // Australia
  AU: { currency: "AUD", symbol: "A$", country_name: "Australia",   pro_amount: 599, pro_display: "A$5.99", ultra_amount: 8999, ultra_display: "A$89.99", provider: "stripe" },
  // Southeast Asia — slightly lower
  SG: { currency: "SGD", symbol: "S$", country_name: "Singapore",   pro_amount: 549, pro_display: "S$5.49", ultra_amount: 7999, ultra_display: "S$79.99", provider: "stripe" },
  PH: { currency: "PHP", symbol: "₱", country_name: "Philippines",  pro_amount: 21900, pro_display: "₱219", ultra_amount: 299900, ultra_display: "₱2,999", provider: "stripe" },
  MY: { currency: "MYR", symbol: "RM", country_name: "Malaysia",    pro_amount: 1900, pro_display: "RM19", ultra_amount: 26900, ultra_display: "RM269", provider: "stripe" },
  ID: { currency: "IDR", symbol: "Rp", country_name: "Indonesia",   pro_amount: 6500000, pro_display: "Rp65.000", ultra_amount: 94900000, ultra_display: "Rp949.000", provider: "stripe" },
  BD: { currency: "BDT", symbol: "৳",  country_name: "Bangladesh",  pro_amount: 45000, pro_display: "৳450", ultra_amount: 649900, ultra_display: "৳6,499", provider: "stripe" },
  PK: { currency: "PKR", symbol: "Rs", country_name: "Pakistan",    pro_amount: 110000, pro_display: "Rs1,100", ultra_amount: 1699900, ultra_display: "Rs16,999", provider: "stripe" },
  LK: { currency: "LKR", symbol: "Rs", country_name: "Sri Lanka",   pro_amount: 120000, pro_display: "Rs1,200", ultra_amount: 1799900, ultra_display: "Rs17,999", provider: "stripe" },
}

const DEFAULT_COUNTRY = "US"

export async function GET(request: Request) {
  // Get country from Vercel/Cloudflare geo headers
  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country-code") ||
    DEFAULT_COUNTRY

  const data = PRICING[country.toUpperCase()] || PRICING[DEFAULT_COUNTRY]

  return Response.json(
    {
      country: country.toUpperCase(),
      country_name: data.country_name,
      currency: data.currency,
      symbol: data.symbol,
      pro: {
        amount: data.pro_amount,
        display: data.pro_display,
        period: "month",
      },
      ultra: {
        amount: data.ultra_amount,
        display: data.ultra_display,
        period: "month",
      },
      provider: data.provider,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    }
  )
}
