'use client'

import { useState, useEffect } from 'react'
import { X, Check, Zap } from 'lucide-react'
import type { PricingInfo } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PricingModalProps {
  onClose: () => void
  highlightPlan?: 'pro' | 'ultra'
  reason?: string
}

const defaultPricing: PricingInfo = {
  country: 'IN',
  country_name: 'India',
  currency: 'INR',
  symbol: 'Rs',
  pro: { amount: 9900, display: 'Rs 99', period: 'month' },
  ultra: { amount: 29900, display: 'Rs 299', period: 'month' },
  provider: 'razorpay',
}

const planFeatures = {
  free: [
    '30 messages per day',
    '5 image generations',
    '50 memory facts',
    'All AI models',
  ],
  pro: [
    '500 messages per day',
    '100 image generations',
    '2,000 memory facts',
    'Voice input & output',
    'Memory export (MCP)',
    'Compare models',
  ],
  ultra: [
    'Unlimited messages',
    'Unlimited images',
    'Unlimited memory',
    'Voice input & output',
    'Memory export (MCP)',
    'Compare models',
    'Priority support',
  ],
}

export function PricingModal({ onClose, highlightPlan, reason }: PricingModalProps) {
  const [pricing, setPricing] = useState<PricingInfo>(defaultPricing)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'ultra'>(highlightPlan || 'pro')

  useEffect(() => {
    async function fetchPricing() {
      try {
        const res = await fetch('/api/subscription/pricing')
        if (res.ok) {
          const data = await res.json()
          setPricing(data)
        }
      } catch {
        // Keep default pricing
      } finally {
        setLoading(false)
      }
    }
    fetchPricing()
  }, [])

  const handleSubscribe = async () => {
    // Redirect to payment provider based on location
    // This would integrate with Razorpay or Stripe
    console.log('Subscribe to', selectedPlan, 'using', pricing.provider)
    // TODO: Implement actual payment flow
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-bg-1">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="text-xl font-medium text-text-1">Upgrade to Zero Pro</h2>
            {reason && <p className="mt-1 text-sm text-text-2">{reason}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-2 hover:bg-bg-2 hover:text-text-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Plan toggle */}
        <div className="flex items-center justify-center gap-2 p-4">
          <button
            onClick={() => setSelectedPlan('pro')}
            className={cn(
              'rounded-full px-6 py-2 text-sm font-medium transition-colors',
              selectedPlan === 'pro'
                ? 'bg-zero-300 text-bg-0'
                : 'text-text-2 hover:text-text-1'
            )}
          >
            Pro
          </button>
          <button
            onClick={() => setSelectedPlan('ultra')}
            className={cn(
              'rounded-full px-6 py-2 text-sm font-medium transition-colors',
              selectedPlan === 'ultra'
                ? 'bg-zero-300 text-bg-0'
                : 'text-text-2 hover:text-text-1'
            )}
          >
            Ultra
          </button>
        </div>

        {/* Pricing */}
        <div className="px-4 pb-4 text-center">
          <div className="mb-4">
            <span className="text-4xl font-light text-text-1">
              {loading
                ? '...'
                : selectedPlan === 'pro'
                  ? pricing.pro.display
                  : pricing.ultra.display}
            </span>
            <span className="text-text-2">/month</span>
          </div>

          {!loading && (
            <p className="mb-6 text-sm text-text-3">
              Prices for {pricing.country_name} via{' '}
              {pricing.provider === 'razorpay' ? 'Razorpay' : 'Stripe'}
            </p>
          )}

          {/* Features */}
          <ul className="mb-6 space-y-3 text-left">
            {planFeatures[selectedPlan].map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-zero-300" />
                <span className="text-sm text-text-2">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Subscribe button */}
          <button
            onClick={handleSubscribe}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zero-300 py-3 font-medium text-bg-0 transition-colors hover:bg-zero-400"
          >
            <Zap className="h-5 w-5" />
            Subscribe to {selectedPlan === 'pro' ? 'Pro' : 'Ultra'}
          </button>
        </div>
      </div>
    </div>
  )
}
