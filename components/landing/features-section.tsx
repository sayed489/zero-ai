'use client'

import { Brain, Zap, Blocks, Skull, Search, Globe } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'Zero Memory',
    description: 'Remembers across every conversation. Your preferences, projects, and context — always there.',
  },
  {
    icon: Zap,
    title: 'Multi-model',
    description: 'Routes to the fastest AI for each task. Code to Qwen, chat to Llama, vision to Gemini.',
  },
  {
    icon: Blocks,
    title: 'App Factory',
    description: 'Describe your app → live URL in 60 seconds. Preview and deploy instantly.',
  },
  {
    icon: Skull,
    title: 'Roast Mode',
    description: 'Brutal feedback on your work, followed by instant fixes. Grow through honest critique.',
  },
  {
    icon: Search,
    title: 'Deep Search',
    description: 'Real-time web search in every answer. Always up to date, always accurate.',
  },
  {
    icon: Globe,
    title: 'Built for India',
    description: 'Rs 99/month, Razorpay support, Hinglish-ready. Premium AI at local prices.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24">
      {/* Section header */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-light text-text-1 md:text-4xl">
            Everything you need
          </h2>
          <p className="text-lg text-text-2">
            Built for power users who want more from their AI.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-bg-1 p-6 transition-all hover:border-border-hover hover:bg-bg-2"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zero-glow">
                <feature.icon className="h-6 w-6 text-zero-300" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-text-1">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-2">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
