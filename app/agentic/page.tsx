import { AgenticChat } from '@/components/agentic/AgenticChat'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Bot, Lock } from 'lucide-react'

export const metadata = {
  title: 'Agentic Mode — Zero AI',
  description: 'Autonomous AI agent with web search, code execution, and long-term memory.',
}

export default async function AgenticPage() {
  // Check auth + plan server-side
  let userId: string | undefined
  let plan: string = 'free'

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const cookieStore = cookies()
    const token = (await cookieStore).get('sb-access-token')?.value

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user) {
        userId = user.id
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single()
        plan = profile?.plan || 'free'
      }
    }
  } catch {
    // Not authed — show locked gate
  }

  // Gate: Ultra only
  if (plan !== 'ultra') {
    return (
      <div className="min-h-screen bg-bg-0 flex flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-bg-1/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4">
            <Link href="/chat" className="text-text-2 hover:text-text-1 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold text-text-1">Agentic Mode</h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-8">
          <div className="relative">
            <div className="h-24 w-24 rounded-3xl bg-bg-1 border border-border flex items-center justify-center">
              <Bot className="h-12 w-12 text-orange-400" />
            </div>
            <div className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-bg-1 border border-border flex items-center justify-center">
              <Lock className="h-4 w-4 text-text-3" />
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-text-1 mb-3">Agentic Chad</h2>
            <p className="text-text-2 max-w-md leading-relaxed">
              Autonomous AI that searches the web, executes code, manages files, and completes multi-step tasks — all powered by Gemini 2.0 Flash.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-bg-1 p-6 max-w-sm w-full text-left space-y-3">
            {[
              '🔍 Live web search with Tavily',
              '⚡ Code execution & sandbox',
              '🧠 Long-term vector memory',
              '🏗️ App generation & deploy',
              '🔄 Multi-step autonomous loops',
              '📸 Screenshot & browser control',
            ].map(f => (
              <p key={f} className="text-sm text-text-2 flex items-center gap-2">
                <span>{f}</span>
              </p>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/pricing"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3.5 font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-orange-500/20"
            >
              Upgrade to Ultra · ₹4,999/mo
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-2xl border border-border bg-bg-1 px-8 py-3.5 text-sm font-medium text-text-2 hover:text-text-1 hover:bg-bg-2 transition-all"
            >
              Back to Chat
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-0 flex flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-bg-1/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/chat" className="text-text-2 hover:text-text-1 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-text-1 leading-tight">Agentic Chad</h1>
                <p className="text-[10px] text-text-3">Gemini 2.0 Flash · Autonomous</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-text-3">Ultra Active</span>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <AgenticChat userId={userId} />
      </div>
    </div>
  )
}
