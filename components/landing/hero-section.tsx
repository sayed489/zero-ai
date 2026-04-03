'use client'

import Link from 'next/link'
import { ZeroMascot } from '@/components/mascot/zero-mascot'
import {
  ArrowRight, Sparkles, Globe, Image as ImageIcon,
  Code, Database, Zap, Mic, Wand2, Brain, Cpu, Check, Shield, Rocket
} from 'lucide-react'

// AI Tiers - No model names exposed
const TIERS = [
  {
    id: 'pico',
    name: 'Zero Pico',
    desc: 'On-device AI',
    badge: 'Always Free',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    icon: <Cpu className="h-5 w-5 text-emerald-400" />,
    glow: 'hover:border-emerald-500/30',
  },
  {
    id: 'nano',
    name: 'Zero Nano',
    desc: 'Fast & capable',
    badge: 'Free Tier',
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    icon: <Zap className="h-5 w-5 text-blue-400" />,
    glow: 'hover:border-blue-500/30',
  },
  {
    id: 'prime',
    name: 'Zero Prime',
    desc: 'Balanced power',
    badge: 'Free Tier',
    badgeColor: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    icon: <Brain className="h-5 w-5 text-violet-400" />,
    glow: 'hover:border-violet-500/30',
  },
  {
    id: 'apex',
    name: 'Zero Apex',
    desc: 'Maximum intelligence',
    badge: 'Pro+',
    badgeColor: 'bg-zero-300/15 text-zero-300 border-zero-300/20',
    icon: <Rocket className="h-5 w-5 text-zero-300" />,
    glow: 'hover:border-zero-300/30',
  },
  {
    id: 'agentic',
    name: 'Agentic Mode',
    desc: 'Autonomous agent',
    badge: 'Ultra',
    badgeColor: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    icon: <Wand2 className="h-5 w-5 text-orange-400" />,
    glow: 'hover:border-orange-500/30',
  },
]

// Core capabilities
const CAPABILITIES = [
  { icon: <Globe className="h-4 w-4 text-blue-400" />, label: 'Live Web Search', desc: 'Real-time information' },
  { icon: <Code className="h-4 w-4 text-emerald-400" />, label: 'App Factory', desc: 'Generate full apps' },
  { icon: <Database className="h-4 w-4 text-violet-400" />, label: 'Memory', desc: 'Remembers everything' },
  { icon: <ImageIcon className="h-4 w-4 text-pink-400" />, label: 'Image Generation', desc: 'Create visuals' },
  { icon: <Mic className="h-4 w-4 text-red-400" />, label: 'Voice AI', desc: 'Talk naturally' },
  { icon: <Shield className="h-4 w-4 text-yellow-400" />, label: 'Privacy First', desc: 'Your data stays yours' },
]

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-24 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zero-glow-strong blur-3xl opacity-50" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--zero-300) 1px, transparent 1px), linear-gradient(90deg, var(--zero-300) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-zero-300/30 bg-zero-300/10 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-zero-300 animate-pulse" />
          <span className="text-sm font-medium text-zero-300">Free to start</span>
        </div>

        {/* Mascot */}
        <div className="mb-8 relative">
          <ZeroMascot size={120} state="happy" mood="excited" interactive />
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full border border-zero-300/20 animate-ping" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-balance">
          <span className="block text-5xl font-light tracking-tight text-text-1 md:text-7xl">
            Meet <span className="text-zero-300 font-semibold">Zero</span>
          </span>
          <span className="block mt-3 text-2xl md:text-3xl font-light text-text-2">
            Your complete AI assistant
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mb-10 max-w-xl text-lg text-text-2 leading-relaxed text-pretty">
          5 AI tiers from on-device to autonomous agents.
          Built-in app creation, memory, web search, image generation, and voice.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-3 sm:flex-row mb-16">
          <Link
            href="/chat"
            className="group flex items-center gap-2 rounded-full bg-zero-300 px-8 py-4 text-base font-semibold text-bg-0 transition-all hover:bg-zero-400 hover:shadow-lg hover:shadow-zero-300/25"
          >
            Start chatting free
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

        {/* Tier cards */}
        <div className="w-full mb-12">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {TIERS.map(tier => (
              <div
                key={tier.id}
                className={`group flex flex-col gap-3 rounded-2xl border border-border bg-bg-1 p-4 text-left transition-all hover:bg-bg-2 ${tier.glow}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-2 border border-border group-hover:bg-bg-3">
                    {tier.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-1 truncate">{tier.name}</p>
                    <p className="text-xs text-text-3">{tier.desc}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border w-fit uppercase tracking-wider ${tier.badgeColor}`}>
                  {tier.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Capabilities */}
        <div className="w-full rounded-2xl border border-border bg-bg-1/80 backdrop-blur-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Wand2 className="h-5 w-5 text-zero-300" />
            <h2 className="text-base font-semibold text-text-1">Everything built in</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {CAPABILITIES.map(cap => (
              <div
                key={cap.label}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-bg-2 p-4 text-center hover:border-border-hover hover:bg-bg-3 transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-3 border border-border">
                  {cap.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-1">{cap.label}</p>
                  <p className="text-[10px] text-text-3 mt-0.5">{cap.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-10 flex flex-wrap justify-center items-center gap-6 text-sm text-text-3">
          <span className="flex items-center gap-1.5">
            <span className="flex">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-4 w-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </span>
            Loved by 2,000+ users
          </span>
          <span className="h-4 w-px bg-border hidden sm:block" />
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-400" /> No credit card required
          </span>
          <span className="h-4 w-px bg-border hidden sm:block" />
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-400" /> Cancel anytime
          </span>
        </div>
      </div>
    </section>
  )
}
