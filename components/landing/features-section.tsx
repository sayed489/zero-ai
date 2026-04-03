'use client'

import { Brain, Zap, Blocks, Globe, Image, Cpu, Terminal, Database, Mic, Shield } from 'lucide-react'

const features = [
  {
    icon: Cpu,
    iconColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/15',
    title: 'Zero Pico — On Device',
    description: 'Runs 100% in your browser using WebGPU. Powered by a 4B Coder model — free forever, private, zero latency, zero data sent.',
    badge: 'Always Free',
    badgeClass: 'bg-emerald-500/10 text-emerald-400',
  },
  {
    icon: Zap,
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/15',
    title: 'Multi-tier AI Routing',
    description: 'Auto-routes to the right tier (Nano, Prime, Apex) based on speed and reasoning needs. 20+ API keys rotated for zero downtime.',
    badge: 'Free + Pro',
    badgeClass: 'bg-blue-500/10 text-blue-400',
  },
  {
    icon: Blocks,
    iconColor: 'text-violet-400',
    bgColor: 'bg-violet-500/10 border-violet-500/15',
    title: 'App Factory',
    description: 'Describe any app → AI generates live code → instant StackBlitz deploy. 8 templates: SaaS, dashboard, game, e-commerce.',
    badge: 'Live Code',
    badgeClass: 'bg-violet-500/10 text-violet-400',
  },
  {
    icon: Brain,
    iconColor: 'text-zero-300',
    bgColor: 'bg-zero-300/10 border-zero-300/15',
    title: 'Vector Memory',
    description: 'Astra DB stores memories as embeddings. Zero recalls your preferences, projects, and goals across every conversation automatically.',
    badge: '10GB Free',
    badgeClass: 'bg-zero-300/10 text-zero-300',
  },
  {
    icon: Globe,
    iconColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10 border-cyan-500/15',
    title: 'Live Web Search',
    description: 'Tavily + SearchAPI grounding in every answer. Agentic Chad autonomously searches, reads pages, and synthesises findings in real-time.',
    badge: 'Real-time',
    badgeClass: 'bg-cyan-500/10 text-cyan-400',
  },
  {
    icon: Terminal,
    iconColor: 'text-orange-400',
    bgColor: 'bg-orange-500/10 border-orange-500/15',
    title: 'Code Sandbox',
    description: 'Sandpack IDE with live preview in chat. Execute JS securely server-side. Agentic mode runs Python and deploys to StackBlitz.',
    badge: 'Sandpack',
    badgeClass: 'bg-orange-500/10 text-orange-400',
  },
  {
    icon: Image,
    iconColor: 'text-pink-400',
    bgColor: 'bg-pink-500/10 border-pink-500/15',
    title: 'Image Generation',
    description: 'Flux Schnell via SiliconFlow — 5 free images/day on Free, 100/day on Pro. Generates directly in chat, saved to your Artifacts.',
    badge: 'Flux Schnell',
    badgeClass: 'bg-pink-500/10 text-pink-400',
  },
  {
    icon: Mic,
    iconColor: 'text-red-400',
    bgColor: 'bg-red-500/10 border-red-500/15',
    title: 'Voice AI',
    description: 'Web Speech API for hands-free input. Text-to-speech output in every model tier. Talk to Nano or hold a full voice conversation with Apex.',
    badge: 'STT + TTS',
    badgeClass: 'bg-red-500/10 text-red-400',
  },
  {
    icon: Shield,
    iconColor: 'text-text-2',
    bgColor: 'bg-bg-2 border-border',
    title: 'Built for India',
    description: 'Rs 299/month Pro · Rs 4,999/month Ultra. Razorpay + UPI support. Hinglish-ready system prompts. Geo-aware pricing for 15+ countries.',
    badge: '₹299/mo',
    badgeClass: 'bg-bg-3 text-text-2',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 px-4">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-bg-1 px-4 py-1.5 text-sm text-text-3">
            <span className="h-1.5 w-1.5 rounded-full bg-zero-300" />
            Everything you need, built in
          </div>
          <h2 className="text-3xl font-light text-text-1 md:text-5xl tracking-tight">
            The complete AI platform
          </h2>
          <p className="mt-4 max-w-lg mx-auto text-text-2 text-lg">
            Not just chat. An entire AI operating system at{' '}
            <span className="text-zero-300 font-medium">₹299/month</span>.
          </p>
        </div>

        {/* Features grid — 3 col with 1 wide featured card */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon
            // Make first card (Pico) span 2 cols on lg
            const isWide = i === 0

            return (
              <div
                key={feature.title}
                className={[
                  'group flex flex-col gap-4 rounded-2xl border p-6 transition-all',
                  'hover:bg-bg-2 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20',
                  'bg-bg-1',
                  feature.bgColor,
                  isWide ? 'lg:col-span-2 lg:flex-row lg:items-start' : '',
                ].join(' ')}
              >
                {/* Icon */}
                <div className={[
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border',
                  feature.bgColor,
                ].join(' ')}>
                  <Icon className={['h-6 w-6', feature.iconColor].join(' ')} />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-semibold text-text-1">{feature.title}</h3>
                    <span className={[
                      'shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                      feature.badgeClass,
                    ].join(' ')}>
                      {feature.badge}
                    </span>
                  </div>
                  <p className="text-sm text-text-2 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border bg-bg-1 px-6 py-5">
          <div>
            <p className="font-semibold text-text-1">Free tier available — no credit card needed</p>
            <p className="text-sm text-text-3 mt-0.5">Nano 10/day · Prime 5/day · Apex 3/day · Pico unlimited</p>
          </div>
          <a
            href="/chat"
            className="shrink-0 flex items-center gap-2 rounded-xl bg-zero-300 px-6 py-2.5 text-sm font-semibold text-bg-0 hover:bg-zero-400 transition-all hover:scale-105"
          >
            Start for free →
          </a>
        </div>
      </div>
    </section>
  )
}
