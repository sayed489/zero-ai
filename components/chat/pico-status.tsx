'use client'

import { Cpu, Download, Check, AlertCircle, Sparkles, Zap, Shield, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NanoStatus } from '@/hooks/useNano'

interface PicoStatusProps {
  status: NanoStatus
  progress: number
  statusText: string
  onLoad: () => void
  compact?: boolean
}

export function PicoStatus({ status, progress, statusText, onLoad, compact = false }: PicoStatusProps) {
  const isReady = status === 'ready'
  const isLoading = status === 'loading'
  const isError = status === 'error'
  const isUnavailable = status === 'unavailable'
  const isChecking = status === 'checking'

  // Compact version for chat header
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
          isReady && "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
          isLoading && "bg-zero-300/15 text-zero-300 border border-zero-300/20",
          isError && "bg-red-500/15 text-red-400 border border-red-500/20",
          (isUnavailable || isChecking) && "bg-bg-2 text-text-3 border border-border"
        )}>
          {isReady && <><Shield className="h-3 w-3" /><span>Private</span></>}
          {isLoading && (
            <>
              <div className="h-3 w-3 rounded-full border-2 border-zero-300/30 border-t-zero-300 animate-spin" />
              <span>{Math.round(progress)}%</span>
            </>
          )}
          {isError && <><AlertCircle className="h-3 w-3" /><span>Error</span></>}
          {(isUnavailable || isChecking) && (
            <button onClick={onLoad} className="flex items-center gap-1.5 hover:text-text-1 transition-colors">
              <Download className="h-3 w-3" />
              <span>Load Pico</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  // Full version for welcome/hero
  return (
    <div className="w-full max-w-md">
      {/* Main Card */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl border p-5 transition-all duration-300",
        isReady && "bg-emerald-500/5 border-emerald-500/20",
        isLoading && "bg-zero-300/5 border-zero-300/20",
        isError && "bg-red-500/5 border-red-500/20",
        (isUnavailable || isChecking) && "bg-bg-1 border-border hover:border-zero-300/30"
      )}>
        {/* Glow effect */}
        <div className={cn(
          "absolute -top-20 -right-20 h-40 w-40 rounded-full blur-3xl transition-all duration-500",
          isReady && "bg-emerald-500/20",
          isLoading && "bg-zero-300/30",
          isError && "bg-red-500/10",
          (isUnavailable || isChecking) && "bg-transparent"
        )} />

        <div className="relative flex items-start gap-4">
          {/* Icon */}
          <div className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all",
            isReady && "bg-emerald-500/20 border border-emerald-500/30",
            isLoading && "bg-zero-300/20 border border-zero-300/30",
            isError && "bg-red-500/20 border border-red-500/30",
            (isUnavailable || isChecking) && "bg-bg-2 border border-border"
          )}>
            {isReady && <Check className="h-7 w-7 text-emerald-400" />}
            {isLoading && (
              <div className="relative">
                <Cpu className="h-7 w-7 text-zero-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full border-2 border-zero-300/20 border-t-zero-300 animate-spin" />
                </div>
              </div>
            )}
            {isError && <AlertCircle className="h-7 w-7 text-red-400" />}
            {(isUnavailable || isChecking) && <Cpu className="h-7 w-7 text-text-3" />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-text-1">Zero Pico</h3>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                isReady && "bg-emerald-500/20 text-emerald-400",
                isLoading && "bg-zero-300/20 text-zero-300",
                isError && "bg-red-500/20 text-red-400",
                (isUnavailable || isChecking) && "bg-bg-2 text-text-3"
              )}>
                {isReady ? 'Active' : isLoading ? 'Loading' : isError ? 'Error' : 'Offline'}
              </span>
            </div>
            
            <p className="text-sm text-text-2 mb-3">
              {isReady && 'On-device AI ready. 100% private, works offline.'}
              {isLoading && statusText}
              {isError && 'Failed to load. Your browser may not support WebGPU.'}
              {(isUnavailable || isChecking) && 'Download once, use forever. No cloud needed.'}
            </p>

            {/* Progress bar for loading */}
            {isLoading && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-text-3">Downloading model</span>
                  <span className="text-zero-300 font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-bg-3 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-zero-300 to-zero-400 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Features */}
            {(isReady || isUnavailable || isChecking) && (
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="flex items-center gap-1 text-xs text-text-3 bg-bg-2 px-2 py-1 rounded-lg">
                  <Shield className="h-3 w-3 text-emerald-400" /> Private
                </span>
                <span className="flex items-center gap-1 text-xs text-text-3 bg-bg-2 px-2 py-1 rounded-lg">
                  <Zap className="h-3 w-3 text-yellow-400" /> Fast
                </span>
                <span className="flex items-center gap-1 text-xs text-text-3 bg-bg-2 px-2 py-1 rounded-lg">
                  {isReady ? <Wifi className="h-3 w-3 text-blue-400" /> : <WifiOff className="h-3 w-3 text-text-3" />}
                  Offline
                </span>
              </div>
            )}

            {/* Action button */}
            {(isUnavailable || isChecking) && (
              <button
                onClick={onLoad}
                className="w-full flex items-center justify-center gap-2 bg-zero-300 hover:bg-zero-400 text-bg-0 font-semibold py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-zero-300/20"
              >
                <Download className="h-4 w-4" />
                Download Pico (~2GB)
              </button>
            )}

            {isError && (
              <button
                onClick={onLoad}
                className="w-full flex items-center justify-center gap-2 bg-bg-2 hover:bg-bg-3 text-text-1 font-medium py-2.5 rounded-xl border border-border transition-colors"
              >
                Try Again
              </button>
            )}

            {isReady && (
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <Sparkles className="h-4 w-4" />
                <span>Ready to chat privately</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info text */}
      <p className="text-center text-xs text-text-3 mt-3">
        {isReady 
          ? 'Your conversations stay on your device'
          : 'One-time download. Works without internet after.'}
      </p>
    </div>
  )
}
