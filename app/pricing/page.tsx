'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Zap, Crown, Sparkles } from 'lucide-react'
import { ZeroMascot } from '@/components/mascot/zero-mascot'
import type { PricingInfo } from '@/lib/types'
import { cn } from '@/lib/utils'

const defaultPricing: PricingInfo = {
  country: 'IN',
  country_name: 'India',
  currency: 'INR',
  symbol: 'Rs',
  pro: { amount: 9900, display: 'Rs 99', period: 'month' },
  ultra: { amount: 29900, display: 'Rs 299', period: 'month' },
  provider: 'razorpay',
}

const plans = {
  free: {
    name: 'Free',
    description: 'Get started with Zero AI',
    icon: Sparkles,
    features: [
      '30 messages per day',
      '5 image generations per day',
      '50 memory facts',
      'All AI models access',
      'Basic chat history',
    ],
    cta: 'Current Plan',
    popular: false,
  },
  pro: {
    name: 'Pro',
    description: 'For power users',
    icon: Zap,
    features: [
      '500 messages per day',
      '100 image generations per day',
      '2,000 memory facts',
      'Voice input & output',
      'Memory export (MCP)',
      'Compare AI models',
      'Priority queue',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  ultra: {
    name: 'Ultra',
    description: 'Unlimited everything',
    icon: Crown,
    features: [
      'Unlimited messages',
      'Unlimited image generations',
      'Unlimited memory',
      'Voice input & output',
      'Memory export (MCP)',
      'Compare AI models',
      'Priority support',
      'Early access to features',
    ],
    cta: 'Upgrade to Ultra',
    popular: false,
  },
}

export default function PricingPage() {
  const [pricing, setPricing] = useState<PricingInfo>(defaultPricing)
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    async function fetchPricing() {
      try {
        const res = await fetch('/api/subscription/pricing')
        if (res.ok) {
          const data = await res.json()
          setPricing(data)
        }
      } catch {
        // Keep default
      } finally {
        setLoading(false)
      }
    }
    fetchPricing()
  }, [])

  const getPrice = (plan: 'pro' | 'ultra') => {
    if (loading) return '...'
    const price = pricing[plan].display
    if (billingCycle === 'yearly') {
      // 20% discount for yearly
      const amount = pricing[plan].amount * 10 // 10 months instead of 12
      return `${pricing.symbol} ${Math.round(amount / 100)}`
    }
    return price
  }

  return (
    <div className="min-h-screen bg-bg-0">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-bg-1/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
          <Link
            href="/chat"
            className="flex items-center gap-2 text-text-2 hover:text-text-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <ZeroMascot size={32} state="idle" />
          <h1 className="text-lg font-medium text-text-1">Pricing</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-light text-text-1 md:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto max-w-lg text-lg text-text-2">
            Choose the plan that works best for you. All plans include access to all AI models.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={cn('text-sm', billingCycle === 'monthly' ? 'text-text-1' : 'text-text-3')}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative h-7 w-14 rounded-full bg-bg-2"
            >
              <span
                className={cn(
                  'absolute top-0.5 h-6 w-6 rounded-full bg-zero-300 transition-transform',
                  billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0.5'
                )}
              />
            </button>
            <span className={cn('text-sm', billingCycle === 'yearly' ? 'text-text-1' : 'text-text-3')}>
              Yearly
              <span className="ml-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Country notice */}
        {!loading && (
          <div className="mb-8 text-center">
            <p className="text-sm text-text-3">
              Prices shown for {pricing.country_name} via {pricing.provider === 'razorpay' ? 'Razorpay' : 'Stripe'}
            </p>
          </div>
        )}

        {/* Pricing cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {(Object.entries(plans) as [keyof typeof plans, typeof plans.free][]).map(([key, plan]) => {
            const Icon = plan.icon
            const isPaid = key !== 'free'

            return (
              <div
                key={key}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-6',
                  plan.popular
                    ? 'border-zero-300 bg-zero-glow'
                    : 'border-border bg-bg-1'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-zero-300 px-4 py-1 text-xs font-medium text-bg-0">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-zero-300/20">
                    <Icon className="h-6 w-6 text-zero-300" />
                  </div>
                  <h3 className="text-xl font-medium text-text-1">{plan.name}</h3>
                  <p className="mt-1 text-sm text-text-2">{plan.description}</p>
                </div>

                <div className="mb-6">
                  {key === 'free' ? (
                    <div className="text-4xl font-light text-text-1">Free</div>
                  ) : (
                    <div>
                      <span className="text-4xl font-light text-text-1">
                        {getPrice(key as 'pro' | 'ultra')}
                      </span>
                      <span className="text-text-2">
                        /{billingCycle === 'yearly' ? 'year' : 'month'}
                      </span>
                    </div>
                  )}
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-zero-300" />
                      <span className="text-sm text-text-2">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={cn(
                    'w-full rounded-xl py-3 text-sm font-medium transition-colors',
                    key === 'free'
                      ? 'cursor-default bg-bg-2 text-text-3'
                      : 'bg-zero-300 text-bg-0 hover:bg-zero-400'
                  )}
                  disabled={key === 'free'}
                >
                  {plan.cta}
                </button>
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="mb-8 text-center text-2xl font-light text-text-1">
            Frequently Asked Questions
          </h2>

          <div className="mx-auto max-w-2xl space-y-4">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes, you can cancel your subscription at any time. Your plan will remain active until the end of your billing period.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, debit cards, and UPI (for India). Payment processing is handled securely by Stripe or Razorpay based on your location.',
              },
              {
                q: 'Is my data private?',
                a: 'Yes, your conversations and memories are encrypted and stored securely. We never share your data with third parties or use it to train AI models.',
              },
              {
                q: 'What happens if I exceed my limits?',
                a: "You'll be prompted to upgrade or wait for your limits to reset. Free plan limits reset daily, while paid plans have much higher or unlimited limits.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl border border-border bg-bg-1 p-4"
              >
                <h3 className="mb-2 font-medium text-text-1">{faq.q}</h3>
                <p className="text-sm text-text-2">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
