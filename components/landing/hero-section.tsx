'use client'

import Link from 'next/link'
import { ZeroMascot } from '@/components/mascot/zero-mascot'
import { ArrowRight, Sparkles, Shield, Zap, Globe } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 pt-20 pb-16 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zero-glow-strong blur-[120px] opacity-40" />
      </div>

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        {/* Badge */}
        <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-zero-300/30 bg-zero-300/10 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-zero-300 animate-pulse" />
          <span className="text-sm font-medium text-zero-300">Free to start</span>
        </div>

        {/* Mascot */}
        <div className="mb-10 relative">
          <ZeroMascot size={100} state="happy" mood="excited" interactive />
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="h-28 w-28 rounded-full border border-zero-300/20 animate-ping" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-balance">
          <span className="block text-5xl font-light tracking-tight text-text-1 md:text-6xl lg:text-7xl">
            Meet <span className="text-zero-300 font-semibold">Zero</span>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mb-12 max-w-lg text-lg md:text-xl text-text-2 leading-relaxed text-pretty">
          The AI that respects your privacy. On-device intelligence, cloud power when you need it.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row mb-16">
          <Link
            href="/chat"
            className="group flex items-center gap-2 rounded-full bg-zero-300 px-8 py-4 text-base font-semibold text-bg-0 transition-all hover:bg-zero-400 hover:shadow-lg hover:shadow-zero-300/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            Start chatting
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/pricing"
            className="flex items-center gap-2 rounded-full border border-border bg-bg-1 px-8 py-4 text-base font-medium text-text-1 transition-all hover:border-border-hover hover:bg-bg-2"
          >
            View plans
            <Sparkles className="h-4 w-4 text-zero-300" />
          </Link>
        </div>

        {/* Three key features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl">
          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-border bg-bg-1/50 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Shield className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-text-1">Private</p>
              <p className="text-sm text-text-3 mt-1">On-device AI option</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-border bg-bg-1/50 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Zap className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-text-1">Powerful</p>
              <p className="text-sm text-text-3 mt-1">5 AI tiers to choose</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-border bg-bg-1/50 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Globe className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-text-1">Connected</p>
              <p className="text-sm text-text-3 mt-1">Live web search</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
