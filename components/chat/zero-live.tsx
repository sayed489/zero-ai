"use client"

import { useZeroLive } from "@/hooks/use-zero-live"
import { MicOff, PhoneOff, Camera, MonitorUp, Loader2, Sparkles, X } from "lucide-react"

interface ZeroLiveModalProps {
  isOpen: boolean
  onClose: () => void
  apiKey: string | undefined | null
}

export function ZeroLiveModal({ isOpen, onClose, apiKey }: ZeroLiveModalProps) {
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  if (!isOpen) return null

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`

  const isLive = status === "live"
  const isConnecting = status === "connecting"
  const hasError = status === "error"

  const volumeScale = 1 + (volume * 0.5)
  const orbScale = `scale(${volumeScale})`

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-500">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-bg-1/80 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col pt-10 pb-8 px-8">
        
        {/* Dynamic Animated Background Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute -top-[20%] -left-[20%] w-[80%] h-[80%] bg-zero-500/20 blur-[120px] animate-pulse" />
          <div className="absolute -bottom-[20%] -right-[20%] w-[80%] h-[80%] bg-zero-300/20 blur-[120px] animate-pulse delay-700" />
        </div>

        
        {/* Header */}
        <div className="relative flex justify-between items-center mb-8 z-10">
          <div>
            <h2 className="text-xl font-black text-text-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-zero-300" />
              Zero Live
            </h2>
            <p className="text-sm font-medium text-text-3 mt-1">
              Immersive Multimodal AI Assistant
            </p>
          </div>
          <button 
            onClick={() => { disconnect(); onClose() }}
            className="p-2 rounded-full hover:bg-bg-2 text-text-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Visualization Area */}
        <div className="relative flex-1 min-h-[260px] flex items-center justify-center text-center z-10">
          {isConnecting ? (
            <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-500">
              <Loader2 className="w-12 h-12 text-zero-400 mb-2 animate-spin" />
              <p className="text-zero-300 font-bold text-lg tracking-wide">Syncing Neural Link...</p>
            </div>
          ) : hasError ? (
            <div className="flex flex-col items-center gap-3 w-full p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                <MicOff className="w-6 h-6 text-red-500" />
              </div>
              <p className="font-bold text-red-400">{error}</p>
              <button 
                onClick={connect} 
                className="mt-4 bg-bg-2 px-6 py-2 rounded-xl text-sm font-bold hover:bg-bg-3 transition-colors text-white"
              >
                Retry Connection
              </button>
            </div>
          ) : isLive ? (
            <div className="flex flex-col items-center gap-6 w-full">
              {/* Intelligent Orb */}
              <div 
                className={`relative w-32 h-32 rounded-full transition-all duration-[50ms] border-2 ${aiTalking ? 'border-zero-300 bg-zero-400/20 shadow-[0_0_40px_rgba(196,168,240,0.3)]' : 'border-zero-400/30 bg-zero-400/10'}`}
                style={{ transform: orbScale }}
              >
                <div className="absolute inset-0 rounded-full border border-zero-300/50 animate-[spin_4s_linear_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-zero-300 blur-md animate-pulse" />
                </div>
              </div>

              <div className="flex flex-col items-center">
                <span className={`text-lg font-black tracking-widest uppercase transition-colors duration-300 ${aiTalking ? 'text-zero-300' : 'text-text-3'}`}>
                  {aiTalking ? 'Speaking...' : 'Listening...'}
                </span>
                <span className="text-xs font-bold text-text-3 mt-2 bg-bg-0 px-3 py-1 rounded-full ring-1 ring-border">
                  Free Tier Remaining: <span className="text-zero-300">{timeString}</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
              <div className="w-20 h-20 bg-bg-2 rounded-full flex items-center justify-center mb-2 shadow-inner">
                <Sparkles className="w-8 h-8 text-zero-400" />
              </div>
              <p className="text-text-2 font-medium max-w-sm leading-relaxed">
                Experience ultra-low latency voice conversations with Zero.
              </p>
              <button 
                onClick={connect}
                className="mt-4 bg-zero-500 hover:bg-zero-400 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-[0_0_30px_rgba(196,168,240,0.3)] hover:shadow-[0_0_40px_rgba(196,168,240,0.5)] hover:scale-105 active:scale-95 transition-all w-full select-none"
              >
                Initiate Zero Live
              </button>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="relative mt-10 pt-8 border-t border-white/5 flex items-center justify-center gap-6 z-10">
          <button 
            disabled={!isLive}
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`p-5 rounded-3xl transition-all flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 ${isScreenSharing ? 'bg-zero-300 text-white' : 'bg-bg-2 text-text-2 hover:bg-bg-3'}`}
            title="Share Screen"
          >
            <MonitorUp className="w-7 h-7" />
          </button>
          
          <button 
            disabled={!isLive}
            onClick={() => setIsCameraOn(!isCameraOn)}
            className={`p-5 rounded-3xl transition-all flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 ${isCameraOn ? 'bg-zero-300 text-white' : 'bg-bg-2 text-text-2 hover:bg-bg-3'}`}
            title="Toggle Camera"
          >
            <Camera className="w-7 h-7" />
          </button>
          
          <div className="w-px h-10 bg-white/10 mx-2" />

          {isLive ? (
            <button 
              onClick={() => { disconnect(); onClose() }}
              className="px-8 py-5 rounded-3xl bg-red-500/90 hover:bg-red-500 text-white transition-all flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] hover:scale-105 active:scale-95 animate-in slide-in-from-bottom duration-500"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
          ) : (
            <button 
              onClick={onClose}
              className="p-5 rounded-3xl bg-bg-2 text-text-2 hover:bg-bg-3 transition-all flex items-center justify-center shadow-lg hover:scale-105 active:scale-95"
            >
              <X className="w-7 h-7" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
