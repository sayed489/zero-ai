"use client"

import { useState } from "react"
import { useZeroLive } from "@/hooks/use-zero-live"
import { MicOff, PhoneOff, Mic, Loader2, Sparkles, X, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ZeroLiveModalProps {
  isOpen: boolean
  onClose: () => void
  apiKey: string | undefined | null
}

export function ZeroLiveModal({ isOpen, onClose, apiKey }: ZeroLiveModalProps) {
  const { status, error, volume, aiTalking, timeLeft, connect, disconnect } = useZeroLive(apiKey, 180)

  if (!isOpen) return null

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`

  const isLive = status === "live"
  const isConnecting = status === "connecting"
  const hasError = status === "error"

  // Dynamic orb scaling based on voice volume
  const volumeScale = 1 + (volume * 0.3)

  const handleClose = () => {
    if (isLive) disconnect()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-bg-1 border border-border shadow-2xl flex flex-col">
        
        {/* Background Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className={cn(
            "absolute -top-1/2 left-1/2 -translate-x-1/2 w-[200%] h-[200%] rounded-full blur-[100px] transition-all duration-500",
            isLive ? "bg-zero-300/20" : "bg-zero-300/10"
          )} />
        </div>

        {/* Header */}
        <div className="relative flex justify-between items-center p-6 pb-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-text-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-zero-300" />
              Zero Live
            </h2>
            <p className="text-sm text-text-3 mt-1">Real-time voice conversation</p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-bg-2 text-text-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="relative flex-1 flex flex-col items-center justify-center p-8 z-10 min-h-[320px]">
          {isConnecting ? (
            <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-zero-300/20 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-zero-300 animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-zero-300/30 animate-ping" />
              </div>
              <p className="text-zero-300 font-medium">Connecting...</p>
            </div>
          ) : hasError ? (
            <div className="flex flex-col items-center gap-4 w-full animate-in fade-in duration-300">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                <MicOff className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-red-400">Connection Failed</p>
                <p className="text-sm text-text-3 mt-1 max-w-[250px]">{error}</p>
              </div>
              <button 
                onClick={connect} 
                className="mt-2 bg-bg-2 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-bg-3 transition-colors text-text-1"
              >
                Try Again
              </button>
            </div>
          ) : isLive ? (
            <div className="flex flex-col items-center gap-6 w-full animate-in zoom-in duration-300">
              {/* Voice Visualizer Orb */}
              <div className="relative">
                <div 
                  className={cn(
                    "w-28 h-28 rounded-full transition-all duration-75 flex items-center justify-center",
                    aiTalking 
                      ? "bg-zero-300/30 border-2 border-zero-300 shadow-[0_0_40px_rgba(196,168,240,0.4)]" 
                      : "bg-zero-300/10 border-2 border-zero-300/30"
                  )}
                  style={{ transform: `scale(${volumeScale})` }}
                >
                  {aiTalking ? (
                    <Volume2 className="w-10 h-10 text-zero-300" />
                  ) : (
                    <Mic className="w-10 h-10 text-zero-300/60" />
                  )}
                </div>
                {/* Pulse rings */}
                {aiTalking && (
                  <>
                    <div className="absolute inset-0 rounded-full border border-zero-300/40 animate-ping" style={{ animationDuration: '1.5s' }} />
                    <div className="absolute -inset-4 rounded-full border border-zero-300/20 animate-ping" style={{ animationDuration: '2s' }} />
                  </>
                )}
              </div>

              <div className="text-center">
                <p className={cn(
                  "text-lg font-semibold tracking-wide transition-colors",
                  aiTalking ? "text-zero-300" : "text-text-2"
                )}>
                  {aiTalking ? "Zero is speaking..." : "Listening..."}
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <div className="px-3 py-1 rounded-full bg-bg-2 border border-border text-xs font-medium text-text-2">
                    Free tier: <span className="text-zero-300">{timeString}</span> remaining
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
              <div className="w-24 h-24 bg-bg-2 rounded-full flex items-center justify-center border border-border">
                <Sparkles className="w-10 h-10 text-zero-300" />
              </div>
              <div className="text-center">
                <p className="text-text-1 font-medium">Voice Conversation</p>
                <p className="text-text-3 text-sm mt-1 max-w-[250px]">
                  Experience natural voice conversations with Zero AI
                </p>
              </div>
              <button 
                onClick={connect}
                className="w-full max-w-[200px] bg-zero-300 hover:bg-zero-400 text-bg-0 font-semibold py-3.5 rounded-xl shadow-lg shadow-zero-300/20 hover:shadow-xl hover:shadow-zero-300/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Start Conversation
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="relative border-t border-border p-4 flex items-center justify-center z-10">
          {isLive ? (
            <button 
              onClick={handleClose}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/20"
            >
              <PhoneOff className="w-5 h-5" />
              End Call
            </button>
          ) : (
            <p className="text-xs text-text-3 text-center">
              3 minutes free daily. Upgrade for unlimited voice.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
