"use client"

import { useState, useEffect, useCallback } from "react"
import { useZeroLive } from "@/hooks/use-zero-live"
import { MicOff, PhoneOff, Mic, Loader2, Sparkles, X, Volume2, Phone, Waves, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface ZeroLiveModalProps {
  isOpen: boolean
  onClose: () => void
  apiKey: string | undefined | null
}

export function ZeroLiveModal({ isOpen, onClose, apiKey }: ZeroLiveModalProps) {
  const { status, error, volume, aiTalking, timeLeft, connect, disconnect } = useZeroLive(apiKey, 180)
  const [showSettings, setShowSettings] = useState(false)

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
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

  // Dynamic orb scaling based on voice volume
  const volumeScale = 1 + (volume * 0.4)

  const handleClose = () => {
    if (isLive) disconnect()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-bg-1 border border-border shadow-2xl shadow-zero-300/10">
        
        {/* Animated background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className={cn(
            "absolute -top-1/2 left-1/2 -translate-x-1/2 w-[300%] h-[200%] rounded-full blur-[120px] transition-all duration-700",
            isLive ? "bg-zero-300/25 scale-110" : hasError ? "bg-red-500/15" : "bg-zero-300/10"
          )} />
        </div>

        {/* Header */}
        <div className="relative flex justify-between items-center p-5 pb-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-zero-300 to-zero-500 flex items-center justify-center shadow-lg shadow-zero-300/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-1">Zero Live</h2>
              <p className="text-xs text-text-3">Voice conversation</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-bg-2 text-text-2 hover:text-text-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="relative flex flex-col items-center justify-center p-8 z-10 min-h-[280px]">
          {isConnecting ? (
            <div className="flex flex-col items-center gap-5 animate-in zoom-in-95 duration-300">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-zero-300/20 flex items-center justify-center border border-zero-300/30">
                  <Loader2 className="w-10 h-10 text-zero-300 animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-zero-300/40 animate-ping" style={{ animationDuration: '1.5s' }} />
              </div>
              <div className="text-center">
                <p className="text-zero-300 font-medium">Connecting...</p>
                <p className="text-xs text-text-3 mt-1">Requesting microphone access</p>
              </div>
            </div>
          ) : hasError ? (
            <div className="flex flex-col items-center gap-5 w-full animate-in fade-in duration-300">
              <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <MicOff className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-red-400">Connection Failed</p>
                <p className="text-xs text-text-3 mt-2 max-w-[250px] leading-relaxed">{error}</p>
              </div>
              <button 
                onClick={connect} 
                className="mt-2 bg-bg-2 hover:bg-bg-3 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors text-text-1 border border-border"
              >
                Try Again
              </button>
            </div>
          ) : isLive ? (
            <div className="flex flex-col items-center gap-6 w-full animate-in zoom-in-95 duration-300">
              {/* Voice Visualizer Orb */}
              <div className="relative">
                <div 
                  className={cn(
                    "w-28 h-28 rounded-full transition-all duration-100 flex items-center justify-center",
                    aiTalking 
                      ? "bg-zero-300/25 border-2 border-zero-300 shadow-[0_0_50px_rgba(196,168,240,0.4)]" 
                      : "bg-zero-300/10 border-2 border-zero-300/40"
                  )}
                  style={{ transform: `scale(${volumeScale})` }}
                >
                  {aiTalking ? (
                    <Waves className="w-10 h-10 text-zero-300 animate-pulse" />
                  ) : (
                    <Mic className="w-10 h-10 text-zero-300/70" />
                  )}
                </div>
                
                {/* Pulse rings when AI is talking */}
                {aiTalking && (
                  <>
                    <div className="absolute inset-0 rounded-full border border-zero-300/50 animate-ping" style={{ animationDuration: '1.5s' }} />
                    <div className="absolute -inset-4 rounded-full border border-zero-300/25 animate-ping" style={{ animationDuration: '2s' }} />
                  </>
                )}
              </div>

              <div className="text-center">
                <p className={cn(
                  "text-base font-medium tracking-wide transition-colors",
                  aiTalking ? "text-zero-300" : "text-text-2"
                )}>
                  {aiTalking ? "Zero is speaking..." : "Listening..."}
                </p>
                
                {/* Timer */}
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-2 border border-border">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    timeLeft < 30 ? "bg-red-400 animate-pulse" : "bg-emerald-400"
                  )} />
                  <span className="text-xs font-medium text-text-2">
                    <span className={timeLeft < 30 ? "text-red-400" : "text-zero-300"}>{timeString}</span> remaining
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
              <div className="w-24 h-24 bg-bg-2 rounded-full flex items-center justify-center border border-border">
                <Phone className="w-10 h-10 text-zero-300" />
              </div>
              <div className="text-center">
                <p className="text-text-1 font-medium">Voice Conversation</p>
                <p className="text-text-3 text-sm mt-2 max-w-[220px] leading-relaxed">
                  Talk naturally with Zero using your voice
                </p>
              </div>
              <button 
                onClick={connect}
                className="w-full max-w-[200px] flex items-center justify-center gap-2 bg-zero-300 hover:bg-zero-400 text-bg-0 font-semibold py-3.5 rounded-xl shadow-lg shadow-zero-300/25 hover:shadow-xl hover:shadow-zero-300/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Mic className="w-4 h-4" />
                Start Conversation
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="relative border-t border-border p-4 flex items-center justify-center z-10 bg-bg-1/50 backdrop-blur-sm">
          {isLive ? (
            <button 
              onClick={handleClose}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/25"
            >
              <PhoneOff className="w-4 h-4" />
              End Call
            </button>
          ) : (
            <p className="text-xs text-text-3 text-center max-w-[280px]">
              3 minutes free daily. Upgrade for unlimited voice conversations.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Compact Zero Live button for chat interface
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
          ? "bg-zero-300 text-bg-0 shadow-lg shadow-zero-300/25" 
          : "bg-bg-2 border border-border text-text-2 hover:text-text-1 hover:border-zero-300/40 hover:bg-bg-3"
      )}
    >
      <div className={cn(
        "h-2 w-2 rounded-full",
        isActive ? "bg-bg-0 animate-pulse" : "bg-zero-300"
      )} />
      <span>Zero Live</span>
    </button>
  )
}
