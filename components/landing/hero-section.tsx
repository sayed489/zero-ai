'use client'

import Link from 'next/link'
import { ZeroMascot } from '@/components/mascot/zero-mascot'
import { ArrowDown, Sparkles, ArrowRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-16 overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary warm glow */}
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zero-glow-strong blur-3xl" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(var(--zero-300) 1px, transparent 1px),
              linear-gradient(90deg, var(--zero-300) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Beta badge */}
        <div className="mb-8 flex items-center gap-2 rounded-full border border-zero-300/30 bg-zero-300/10 px-4 py-1.5">
          <Sparkles className="h-4 w-4 text-zero-300" />
          <span className="text-sm font-medium text-zero-300">Agentic AI · Unlimited Access</span>
        </div>

        {/* Hero Mascot - Original Zero cloud character */}
        <div className="mb-8 relative">
          <ZeroMascot size={140} state="happy" mood="excited" interactive />
          {/* Glow rings */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="h-40 w-40 rounded-full border border-zero-300/20 animate-ping-slow" />
          </div>
        </div>

        {/* Tagline */}
        <h1 className="mb-4 text-5xl font-light tracking-tight md:text-7xl">
          <span className="text-text-1">Meet </span>
          <span className="text-zero-300">Zero</span>
        </h1>

        {/* Subtitle */}
        <p className="mb-10 max-w-lg text-lg text-text-2 text-balance">
          Unlimited AI access with Agentic mode. Powered by Nano, Prime, Apex — your autonomous coding companion that remembers you.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/chat"
            className="group relative flex items-center gap-2 rounded-full bg-zero-300 px-8 py-3.5 text-base font-semibold text-bg-0 transition-all hover:bg-zero-400"
          >
            <span>Start chatting</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#features"
            className="flex items-center gap-2 rounded-full border border-border bg-bg-1/50 backdrop-blur-sm px-8 py-3.5 text-base font-medium text-text-2 transition-all hover:border-border-hover hover:text-text-1"
          >
            Learn more
            <ArrowDown className="h-4 w-4" />
          </a>
        </div>

        {/* Model showcase */}
        <div className="mt-16 max-w-2xl rounded-2xl border border-border bg-bg-1/80 backdrop-blur-sm p-6">
          <h3 className="mb-4 text-lg font-medium text-text-1">
            Unlimited AI · 4 Intelligent Tiers
          </h3>
          <div className="grid grid-cols-2 gap-4 text-left md:grid-cols-4">
            {[
              { name: 'Nano', desc: 'Fast · Unlimited', badge: 'Free' },
              { name: 'Prime', desc: 'Balanced power', badge: '' },
              { name: 'Apex', desc: 'Max reasoning', badge: 'Pro' },
              { name: 'Agentic', desc: 'Autonomous agent', badge: 'New' },
            ].map((item) => (
              <div key={item.name} className="rounded-lg bg-bg-2 p-3">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-text-1">{item.name}</p>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      item.badge === 'Pro' ? 'bg-zero-300/20 text-zero-300' 
                      : item.badge === 'Free' ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-green-500/20 text-green-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-3">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-text-3">
            Agentic routing automatically selects the best tier. Nano provides fast standard access, while Apex unlocks maximum compute limits.
          </p>
        </div>

        {/* Rating */}
        <div className="mt-12 flex flex-col items-center gap-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="h-5 w-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
            <span className="ml-2 text-sm text-text-2">Loved by 2,000+ users</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-text-3">
          <span className="text-xs">Scroll</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
