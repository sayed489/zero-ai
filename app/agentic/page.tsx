"use client"

import { AgenticChat } from "@/components/agentic/AgenticChat"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, ArrowLeft, Info, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AgenticPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [sessionId] = useState(() => `agentic-${Date.now()}-${Math.random().toString(36).slice(2)}`)

  // Check for API configuration
  const [configError, setConfigError] = useState<string | null>(null)

  useEffect(() => {
    // Check if essential APIs are configured (basic check)
    const checkConfig = async () => {
      try {
        const response = await fetch('/api/health', { method: 'HEAD' })
        if (!response.ok) {
          setConfigError("API services may not be fully configured")
        }
      } catch {
        // Ignore - just a soft check
      }
    }
    checkConfig()
  }, [])

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg-0">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-zero-300" />
          <span className="text-sm text-text-3">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-bg-0">
      {/* Navigation Bar */}
      <nav className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border bg-bg-1">
        <Link 
          href="/chat"
          className="flex items-center gap-2 text-sm text-text-2 hover:text-text-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Chat</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <Info className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-xs text-orange-400 font-medium">Beta Feature</span>
          </div>
          
          {user ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-2 border border-border">
              <div className="h-6 w-6 rounded-full bg-zero-300/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-zero-300">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-sm text-text-2 hidden sm:block max-w-[120px] truncate">
                {user.email}
              </span>
            </div>
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zero-300 text-bg-0 text-sm font-medium hover:bg-zero-400 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>

      {/* Info Banner */}
      {configError && (
        <div className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <span className="text-xs text-amber-400">{configError}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <AgenticChat 
          sessionId={sessionId}
          userId={user?.id}
        />
      </main>
    </div>
  )
}
