'use client'

import { PremiumPageLayout } from '@/components/layout/premium-page-layout'
import { Compass, Sparkles, Terminal, Code, Wallet, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface ToolItem {
  title: string
  icon: any
  desc: string
  color: string
  bg: string
  tier?: string
  hot?: boolean
}

interface Category {
  name: string
  items: ToolItem[]
}

const categories: Category[] = [
  {
    name: "Application Templates",
    items: [
      { title: "React SaaS Dashboard", icon: Code, desc: "A premium glassmorphic dashboard template with charts.", color: "text-blue-400", bg: "bg-blue-400/10", tier: "Plus" },
      { title: "E-commerce Storefront", icon: Wallet, desc: "Modern headless commerce UI with cart logic.", color: "text-purple-400", bg: "bg-purple-400/10", tier: "Ultra" },
    ]
  },
  {
    name: "Agentic Agents",
    items: [
      { title: "Roast My Startup", icon: Sparkles, desc: "Activate Roast Mode and pitch your idea.", color: "text-orange-500", bg: "bg-orange-500/10", hot: true },
      { title: "Python Data Engineer", icon: Terminal, desc: "Analyze CSVs, clean data, and generate plots.", color: "text-emerald-400", bg: "bg-emerald-400/10" },
      { title: "Advanced PDF Analyzer", icon: FileText, desc: "Upload and extract deep insights from documents.", color: "text-indigo-400", bg: "bg-indigo-400/10" }
    ]
  }
]

export default function ExplorePage() {
  return (
    <PremiumPageLayout
      title="Explore"
      description="Discover what you can build with Agentic Chad."
      icon={<Compass className="w-full h-full text-zero-300" />}
      maxWidth="max-w-6xl"
      disableProse
    >
      <div className="mt-8 space-y-12">
        {categories.map((cat) => (
          <div key={cat.name} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-xl font-bold text-text-1 mb-6 flex items-center gap-2">
              <div className="h-6 w-1 rounded-full bg-zero-300" />
              {cat.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.items.map((p, i) => (
                <div key={i} className="group relative rounded-3xl border border-border bg-bg-1 p-8 transition-all hover:bg-bg-2 hover:border-zero-300/40 hover:shadow-[0_20px_50px_rgba(var(--zero-500-rgb),0.05)] hover:-translate-y-1 overflow-hidden">
                   {/* Background Glow */}
                   <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-20 ${p.bg}`} />
                   
                   <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-border group-hover:scale-110 transition-transform ${p.bg}`}>
                      <p.icon className={`w-7 h-7 ${p.color}`} />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-text-1 group-hover:text-zero-300 transition-colors">
                        {p.title}
                      </h3>
                      {p.hot && (
                        <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-500 uppercase tracking-wider">Hot</span>
                      )}
                      {p.tier && (
                        <span className="rounded-full bg-zero-500/10 px-2 py-0.5 text-[10px] font-bold text-zero-300 uppercase tracking-wider border border-zero-300/20">{p.tier}</span>
                      )}
                    </div>
                    
                    <p className="text-sm text-text-3 mb-8 leading-relaxed font-medium">
                      {p.desc}
                    </p>
                    
                    <Link 
                      href={`/chat?q=${encodeURIComponent(p.title)}`}
                      className="inline-flex items-center gap-2 text-sm font-bold text-text-1 bg-bg-0 hover:bg-zero-300 hover:text-white px-6 py-3 rounded-xl transition-all w-full justify-center border border-border hover:border-zero-300 shadow-sm"
                    >
                      Initialize Template
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PremiumPageLayout>
  )
}
