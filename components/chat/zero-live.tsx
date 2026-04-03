"use client"

import { useState, useEffect } from "react"
import { useZeroLive } from "@/hooks/use-zero-live"
import { X, Mic, MicOff, PhoneOff, Sparkles, Phone, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ZeroLiveModalProps {
  isOpen: boolean
  onClose: () => void
  apiKey: string | undefined | null
}

export function ZeroLiveModal({ isOpen, onClose, apiKey }: ZeroLiveModalProps) {
  const { status, error, volume, aiTalking, timeLeft, connect, disconnect } = useZeroLive(apiKey, 180)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) handleClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  if (!isOpen) return null

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`

  const isLive = status === "live"
  const isConnecting = status === "connecting"
  const hasError = status === "error"

  const handleClose = () => {
    if (isLive) disconnect()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-bg-1 border border-border shadow-2xl">
        
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl transition-all duration-500",
            isLive ? "bg-emerald-500/20" : hasError ? "bg-red-500/10" : "bg-zero-300/10"
          )} />
        </div>

        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-bg-2/80 hover:bg-bg-3 text-text-2 hover:text-text-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center p-8 pt-12">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-text-1">Zero Live</h2>
          </div>
          <p className="text-sm text-text-3 mb-8">Voice conversation with AI</p>

          {/* Main visualization */}
          <div className="relative mb-8">
            {isConnecting ? (
              <div className="w-32 h-32 rounded-full bg-bg-2 border-2 border-dashed border-zero-300/50 flex items-center justify-center animate-pulse">
                <div className="w-24 h-24 rounded-full bg-bg-3 flex items-center justify-center">
                  <Phone className="w-10 h-10 text-zero-300 animate-bounce" />
                </div>
              </div>
            ) : hasError ? (
              <div className="w-32 h-32 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <MicOff className="w-10 h-10 text-red-400" />
              </div>
            ) : isLive ? (
              <div className="relative">
                {/* Voice visualizer rings */}
                <div 
                  className={cn(
                    "w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all duration-100",
                    aiTalking 
                      ? "bg-emerald-500/20 border-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.3)]" 
                      : "bg-bg-2 border-zero-300/30"
                  )}
                  style={{ transform: `scale(${1 + volume * 0.15})` }}
                >
                  {aiTalking ? (
                    <Volume2 className="w-10 h-10 text-emerald-400 animate-pulse" />
                  ) : (
                    <Mic className="w-10 h-10 text-zero-300" />
                  )}
                </div>
                
                {/* Pulse rings when active */}
                {aiTalking && (
                  <>
                    <div className="absolute inset-0 rounded-full border border-emerald-400/50 animate-ping" style={{ animationDuration: '1.5s' }} />
                    <div className="absolute -inset-2 rounded-full border border-emerald-400/30 animate-ping" style={{ animationDuration: '2s' }} />
                  </>
                )}
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-bg-2 border border-border flex items-center justify-center">
                <Mic className="w-10 h-10 text-text-3" />
              </div>
            )}
          </div>

          {/* Status text */}
          <div className="text-center mb-6 h-16">
            {isConnecting && (
              <div className="animate-in fade-in">
                <p className="text-sm font-medium text-zero-300">Connecting...</p>
                <p className="text-xs text-text-3 mt-1">Requesting microphone access</p>
              </div>
            )}
            {hasError && (
              <div className="animate-in fade-in">
                <p className="text-sm font-medium text-red-400">Connection Failed</p>
                <p className="text-xs text-text-3 mt-1 max-w-xs">{error}</p>
              </div>
            )}
            {isLive && (
              <div className="animate-in fade-in">
                <p className={cn("text-sm font-medium", aiTalking ? "text-emerald-400" : "text-text-2")}>
                  {aiTalking ? "Zero is speaking..." : "Listening..."}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className={cn("h-2 w-2 rounded-full", timeLeft < 30 ? "bg-red-400 animate-pulse" : "bg-emerald-400")} />
                  <span className="text-xs text-text-3">
                    <span className={timeLeft < 30 ? "text-red-400 font-medium" : "text-emerald-400"}>{timeString}</span> remaining
                  </span>
                </div>
              </div>
            )}
            {!isConnecting && !hasError && !isLive && (
              <div className="animate-in fade-in">
                <p className="text-sm font-medium text-text-2">Ready to talk</p>
                <p className="text-xs text-text-3 mt-1">3 minutes free daily</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="w-full space-y-3">
            {isLive ? (
              <button 
                onClick={handleClose}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PhoneOff className="w-4 h-4" />
                End Call
              </button>
            ) : hasError ? (
              <button 
                onClick={connect}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-bg-2 hover:bg-bg-3 text-text-1 font-medium border border-border transition-all"
              >
                Try Again
              </button>
            ) : !isConnecting && (
              <button 
                onClick={connect}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Mic className="w-4 h-4" />
                Start Conversation
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 border-t border-border px-6 py-4 text-center bg-bg-2/50">
          <p className="text-xs text-text-3">
            Upgrade for unlimited voice conversations
          </p>
        </div>
      </div>
    </div>
  )
}

// Compact Zero Live button
interface ZeroLiveButtonProps {
  onClick: () => void
  isActive?: boolean
}

export function ZeroLiveButton({ onClick, isActive }: ZeroLiveButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
        isActive 
          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" 
          : "bg-bg-2 border border-border text-text-2 hover:text-text-1 hover:border-emerald-500/40 hover:bg-bg-3"
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", isActive ? "bg-white animate-pulse" : "bg-emerald-400")} />
      <span>Zero Live</span>
    </button>
  )
}
