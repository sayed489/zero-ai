'use client'

import Link from 'next/link'
import { ZeroMascot } from '@/components/mascot/zero-mascot'
import {
  ArrowRight, Sparkles, Globe, Image as ImageIcon,
  Code, Database, Zap, Mic, Wand2, Terminal, Rocket,
  Brain, Cpu, Check
} from 'lucide-react'

// ─── Tier data ──────────────────────────────────────────────────────────────
const TIERS = [
  {
    id: 'pico',
    name: 'Zero Pico',
    sub: 'On-Device',
    badge: { text: 'Always Free', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
    icon: <Cpu className="h-5 w-5 text-emerald-400" />,
    glow: 'hover:border-emerald-500/30 hover:shadow-emerald-500/5',
  },
  {
    id: 'nano',
    name: 'Zero Nano',
    sub: '10/day free',
    badge: { text: 'Free tier', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
    icon: <Zap className="h-5 w-5 text-blue-400" />,
    glow: 'hover:border-blue-500/30 hover:shadow-blue-500/5',
  },
  {
    id: 'prime',
    name: 'Zero Prime',
    sub: '5/day free',
    badge: { text: 'Free tier', cls: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
    icon: <Brain className="h-5 w-5 text-violet-400" />,
    glow: 'hover:border-violet-500/30 hover:shadow-violet-500/5',
  },
  {
    id: 'apex',
    name: 'Zero Apex',
    sub: '3/day free',
    badge: { text: 'Pro+', cls: 'bg-zero-300/15 text-zero-300 border-zero-300/20' },
    icon: <Rocket className="h-5 w-5 text-zero-300" />,
    glow: 'hover:border-zero-300/30 hover:shadow-zero-300/5',
  },
  {
    id: 'agentic-chad',
    name: 'Agentic Chad',
    sub: 'Autonomous',
    badge: { text: 'Ultra only', cls: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
    icon: <Wand2 className="h-5 w-5 text-orange-400" />,
    glow: 'hover:border-orange-500/30 hover:shadow-orange-500/5',
  },
]

// ─── Capabilities ────────────────────────────────────────────────────────────
const CAPABILITIES = [
  { icon: <Globe className="h-4 w-4 text-blue-400" />,     label: 'Live Web Search',      desc: 'Tavily · real-time data' },
  { icon: <Code className="h-4 w-4 text-emerald-400" />,   label: 'App Factory',           desc: 'Gemini 2.5 → live URL' },
  { icon: <Database className="h-4 w-4 text-violet-400" />, label: 'Vector Memory',         desc: 'Astra DB · persists forever' },
  { icon: <ImageIcon className="h-4 w-4 text-pink-400" />, label: 'Image Generation',      desc: 'Flux Schnell · free' },
  { icon: <Terminal className="h-4 w-4 text-orange-400" />, label: 'Code Sandbox',          desc: 'Execute · preview · deploy' },
  { icon: <Mic className="h-4 w-4 text-red-400" />,        label: 'Voice AI',              desc: 'STT + TTS built in' },
  { icon: <Zap className="h-4 w-4 text-yellow-400" />,     label: 'Key Rotation',          desc: '20+ API keys in rotation' },
  { icon: <Sparkles className="h-4 w-4 text-zero-300" />,  label: 'Extended Thinking',     desc: 'Apex & Agentic modes' },
]

// ─── Stats ───────────────────────────────────────────────────────────────────
const STATS = [
  { value: '5', label: 'AI tiers', suffix: '' },
  { value: '20', label: 'API keys rotated', suffix: '+' },
  { value: '₹299', label: 'Pro / month', suffix: '' },
  { value: '100%', label: 'Pico is local', suffix: '' },
]

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-16 pb-24 overflow-hidden">

      {/* ── Background ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" suppressHydrationWarning>
        {/* Main glow */}
        <div className="absolute left-1/2 top-1/3 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zero-glow-strong blur-3xl opacity-60" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(var(--zero-300) 1px, transparent 1px),
              linear-gradient(90deg, var(--zero-300) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center text-center gap-0">

        {/* ── Badge ── */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zero-300/30 bg-zero-300/10 px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-zero-300 animate-pulse" />
          <span className="text-sm font-medium text-zero-300">Free to start · No credit card</span>
        </div>

        {/* ── Mascot ── */}
        <div className="mb-6 relative">
          <ZeroMascot size={130} state="happy" mood="excited" interactive />
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="h-36 w-36 rounded-full border border-zero-300/15 animate-ping" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* ── Headline ── */}
        <h1 className="mb-4 text-5xl font-light tracking-tight text-text-1 md:text-7xl leading-tight">
          Meet{' '}
          <span className="text-zero-300 font-semibold">Zero</span>
          <br />
          <span className="text-3xl md:text-4xl font-light text-text-2">
            Your entire AI stack. One app.
          </span>
        </h1>

        {/* ── Sub ── */}
        <p className="mb-8 max-w-2xl text-lg text-text-2 leading-relaxed">
          5 AI tiers from on-device Qwen 0.5B to agentic Gemini 2.0 Flash.
          Built-in App Factory, vector memory, live search, image gen & voice.
          <span className="text-zero-300 font-medium"> Start free.</span>
        </p>

        {/* ── CTAs ── */}
        <div className="flex flex-col items-center gap-3 sm:flex-row mb-12">
          <Link
            href="/chat"
            className="group flex items-center gap-2 rounded-full bg-zero-300 px-8 py-3.5 text-base font-semibold text-bg-0 transition-all hover:bg-zero-400 hover:shadow-lg hover:shadow-zero-300/20"
          >
            Start chatting free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/pricing"
            className="flex items-center gap-2 rounded-full border border-border bg-bg-1 px-8 py-3.5 text-base font-medium text-text-1 transition-all hover:border-border-hover hover:bg-bg-2"
          >
            ₹299/mo Pro
            <Sparkles className="h-4 w-4 text-zero-300" />
          </Link>
        </div>

        {/* ── Stats bar ── */}
        <div className="mb-16 flex flex-wrap justify-center gap-px rounded-2xl border border-border bg-border overflow-hidden">
          {STATS.map(s => (
            <div key={s.label} className="flex flex-col items-center px-6 py-4 bg-bg-1 flex-1 min-w-[100px]">
              <span className="text-2xl font-black text-text-1">
                {s.value}<span className="text-zero-300">{s.suffix}</span>
              </span>
              <span className="text-xs text-text-3 mt-0.5 whitespace-nowrap">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Tier cards ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 w-full mb-8">
          {TIERS.map(tier => (
            <div
              key={tier.id}
              className={[
                'group flex flex-col gap-2 rounded-2xl border border-border bg-bg-1 p-4 text-left',
                'transition-all hover:bg-bg-2 hover:shadow-lg',
                tier.glow,
              ].join(' ')}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-bg-2 border border-border">
                  {tier.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-1 leading-tight">{tier.name}</p>
                  <p className="text-[10px] text-text-3">{tier.sub}</p>
                </div>
              </div>
              <span className={['text-[9px] font-bold px-2 py-0.5 rounded-full border w-fit uppercase tracking-wider', tier.badge.cls].join(' ')}>
                {tier.badge.text}
              </span>
            </div>
          ))}
        </div>

        {/* ── Capabilities grid ── */}
        <div className="w-full rounded-2xl border border-border bg-bg-1/80 backdrop-blur-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Wand2 className="h-5 w-5 text-zero-300" />
            <h2 className="text-base font-semibold text-text-1">Everything built in</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CAPABILITIES.map(cap => (
              <div
                key={cap.label}
                className="flex items-start gap-3 rounded-xl border border-border bg-bg-2 p-3 text-left hover:border-border-hover hover:bg-bg-3 transition-all"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bg-3 border border-border">
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

        {/* ── Social proof ── */}
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
