'use client'

import { useRef, useEffect, useState } from 'react'
import { Menu, Ghost, Plus, Cloud, Sun, CloudRain, CloudLightning, Moon, Code, Brain, X, AlertCircle, Zap, Rocket, Cpu } from 'lucide-react'
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
          
          {/* Pico Status Badge - Compact Premium UI */}
          {selectedModel === 'pico' && (
            <div className="mr-3 animate-in fade-in duration-300">
              {nano?.status === 'unavailable' && (
                <button 
                  onClick={nano.forceDownload}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-all"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Enable Pico</span>
                </button>
              )}

              {(nano?.status === 'checking' || nano?.status === 'loading') && (
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-bg-2 border border-border">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-text-2">Downloading</span>
                  </div>
                  <div className="w-20 h-1.5 bg-bg-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${nano.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-emerald-400">{nano.progress}%</span>
                </div>
              )}

              {nano?.status === 'error' && (
                <button 
                  onClick={nano.repairAndRetry}
                  className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-all"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Repair</span>
                </button>
              )}

              {nano?.status === 'ready' && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-400">Pico Ready</span>
                </div>
              )}
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
                /* Premium Pico Hub - Billion Dollar UI */
                <div className="flex flex-col items-center justify-center py-8 px-6 animate-in fade-in zoom-in-95 duration-700 w-full max-w-xl text-center">
                  {/* Floating orb with glow */}
                  <div className="relative mb-10">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-500/30 blur-3xl scale-150 animate-pulse" />
                    <div className="relative">
                      <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40 rotate-3 hover:rotate-0 transition-all duration-500">
                        <Cpu className="h-12 w-12 text-white drop-shadow-lg" />
                      </div>
                      {/* Status badge */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-bg-1 border border-emerald-500/30 shadow-lg">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          On-Device AI
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl font-bold text-text-1 mb-2">
                    Zero Pico
                  </h2>
                  <p className="text-sm text-text-3 mb-8 max-w-xs">
                    100% private AI that runs entirely on your device. No cloud, no tracking, just fast.
                  </p>

                  {/* Main card */}
                  <div className="w-full bg-bg-2/50 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-6">
                    {nano?.status === 'unavailable' ? (
                      <>
                        {/* Feature badges */}
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
                            Private
                          </span>
                          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
                            Offline
                          </span>
                          <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-400">
                            Fast
                          </span>
                          <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-medium text-orange-400">
                            ~2GB
                          </span>
                        </div>

                        {/* Download button */}
                        <button 
                          onClick={nano.forceDownload}
                          className="w-full flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Zap className="h-4 w-4" />
                          Download Pico AI
                          <Rocket className="h-4 w-4" />
                        </button>

                        <p className="text-xs text-text-3">
                          One-time download. Works offline forever.
                        </p>
                      </>
                    ) : (
                      <>
                        {/* Loading state */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-text-2 flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                              {nano?.status === 'ready' ? 'Ready' : 'Downloading...'}
                            </span>
                            <span className="text-sm font-bold text-emerald-400">{nano?.progress ?? 0}%</span>
                          </div>

                          {/* Progress bar */}
                          <div className="relative h-2 w-full bg-bg-3 rounded-full overflow-hidden">
                            <div 
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${nano?.progress ?? 0}%` }}
                            />
                          </div>

                          <p className="text-xs text-text-3">{nano?.statusText}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Alternative models */}
                  <div className="mt-8 w-full">
                    <p className="text-xs text-text-3 mb-3">Or use cloud models</p>
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={() => onModelChange('nano')}
                        className="px-4 py-2 rounded-lg bg-bg-2 border border-border text-sm font-medium text-text-2 hover:text-text-1 hover:bg-bg-3 transition-all"
                      >
                        Zero Nano
                      </button>
                      <button 
                        onClick={() => onModelChange('prime')}
                        className="px-4 py-2 rounded-lg bg-bg-2 border border-border text-sm font-medium text-text-2 hover:text-text-1 hover:bg-bg-3 transition-all"
                      >
                        Zero Prime
                      </button>
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
