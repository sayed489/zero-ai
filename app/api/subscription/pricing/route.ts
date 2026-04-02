export const runtime = 'edge'

interface PricingConfig {
  currency: string
  symbol: string
  pro: { amount: number; display: string; period: string }
  ultra: { amount: number; display: string; period: string }
  provider: 'razorpay' | 'stripe'
}

const PRICING: Record<string, PricingConfig> = {
  IN: {
    currency: 'INR',
    symbol: 'Rs',
    pro: { amount: 9900, display: 'Rs 99', period: 'month' },
    ultra: { amount: 29900, display: 'Rs 299', period: 'month' },
    provider: 'razorpay',
  },
  US: {
    currency: 'USD',
    symbol: '$',
    pro: { amount: 499, display: '$4.99', period: 'month' },
    ultra: { amount: 999, display: '$9.99', period: 'month' },
    provider: 'stripe',
  },
  GB: {
    currency: 'GBP',
    symbol: '£',
    pro: { amount: 399, display: '£3.99', period: 'month' },
    ultra: { amount: 799, display: '£7.99', period: 'month' },
    provider: 'stripe',
  },
  EU: {
    currency: 'EUR',
    symbol: '€',
    pro: { amount: 449, display: '€4.49', period: 'month' },
    ultra: { amount: 899, display: '€8.99', period: 'month' },
    provider: 'stripe',
  },
  DEFAULT: {
    currency: 'USD',
    symbol: '$',
    pro: { amount: 299, display: '$2.99', period: 'month' },
    ultra: { amount: 599, display: '$5.99', period: 'month' },
    provider: 'stripe',
  },
}

const EU_COUNTRIES = [
  'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PL', 'PT', 'SE',
  'DK', 'FI', 'IE', 'CZ', 'RO', 'HU', 'GR', 'SK', 'BG', 'HR',
]

export async function GET(req: Request) {
  try {
    // Get country from header (set by Vercel Edge Network)
    const country = req.headers.get('x-vercel-ip-country') || 'US'
    
    let countryName = 'Unknown'
    let pricing: PricingConfig

    if (PRICING[country]) {
      pricing = PRICING[country]
      countryName = country
    } else if (EU_COUNTRIES.includes(country)) {
      pricing = PRICING.EU
      countryName = 'European Union'
    } else {
      pricing = PRICING.DEFAULT
      countryName = 'International'
    }

    return Response.json({
      country,
      country_name: countryName,
      ...pricing,
    })
  } catch (error) {
    console.error('Pricing API error:', error)
    return Response.json({
      country: 'US',
      country_name: 'United States',
      ...PRICING.DEFAULT,
    })
  }
}
