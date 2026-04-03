'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import type { PricingInfo } from '@/lib/types'

const defaultPricing: PricingInfo = {
  country: 'IN',
  country_name: 'India',
  currency: 'INR',
  symbol: 'Rs',
  pro: { amount: 9900, display: 'Rs 99', period: 'month' },
  ultra: { amount: 29900, display: 'Rs 299', period: 'month' },
  provider: 'razorpay',
}

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Get started free',
    priceDisplay: '$0',
    features: [
      'Zero Pico (Local, unlimited)',
      'Zero Nano (Accelerated)',
      'Zero Prime (15/day)',
      '5 image generations',
      '50 memory facts',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For power users',
    popular: true,
    features: [
      'Everything in Starter',
      'Zero Apex (30/day)',
      '200 messages/day',
      '100 image generations',
      '2,000 memory facts',
      'Voice input & output',
      'Memory export (MCP)',
    ],
  },
  {
    id: 'ultra',
    name: 'Ultra',
    description: 'Unlimited power',
    features: [
      'Everything in Pro',
      'Agentic Chad (unlimited)',
      'Unlimited messages',
      'Unlimited images',
      'Unlimited memory',
      'Priority access',
      'Priority support',
    ],
  },
]

export function PricingSection() {
  const [pricing, setPricing] = useState<PricingInfo>(defaultPricing)
  const [loading, setLoading] = useState(true)
  const [isYearly, setIsYearly] = useState(false)

  useEffect(() => {
    async function fetchPricing() {
      try {
        const res = await fetch('/api/subscription/pricing')
        if (res.ok) {
          const data = await res.json()
          setPricing(data)
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }
    fetchPricing()
  }, [])

  const getPrice = (planId: string) => {
    if (planId === 'starter') return '$0'
    const planInfo = planId === 'pro' ? pricing.pro : pricing.ultra
    
    // Simulate yearly discount (20% off) for display
    if (isYearly && planInfo.amount) {
       const monthlyRaw = planInfo.amount / 100
       const yearlyDisplay = Math.floor(monthlyRaw * 0.8)
       return `${pricing.symbol} ${yearlyDisplay}`
    }
    return planInfo.display || ''
  }

  return (
    <section id="pricing" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-light text-text-1 md:text-4xl">Simple pricing</h2>
          <p className="text-lg text-text-2">
            {loading ? 'Loading prices...' : `Prices for ${pricing.country_name}`}
          </p>
        </div>
        <div className="mb-12 flex items-center justify-center gap-4">
          <span className={`text-sm font-medium ${!isYearly ? 'text-text-1' : 'text-text-3'}`}>Monthly</span>
          <button 
            onClick={() => setIsYearly(!isYearly)}
            className="relative h-8 w-14 rounded-full bg-bg-2 p-1 transition-colors hover:bg-bg-3 border border-border"
          >
            <div className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-zero-300 transition-transform ${isYearly ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-sm font-medium flex items-center gap-1.5 ${isYearly ? 'text-text-1' : 'text-text-3'}`}>
            Yearly <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500 uppercase">Save 20%</span>
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                plan.popular
                  ? 'border-zero-300 bg-bg-1 shadow-lg shadow-zero-glow'
                  : 'border-border bg-bg-1 hover:border-border-hover'
              }`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-zero-300 px-3 py-1 text-xs font-medium text-bg-0">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="mb-1 text-xl font-medium text-text-1">{plan.name}</h3>
                <p className="text-sm text-text-2">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-light text-text-1">
                  {loading && plan.id !== 'starter' ? '...' : getPrice(plan.id)}
                </span>
                {plan.id !== 'starter' && <span className="text-text-2">/month</span>}
              </div>
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-zero-300" />
                    <span className="text-sm text-text-2">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full rounded-xl py-3 text-sm font-medium transition-all ${
                plan.popular
                  ? 'bg-zero-300 text-bg-0 hover:bg-zero-400'
                  : 'border border-border text-text-1 hover:border-border-hover hover:bg-bg-2'
              }`}>
                {plan.id === 'starter' ? 'Get started' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
