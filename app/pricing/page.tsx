'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Zap, Crown, Sparkles, Globe, CreditCard, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PricingData {
  country: string
  country_name: string
  currency: string
  symbol: string
  pro:   { amount: number; display: string; period: string }
  ultra: { amount: number; display: string; period: string }
  provider: 'razorpay' | 'stripe'
}

// Default = INR pricing
const DEFAULT: PricingData = {
  country: 'IN', country_name: 'India',
  currency: 'INR', symbol: '₹',
  pro:   { amount: 29900, display: '₹299',  period: 'month' },
  ultra: { amount: 499900, display: '₹4,999', period: 'month' },
  provider: 'razorpay',
}

// USD fallback for non-India
const USD_DEFAULT: PricingData = {
  country: 'US', country_name: 'United States',
  currency: 'USD', symbol: '$',
  pro:   { amount: 399,   display: '$3.99',  period: 'month' },
  ultra: { amount: 5999,  display: '$59.99', period: 'month' },
  provider: 'stripe',
}

const plans = [
  {
    key: 'free' as const,
    name: 'Free',
    icon: Sparkles,
    color: 'text-text-2',
    glowClass: '',
    features: [
      'Zero Nano — 10 messages/day',
      'Zero Prime — 5 messages/day',
      'Zero Apex — 3 messages/day',
      'Zero Pico — unlimited (on-device)',
      '50 memories stored',
      'App Factory — 1 app/day',
      'Basic chat history',
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    key: 'pro' as const,
    name: 'Pro',
    icon: Zap,
    color: 'text-zero-300',
    glowClass: 'border-zero-300 shadow-lg shadow-zero-300/10',
    features: [
      'Zero Nano — 200 messages/day',
      'Zero Prime — 100 messages/day',
      'Zero Apex — 50 messages/day',
      'Zero Pico — unlimited (on-device)',
      '2,000 memories stored',
      'App Factory — 20 apps/day',
      'Priority generation queue',
      'Image generation (100/day)',
      'Export memory to MCP',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    key: 'ultra' as const,
    name: 'Ultra',
    icon: Crown,
    color: 'text-amber-400',
    glowClass: 'border-amber-400/40 shadow-lg shadow-amber-400/10',
    features: [
      'Everything in Pro — unlimited',
      'Agentic Chad — autonomous AI',
      'Unlimited memories',
      'Unlimited App Factory',
      'Unlimited image generation',
      'Web search & live data',
      'Priority support (24h)',
      'Early access to new models',
    ],
    cta: 'Upgrade to Ultra',
    popular: false,
  },
]

const faqs = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, cancel any time. Your plan stays active until the end of the billing period.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'India: UPI, cards, netbanking via Razorpay. International: all major cards via Stripe. Instant activation.',
  },
  {
    q: 'Do daily limits reset?',
    a: 'Yes — all usage limits reset daily at midnight UTC regardless of plan.',
  },
  {
    q: 'What is Zero Pico?',
    a: 'Pico runs 100% on your device using WebGPU — completely free, no server costs, always unlimited.',
  },
  {
    q: 'Is my data private?',
    a: 'Your conversations are encrypted in Supabase. We never use your data to train models. Memory can be deleted anytime.',
  },
]

function PriceDisplay({ pricing, plan, cycle }: {
  pricing: PricingData
  plan: 'pro' | 'ultra'
  cycle: 'monthly' | 'yearly'
}) {
  const base = pricing[plan]
  if (cycle === 'yearly') {
    const yearly = Math.floor((base.amount * 10) / 100)
    return (
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-black text-text-1">
          {pricing.symbol}{yearly.toLocaleString()}
        </span>
        <span className="text-text-3 text-sm">/year</span>
        <span className="ml-2 rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-bold text-green-400">Save 17%</span>
      </div>
    )
  }
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-4xl font-black text-text-1">{base.display}</span>
      <span className="text-text-3 text-sm">/month</span>
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border border-border bg-bg-1 overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-medium text-text-1">{q}</span>
        {open
          ? <ChevronUp className="h-4 w-4 text-text-3 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-text-3 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-text-2 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function PricingPage() {
  const [pricing, setPricing] = useState<PricingData>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    async function fetchPricing() {
      try {
        const res = await fetch('/api/subscription/pricing')
        if (res.ok) {
          const data = await res.json()
          setPricing(data)
        }
      } catch {
        // Keep default INR
      } finally {
        setLoading(false)
      }
    }
    fetchPricing()
  }, [])

  return (
    <div className="min-h-screen bg-bg-0">
      <header className="sticky top-0 z-10 border-b border-border bg-bg-1/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
          <Link href="/chat" className="text-text-2 hover:text-text-1 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold text-text-1">Pricing</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-bg-1 px-4 py-1.5 text-sm text-text-2">
            <Globe className="h-4 w-4" />
            {loading ? 'Detecting location…' : `Prices for ${pricing.country_name} via ${pricing.provider === 'razorpay' ? 'Razorpay' : 'Stripe'}`}
          </div>
          <h1 className="mb-4 text-5xl font-black tracking-tight text-text-1">
            Simple, honest pricing
          </h1>
          <p className="mx-auto max-w-xl text-lg text-text-2">
            Start free. Upgrade when you hit limits. Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={cn('text-sm', cycle === 'monthly' ? 'text-text-1 font-medium' : 'text-text-3')}>Monthly</span>
            <button
              onClick={() => setCycle(c => c === 'monthly' ? 'yearly' : 'monthly')}
              className={cn(
                'relative h-7 w-14 rounded-full transition-colors',
                cycle === 'yearly' ? 'bg-zero-300' : 'bg-bg-2'
              )}
            >
              <span className={cn(
                'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
                cycle === 'yearly' ? 'translate-x-7' : 'translate-x-0.5'
              )} />
            </button>
            <span className={cn('text-sm flex items-center gap-1.5', cycle === 'yearly' ? 'text-text-1 font-medium' : 'text-text-3')}>
              Yearly
              <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-bold text-green-400">Save 17%</span>
            </span>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid gap-6 lg:grid-cols-3 mb-20">
          {plans.map(plan => {
            const Icon = plan.icon
            return (
              <div
                key={plan.key}
                className={cn(
                  'relative flex flex-col rounded-3xl border p-7 transition-all',
                  plan.popular
                    ? 'border-zero-300 bg-bg-1 shadow-xl shadow-zero-300/10 scale-[1.02]'
                    : 'border-border bg-bg-1 hover:border-border-hover',
                  plan.glowClass
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-zero-300 px-5 py-1 text-xs font-bold text-bg-0">
                    Most Popular
                  </div>
                )}

                {/* Icon + name */}
                <div className="mb-5">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-2">
                    <Icon className={cn('h-6 w-6', plan.color)} />
                  </div>
                  <h3 className="text-xl font-bold text-text-1">Zero {plan.name}</h3>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {plan.key === 'free' ? (
                    <div className="text-4xl font-black text-text-1">Free</div>
                  ) : (
                    <PriceDisplay pricing={pricing} plan={plan.key} cycle={cycle} />
                  )}
                </div>

                {/* Features */}
                <ul className="mb-8 flex-1 space-y-2.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-zero-300" />
                      <span className="text-sm text-text-2">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className={cn(
                    'w-full rounded-2xl py-3.5 text-sm font-bold transition-all',
                    plan.key === 'free'
                      ? 'cursor-default bg-bg-2 text-text-3'
                      : plan.key === 'ultra'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-[1.02] shadow-lg shadow-amber-500/20'
                      : 'bg-zero-300 text-bg-0 hover:bg-zero-400 hover:scale-[1.02]'
                  )}
                  disabled={plan.key === 'free'}
                >
                  <span className="flex items-center justify-center gap-2">
                    {plan.key !== 'free' && <CreditCard className="h-4 w-4" />}
                    {plan.cta}
                  </span>
                </button>

                {plan.key !== 'free' && (
                  <p className="mt-3 text-center text-xs text-text-3">
                    {pricing.provider === 'razorpay' ? 'Paid via Razorpay · UPI supported' : 'Paid via Stripe · All cards'}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-text-1">FAQ</h2>
          <div className="space-y-3">
            {faqs.map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </main>
    </div>
  )
}
