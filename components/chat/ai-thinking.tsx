"use client"

import { cn } from "@/lib/utils"
import { Brain, Search, Sparkles, Zap, Globe, Code, FileText } from "lucide-react"

interface AIThinkingProps {
  status?: string
  type?: 'thinking' | 'searching' | 'generating' | 'analyzing'
  className?: string
}

export function AIThinking({ 
  status = "Thinking...", 
  type = 'thinking',
  className 
}: AIThinkingProps) {
  const getIcon = () => {
    switch (type) {
      case 'searching':
        return <Search className="h-4 w-4" />
      case 'generating':
        return <Code className="h-4 w-4" />
      case 'analyzing':
        return <FileText className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getGradient = () => {
    switch (type) {
      case 'searching':
        return 'from-blue-500 via-cyan-500 to-blue-500'
      case 'generating':
        return 'from-purple-500 via-pink-500 to-purple-500'
      case 'analyzing':
        return 'from-amber-500 via-orange-500 to-amber-500'
      default:
        return 'from-emerald-500 via-teal-500 to-emerald-500'
    }
  }

  return (
    <div className={cn("flex items-start gap-3 p-4", className)}>
      {/* Animated Icon Container */}
      <div className="relative">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          "bg-gradient-to-br shadow-lg",
          type === 'searching' && "from-blue-500/20 to-cyan-500/20 border border-blue-500/30",
          type === 'generating' && "from-purple-500/20 to-pink-500/20 border border-purple-500/30",
          type === 'analyzing' && "from-amber-500/20 to-orange-500/20 border border-amber-500/30",
          type === 'thinking' && "from-emerald-500/20 to-teal-500/20 border border-emerald-500/30"
        )}>
          <div className={cn(
            "text-white animate-pulse",
            type === 'searching' && "text-blue-400",
            type === 'generating' && "text-purple-400",
            type === 'analyzing' && "text-amber-400",
            type === 'thinking' && "text-emerald-400"
          )}>
            {getIcon()}
          </div>
        </div>
        
        {/* Orbiting particles */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
          <div className={cn(
            "absolute -top-1 left-1/2 h-1.5 w-1.5 rounded-full",
            type === 'searching' && "bg-blue-400",
            type === 'generating' && "bg-purple-400",
            type === 'analyzing' && "bg-amber-400",
            type === 'thinking' && "bg-emerald-400"
          )} />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
          <div className={cn(
            "absolute -bottom-1 left-1/2 h-1 w-1 rounded-full opacity-60",
            type === 'searching' && "bg-cyan-400",
            type === 'generating' && "bg-pink-400",
            type === 'analyzing' && "bg-orange-400",
            type === 'thinking' && "bg-teal-400"
          )} />
        </div>
      </div>

      {/* Status Text with Animation */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-1">{status}</span>
          <div className="flex gap-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-text-3 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-text-3 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-text-3 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 w-48 overflow-hidden rounded-full bg-bg-3">
          <div 
            className={cn(
              "h-full w-1/3 rounded-full bg-gradient-to-r animate-pulse",
              getGradient()
            )}
            style={{
              animation: 'shimmer 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>
    </div>
  )
}

// Separate component for search animation with more detail
export function AISearching({ query }: { query?: string }) {
  return (
    <div className="flex items-start gap-3 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
          <Globe className="h-4 w-4 text-blue-400 animate-pulse" />
        </div>
        
        {/* Radar effect */}
        <div className="absolute inset-0 rounded-xl border border-blue-500/50 animate-ping opacity-30" />
      </div>

      <div className="flex flex-col gap-1.5 pt-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-1">Searching the web</span>
          <Sparkles className="h-3 w-3 text-blue-400 animate-pulse" />
        </div>
        {query && (
          <p className="text-xs text-text-3 truncate max-w-[250px]">
            {'"'}{query}{'"'}
          </p>
        )}
        
        {/* Animated search lines */}
        <div className="flex flex-col gap-1 mt-1">
          <div className="h-2 w-32 rounded bg-bg-3 animate-pulse" />
          <div className="h-2 w-24 rounded bg-bg-3 animate-pulse" style={{ animationDelay: '100ms' }} />
          <div className="h-2 w-28 rounded bg-bg-3 animate-pulse" style={{ animationDelay: '200ms' }} />
        </div>
      </div>
    </div>
  )
}

// Code generation animation
export function AIGenerating({ what = "code" }: { what?: string }) {
  return (
    <div className="flex items-start gap-3 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
          <Code className="h-4 w-4 text-purple-400" />
        </div>
        
        {/* Typing cursor effect */}
        <div className="absolute -right-1 -bottom-1 h-3 w-0.5 bg-purple-400 animate-pulse" />
      </div>

      <div className="flex flex-col gap-1.5 pt-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-1">Generating {what}</span>
          <Zap className="h-3 w-3 text-purple-400 animate-pulse" />
        </div>
        
        {/* Code-like animation */}
        <div className="font-mono text-xs text-text-3 space-y-0.5">
          <div className="flex items-center gap-1">
            <span className="text-purple-400">{'>'}</span>
            <span className="animate-pulse">_</span>
          </div>
        </div>
      </div>
    </div>
  )
}
