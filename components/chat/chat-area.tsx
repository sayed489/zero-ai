'use client'

import { useRef, useEffect, useState } from 'react'
import { Menu, Ghost, Plus, Cloud, Sun, CloudRain, CloudLightning, Moon, Code, Brain, X, AlertCircle, Zap, Rocket } from 'lucide-react'
import Link from 'next/link'
import { ZeroMascot } from '@/components/mascot/zero-mascot'
import { RamenBowl } from '@/components/mascot/ramen-bowl'
import { MilkBox } from '@/components/mascot/milk-box'
import { MessageList } from '@/components/chat/message-list'
import { ChatInput } from '@/components/chat/chat-input'
import { AppFactory } from '@/components/features/app-factory'
import { QuickActions } from '@/components/chat/quick-actions'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useWeatherZero, type ZeroMood } from '@/hooks/use-weather-zero'
import { cn } from '@/lib/utils'
import type { ChatMessage, AIModel } from '@/lib/types'

// Map weather mood to mascot state
type ZeroActivityType = 'eating' | 'drinking' | 'happy' | 'wink' | 'surprised' | 'sleep' | 'celebrating'

function getMascotState(
  mood: ZeroMood, 
  isLoading: boolean, 
  isThinking: boolean,
  activity?: ZeroActivityType
): 'idle' | 'happy' | 'sleep' | 'thinking' | 'eating' | 'drinking' | 'wink' | 'surprised' | 'celebrating' {
  if (activity) return activity
  if (isThinking || isLoading) return 'thinking'
  switch (mood) {
    case 'happy': return 'happy'
    case 'raining': return 'surprised'
    case 'thundering': return 'surprised'
    case 'sleepy': return 'sleep'
    default: return 'idle'
  }
}

function WeatherIcon({ mood }: { mood: ZeroMood }) {
  switch (mood) {
    case 'happy': return <Sun className="h-4 w-4 text-orange-400" />
    case 'thundering': return <CloudLightning className="h-4 w-4 text-yellow-400" />
    case 'sleepy': return <Moon className="h-4 w-4 text-indigo-400" />
    default: return <CloudRain className="h-4 w-4 text-blue-400" />
  }
}

interface ChatAreaProps {
  messages: ChatMessage[]
  isLoading: boolean
  isThinking?: boolean
  thinkingStatus?: string
  selectedModel: AIModel
  onModelChange: (model: AIModel) => void
  onSend: (content: string, skill?: string) => void
  onRegenerate: () => void
  onOpenSidebar: () => void
  onNewChat?: () => void
  userName?: string
  isIncognito?: boolean
  nano?: {
    status: "unavailable" | "checking" | "loading" | "ready" | "error"
    progress: number
    statusText: string
    isReady: boolean
    currentModel?: string | null
    lastError?: { bug: string; fix: string } | null
    clearError?: () => void
    forceDownload?: () => void
    repairAndRetry?: () => void
  }
  onOpenLive: () => void
}

export function ChatArea({
  messages,
  isLoading,
  isThinking = false,
  thinkingStatus = 'Thinking...',
  selectedModel,
  onModelChange,
  onSend,
  onRegenerate,
  onOpenSidebar,
  onNewChat,
  userName = 'User',
  isIncognito = false,
  nano,
  onOpenLive,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isNewChat = messages.length === 0
  const [appPanelOpen, setAppPanelOpen] = useState(true)
  const [zeroActivity, setZeroActivity] = useState<ZeroActivityType | undefined>()
  const [autoMode, setAutoMode] = useState(true)
  const [mounted, setMounted] = useState(false)
  const weatherState = useWeatherZero()

  const mascotState = getMascotState(weatherState.mood, isLoading, isThinking, zeroActivity)

  // Find the last message with an App Factory
  const activeAppMessage = [...messages].reverse().find(m => m.hasAppFactory && m.appFactoryFiles)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-cycle emotions if in autoMode
  useEffect(() => {
    if (!autoMode || isLoading || isThinking) return
    
    const interval = setInterval(() => {
      const chance = Math.random()
      if (chance < 0.1) {
        const activities: ZeroActivityType[] = ['happy', 'wink', 'sleep']
        const randomAction = activities[Math.floor(Math.random() * activities.length)]
        setZeroActivity(randomAction)
        
        // Reset to undefined after 4-6 seconds
        setTimeout(() => setZeroActivity(undefined), 4000 + Math.random() * 2000)
      }
    }, 15000)
    
    return () => clearInterval(interval)
  }, [autoMode, isLoading, isThinking])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Listen for Nano Router mascot actions
  useEffect(() => {
    const handleMascotAction = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const action = customEvent.detail;
      if (action === 'eating' || action === 'drinking') {
        setAutoMode(false);
        setZeroActivity(action as ZeroActivityType);
      } else if (action === 'idle') {
        setZeroActivity(undefined);
      }
    };

    window.addEventListener('mascot-action', handleMascotAction);
    return () => window.removeEventListener('mascot-action', handleMascotAction);
  }, []);

  return (
    <div className="relative flex flex-1 overflow-hidden bg-bg-0">
      {/* Left Chat Column */}
      <div className={cn(
        "flex h-full flex-col transition-all duration-300",
        activeAppMessage && appPanelOpen ? "w-[400px] shrink-0 border-r border-border" : "flex-1"
      )}>
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 relative z-50 bg-bg-1/80 backdrop-blur-md">
          <button
            onClick={onOpenSidebar}
            className="rounded-lg p-2 text-text-2 hover:bg-bg-2 hover:text-text-1 md:hidden active:scale-95 touch-manipulation"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Zero Live Native Button */}
          {selectedModel !== 'pico' && (
            <button
              onClick={onOpenLive}
               className="mr-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-sm font-bold text-emerald-500 transition-colors hover:bg-emerald-500/20 hover:scale-105"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="hidden sm:inline tracking-widest text-[11px] uppercase">Zero Live</span>
            </button>
          )}

          {/* New Chat button */}
          {onNewChat && (
            <button
              onClick={onNewChat}
              className="mr-3 flex items-center gap-2 rounded-lg bg-zero-400/10 px-3 py-1.5 text-sm font-medium text-zero-400 transition-colors hover:bg-zero-400/20"
              aria-label="New chat"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New chat</span>
            </button>
          )}
          
          {/* Pico Download Permission - Manual Trigger */}
          {selectedModel === 'pico' && nano?.status === 'unavailable' && (
            <div className="mr-3 flex items-center gap-3 animate-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col items-end">
                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">
                  Local AI Offline
                </div>
                <div className="text-[9px] text-text-3 font-medium text-right">
                  4B Coder
                </div>
              </div>
              <button 
                onClick={nano.forceDownload}
                className="flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-500 transition-all hover:bg-emerald-500/20 hover:scale-105 shadow-lg shadow-emerald-500/5 active:scale-95"
              >
                <Zap className="h-3.5 w-3.5" />
                Enable Pico
              </button>
            </div>
          )}
          
          {/* Pico Loading Progress - Premium Indicator */}
          {selectedModel === 'pico' && (nano?.status === 'checking' || nano?.status === 'loading') && (
            <div className="mr-3 flex w-[260px] flex-col gap-1.5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex w-full items-center justify-between text-[11px] font-bold text-text-2 uppercase tracking-tight">
                <span className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Pico Neural Link
                </span>
                <span className="font-mono text-emerald-400">{nano.progress}%</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-bg-3 border border-border shadow-inner">
                <div 
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  style={{ width: `${nano.progress}%`, transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-text-3 font-medium truncate max-w-[180px]">
                  {nano.statusText}
                </p>
                <button 
                  onClick={nano.repairAndRetry}
                  className="text-[10px] font-bold text-text-3 hover:text-red-400 transition-colors uppercase tracking-tighter"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {selectedModel === 'pico' && nano?.status === 'error' && (
            <div className="mr-3 flex items-center gap-3 animate-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col items-end">
                <div className="text-[10px] font-black text-red-500 uppercase tracking-tighter">
                  {nano.lastError?.bug || "Engine Conflict"}
                </div>
                <div className="text-[9px] text-text-3 font-medium max-w-[150px] truncate text-right">
                  {nano.lastError?.fix}
                </div>
              </div>
              <button 
                onClick={nano.repairAndRetry}
                className="flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-4 py-1.5 text-xs font-bold text-red-500 transition-all hover:bg-red-500/20 hover:scale-105 shadow-lg shadow-red-500/5 active:scale-95"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                Repair
              </button>
            </div>
          )}

          {/* Pico Ready Badge */}
          {selectedModel === 'pico' && nano?.status === 'ready' && (
            <div className="mr-3 flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-500 shadow-lg shadow-emerald-500/5 animate-in zoom-in duration-300">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Pico 4B Online</span>
            </div>
          )}

          {/* Incognito indicator */}
          {isIncognito && (
            <div className="ml-2 flex items-center gap-2 rounded-full bg-bg-2 px-3 py-1 text-xs text-text-2">
              <Ghost className="h-3.5 w-3.5" />
              Incognito
            </div>
          )}
          
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Chat Content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto"
        >
          {isNewChat ? (
            /* Welcome State or Pico Loading Hub */
            <div className="flex h-full flex-col items-center justify-center px-4 pb-32">
              {/* Weather badge */}
              {weatherState.badge && (
                <div className="mb-4 flex items-center gap-2 rounded-full bg-bg-2 px-4 py-1.5 text-sm animate-in fade-in slide-in-from-top-2 duration-500">
                  <WeatherIcon mood={weatherState.mood} />
                  <span className="text-text-2">{weatherState.badge}</span>
                </div>
              )}

              {/* Plan badge */}
              <div className="mb-6 flex items-center gap-2 rounded-full bg-bg-2 px-4 py-1.5 text-sm">
                <span className="text-text-2">Starter plan</span>
                <span className="text-text-3">·</span>
                <Link href="/pricing" className="text-text-1 hover:underline">
                  Upgrade
                </Link>
              </div>

              {selectedModel === 'pico' && !nano?.isReady ? (
                /* Premium Pico Hub (Glassmorphic) */
                <div className="flex flex-col items-center justify-center py-12 px-8 animate-in fade-in zoom-in-95 duration-1000 w-full max-w-2xl text-center">
                   <div className="relative mb-16 group">
                     {/* Dynamic background glow */}
                     <div className="absolute -inset-16 rounded-full bg-emerald-500/10 blur-[120px] group-hover:bg-emerald-500/20 transition-all duration-1000 animate-pulse" />
                     <div className="relative h-40 w-40 rounded-[2.5rem] bg-bg-1/80 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.15)] hover:scale-105 transition-all duration-700 backdrop-blur-3xl">
                       <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/10 to-transparent opacity-50" />
                       <Brain className="h-20 w-20 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                       <div className="absolute -top-3 -right-3 bg-emerald-500 text-[11px] font-black px-3 py-1.5 rounded-xl text-white shadow-xl shadow-emerald-500/20 uppercase tracking-widest border border-white/20">Local</div>
                     </div>
                   </div>

                   <div className="space-y-8 w-full max-w-lg relative z-10">
                     <div className="space-y-3">
                       <h2 className="text-4xl font-black text-text-1 tracking-tight bg-gradient-to-b from-text-1 to-text-1/60 bg-clip-text text-transparent">
                         Pico Neural Engine
                       </h2>
                       <p className="text-sm text-text-3 font-semibold uppercase tracking-[0.3em] opacity-60">
                         High-Performance Offline Intelligence
                       </p>
                     </div>
                     <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-2xl shadow-black/20 space-y-8 relative overflow-hidden group/card text-center">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />
                        
                        {nano?.status === 'unavailable' ? (
                          <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                             <div className="flex flex-col items-center gap-1.5">
                               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">
                                 < Zap className="w-3 h-3" />
                                 System Optimization Ready
                               </div>
                               <div className="text-2xl font-black text-text-1">1.1 GB Sync Required</div>
                               <p className="text-xs text-text-3 font-medium max-w-[280px] mx-auto leading-relaxed">
                                 Initialize the 4B Coder core with a 32,768 token context for private, high-fidelity development.
                               </p>
                             </div>

                             <button 
                               onClick={nano.forceDownload}
                               className="w-full flex items-center justify-center gap-4 rounded-2xl bg-emerald-500 px-8 py-5 text-sm font-black text-white transition-all hover:bg-emerald-400 hover:scale-[1.02] shadow-[0_20px_40px_-12px_rgba(16,185,129,0.4)] active:scale-[0.98] group/btn"
                             >
                               Initialize Pico Core (4B 4-bit)
                               <Rocket className="h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                             </button>

                             <div className="flex items-center justify-center gap-6 pt-2">
                               <div className="flex flex-col items-center">
                                 <span className="text-[10px] font-bold text-text-1">32K</span>
                                 <span className="text-[8px] text-text-3 uppercase tracking-widest font-black">Context</span>
                               </div>
                               <div className="w-px h-6 bg-border/50" />
                               <div className="flex flex-col items-center">
                                 <span className="text-[10px] font-bold text-text-1">4-BIT</span>
                                 <span className="text-[8px] text-text-3 uppercase tracking-widest font-black">Weights</span>
                               </div>
                               <div className="w-px h-6 bg-border/50" />
                               <div className="flex flex-col items-center">
                                 <span className="text-[10px] font-bold text-text-1">2TH</span>
                                 <span className="text-[8px] text-text-3 uppercase tracking-widest font-black">Threads</span>
                               </div>
                             </div>
                          </div>
                        ) : (
                          <div className="space-y-6 animate-in fade-in duration-500">
                             <div className="flex items-center justify-between px-1">
                               <div className="flex flex-col items-start text-left">
                                 <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                   {nano?.status === 'ready' ? 'Neural Link Online' : 'Syncing Neural Pathways'}
                                 </span>
                               </div>
                               <span className="font-mono text-xl font-black text-text-1">{nano?.progress ?? 0}%</span>
                             </div>

                             <div className="relative h-4 w-full bg-bg-3 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                <div 
                                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-700 ease-out"
                                  style={{ width: `${nano?.progress ?? 0}%` }}
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
                             </div>

                             <div className="flex items-center justify-between py-2 border-t border-white/5">
                               <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest animate-pulse">
                                  {nano?.statusText || "Syncing weights from hub..."}
                               </p>
                               <div className="text-[9px] font-black text-emerald-500/60 uppercase">
                                 Local Computation
                               </div>
                             </div>
                          </div>
                        )}
                     </div>

                     <div className="h-px w-32 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent mx-auto" />

                     <div className="space-y-4">
                        <p className="text-[10px] font-black text-text-3 uppercase tracking-[0.4em] opacity-40">Fallback Intelligence</p>
                        <div className="grid grid-cols-2 gap-4 px-8">
                           <button 
                             onClick={() => onModelChange('prime')}
                             className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-emerald-500/30 transition-all hover:-translate-y-1 active:scale-95"
                           >
                              <Zap className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                              <div className="text-[10px] font-black text-text-1 uppercase tracking-widest">Prime 1.5</div>
                           </button>
                           <button 
                             onClick={() => onModelChange('apex')}
                             className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all hover:-translate-y-1 active:scale-95"
                           >
                              <Brain className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                              <div className="text-[10px] font-black text-text-1 uppercase tracking-widest">Apex 3.1</div>
                           </button>
                        </div>
                     </div>
                   </div>
                </div>
              ) : (
                /* Default Welcome Content */
                <div className="flex flex-col items-center w-full">
                  {/* Mascot + Welcome - Auto cycling emotions */}
                  <div className="mb-6 flex flex-col items-center gap-5">
                    {/* Large Zero Mascot with closely overlapping props */}
                    <div className="relative flex items-center justify-center h-[140px] w-[140px]">
                      {/* Zero Mascot */}
                      <ZeroMascot 
                        size={120} 
                        state={mascotState}
                        interactive
                        className="z-10 relative"
                        onClick={() => {
                          // Cycle through states on click
                          setAutoMode(false)
                          const states: ZeroActivityType[] = ['happy', 'wink', 'eating', 'drinking', 'celebrating', 'surprised', 'sleep']
                          const currentIndex = zeroActivity ? states.indexOf(zeroActivity) : -1
                          setZeroActivity(states[(currentIndex + 1) % states.length])
                        }}
                      />

                      {/* Ramen Bowl (held exactly at mouth) */}
                      <div className={cn(
                        "absolute z-20 pointer-events-none transition-all duration-500",
                        "left-1/2 -translate-x-1/2 bottom-[8px]",  
                        zeroActivity === 'eating' 
                          ? "opacity-100 scale-100 translate-y-0" 
                          : "opacity-0 scale-90 translate-y-4"
                      )}>
                        <RamenBowl size={44} animated={zeroActivity === 'eating'} />
                      </div>

                      {/* Milk Box (held exactly at mouth) */}
                      <div className={cn(
                        "absolute z-20 pointer-events-none transition-all duration-500",
                        "left-1/2 -translate-x-1/2 bottom-[8px]", 
                        zeroActivity === 'drinking' 
                          ? "opacity-100 scale-100 translate-y-0" 
                          : "opacity-0 scale-90 translate-y-4"
                      )}>
                        <MilkBox size={36} animated={zeroActivity === 'drinking'} />
                      </div>
                    </div>

                    {/* Welcome text */}
                    <h1 className="text-3xl font-light text-text-1">
                      {isIncognito 
                        ? "Let's chat incognito"
                        : `Hey, ${userName}!`
                      }
                    </h1>
                  </div>

                  {/* Greeting */}
                  <p className="mb-8 text-center text-text-2 max-w-md">
                    {!mounted 
                      ? "How can I help you today?"
                      : zeroActivity === 'happy'
                        ? "I'm feeling great today! What can I help you with?"
                        : zeroActivity === 'wink'
                          ? "Got a secret project? I'm here to help ;)"
                          : zeroActivity === 'surprised'
                            ? "Wow! Ready for something exciting?"
                            : zeroActivity === 'sleep'
                              ? "Zzz... Oh! Sorry, just resting my eyes. What do you need?"
                              : zeroActivity === 'celebrating'
                                ? "Let's celebrate! What amazing thing are we working on?"
                                : zeroActivity === 'eating'
                                  ? "Mmm, noodles! But I can still help while I eat..."
                                  : zeroActivity === 'drinking'
                                    ? "Staying hydrated! What can I do for you?"
                                    : weatherState.greeting
                    }
                  </p>

                  {/* Input Card with rotating violet glow */}
                  <div className="w-full max-w-2xl">
                    <div className="relative">
                      <div className="absolute -inset-0.5 rounded-2xl opacity-60 blur-md glow-rotate" />
                      <div className="relative rounded-2xl bg-bg-1 p-1">
                        <ChatInput
                          selectedModel={selectedModel}
                          onModelChange={onModelChange}
                          onSend={onSend}
                          isLoading={isLoading}
                          placeholder="How can I help you today?"
                          variant="welcome"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-6">
                    <QuickActions onSelect={onSend} />
                  </div>

                  {/* Incognito notice */}
                  {isIncognito && (
                    <p className="mt-8 max-w-md text-center text-sm text-text-3">
                      Incognito chats aren&apos;t saved, added to memory, or used to train models.{' '}
                      <Link href="/privacy" className="underline hover:text-text-2">
                        Learn more
                      </Link>{' '}
                      about how your data is used.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Message List */
            <MessageList
              messages={messages}
              isLoading={isLoading}
              isThinking={isThinking}
              thinkingStatus={thinkingStatus}
              onRegenerate={onRegenerate}
            />
          )}

          {/* Real-time Error Detection Banner */}
          {nano?.lastError && (
             <div className="mx-auto max-w-2xl px-4 py-3 mb-4 animate-in slide-in-from-bottom flex justify-between items-center bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl shadow-lg z-50">
                <div className="flex-1 min-w-0 pr-4">
                   <p className="font-semibold mb-1">Pico Runtime Issue detected</p>
                   <p className="text-xs opacity-90 truncate font-mono bg-red-500/5 p-1 rounded mb-1">{nano.lastError.bug}</p>
                   <p className="text-xs mt-1 text-red-400 font-medium flex items-center gap-1">
                     <Brain className="h-3 w-3" /> {nano.lastError.fix}
                   </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={nano.repairAndRetry}
                    className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Repair
                  </button>
                  <button 
                    onClick={nano.clearError} 
                    className="p-1.5 hover:bg-red-500/20 rounded-md transition-colors shrink-0"
                  >
                     <X className="h-4 w-4" />
                  </button>
                </div>
             </div>
          )}
        </div>

        {/* Input Area (when in conversation) */}
        {!isNewChat && (
          <div className="shrink-0 border-t border-border bg-bg-0 p-4 safe-area-bottom relative">
            <div className="mx-auto max-w-2xl">
              <ChatInput
                selectedModel={selectedModel}
                onModelChange={onModelChange}
                onSend={onSend}
                isLoading={isLoading}
                placeholder="Reply..."
              />
            </div>
            <p className="mt-2 text-center text-xs text-text-3">
              Zero is AI and can make mistakes. Please double-check responses.
            </p>
          </div>
        )}
      </div>

      {/* Right App Factory Column */}
      {activeAppMessage && appPanelOpen && (
        <div className="flex-1 min-w-0 h-full relative">
          <AppFactory 
            files={activeAppMessage.appFactoryFiles || {}} 
            description={activeAppMessage.appFactoryDescription}
            onClose={() => setAppPanelOpen(false)}
          />
        </div>
      )}
      
      {/* Mini Toggle Button if closed */}
      {activeAppMessage && !appPanelOpen && (
        <button
          onClick={() => setAppPanelOpen(true)}
          className="absolute right-4 top-20 rounded-xl bg-bg-2 p-3 text-text-1 shadow-lg border border-border transition-transform hover:scale-105"
        >
          <Code className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
