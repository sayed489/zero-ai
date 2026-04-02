'use client'

import { useRef, useEffect, useState } from 'react'
import { Menu, Ghost, Plus, Cloud, Sun, CloudRain, CloudLightning, Moon, Code, Brain, X, AlertCircle } from 'lucide-react'
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
  activity?: ZeroActivityType
): 'idle' | 'happy' | 'sleep' | 'thinking' | 'eating' | 'drinking' | 'wink' | 'surprised' | 'celebrating' {
  if (activity) return activity
  if (isLoading) return 'thinking'
  switch (mood) {
    case 'happy': return 'happy'
    case 'sleepy': return 'sleep'
    case 'raining':
    case 'thundering':
      return 'idle'
    default: return 'idle'
  }
}

// Weather icon component
function WeatherIcon({ mood }: { mood: ZeroMood }) {
  const iconClass = "h-4 w-4"
  switch (mood) {
    case 'happy': return <Sun className={cn(iconClass, "text-yellow-500")} />
    case 'raining': return <CloudRain className={cn(iconClass, "text-blue-400")} />
    case 'thundering': return <CloudLightning className={cn(iconClass, "text-purple-400")} />
    case 'sleepy': return <Moon className={cn(iconClass, "text-indigo-400")} />
    default: return <Cloud className={cn(iconClass, "text-text-3")} />
  }
}

interface ChatAreaProps {
  messages: ChatMessage[]
  isLoading: boolean
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
    isReady: boolean
    heavyReady?: boolean
    currentModel?: string | null
    lastError?: { bug: string; fix: string } | null
    clearError?: () => void
    forceDownload?: () => void
    repairAndRetry?: () => void
  }
}

export function ChatArea({
  messages,
  isLoading,
  selectedModel,
  onModelChange,
  onSend,
  onRegenerate,
  onOpenSidebar,
  onNewChat,
  userName = 'there',
  isIncognito = false,
  nano
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isNewChat = messages.length === 0
  const [mounted, setMounted] = useState(false)
  const [zeroActivity, setZeroActivity] = useState<ZeroActivityType | undefined>(undefined)
  const [autoMode, setAutoMode] = useState(true)
  const weatherState = useWeatherZero()

  const activeAppMessage = messages.slice().reverse().find(m => m.hasAppFactory)
  const [appPanelOpen, setAppPanelOpen] = useState(true)

  useEffect(() => {
    if (activeAppMessage) setAppPanelOpen(true)
  }, [activeAppMessage?.id])

  // Auto-cycle through emotions slowly and randomly - focus on eating/drinking/weather states
  useEffect(() => {
    if (!autoMode || !isNewChat) return
    
    // Weighted emotions - eating and drinking appear more often
    const emotions: Array<ZeroActivityType | undefined> = [
      'eating', 'eating', 'drinking', 'drinking', // Higher weight for eating/drinking
      'happy', 'wink', 'sleep', 
      undefined, undefined // Idle states
    ]
    
    let timeoutId: NodeJS.Timeout
    
    const cycleToNext = () => {
      // Random delay between 12-25 seconds for natural, slower feel
      const delay = 12000 + Math.random() * 13000
      timeoutId = setTimeout(() => {
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]
        setZeroActivity(randomEmotion)
        cycleToNext()
      }, delay)
    }
    
    // Start with a random state
    const initialEmotion = emotions[Math.floor(Math.random() * emotions.length)]
    setZeroActivity(initialEmotion)
    cycleToNext()
    
    return () => clearTimeout(timeoutId)
  }, [autoMode, isNewChat])

  // Stop auto-cycling when user manually selects an emotion
  const handleEmotionClick = (emotion: typeof zeroActivity) => {
    setAutoMode(false)
    setZeroActivity(zeroActivity === emotion ? undefined : emotion)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-scroll to bottom on new messages
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
  }, [weatherState.mood, weatherState.isLoading]);

  return (
    <div className="relative flex flex-1 overflow-hidden bg-bg-0">
      {/* Left Chat Column */}
      <div className={cn(
        "flex h-full flex-col transition-all duration-300",
        activeAppMessage && appPanelOpen ? "w-[400px] shrink-0 border-r border-border" : "flex-1"
      )}>
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <button
          onClick={onOpenSidebar}
          className="rounded-lg p-2 text-text-2 hover:bg-bg-2 hover:text-text-1 md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="flex-1" />

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
        
        {/* Nano Loading Progress */}
        {(selectedModel === 'nano-fast' || selectedModel === 'nano-pro') && (nano?.status === 'checking' || nano?.status === 'loading') && (
          <div className="mr-3 flex w-[200px] flex-col gap-1">
            <div className="flex w-full items-center justify-between text-xs font-medium text-text-2">
              <span className="text-[11px]">Loading Nano…</span>
              <span className="font-mono text-[11px]">{nano.progress}%</span>
            </div>
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-bg-3">
              <div 
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                style={{ width: `${nano.progress}%`, transition: 'width 0.3s ease-out' }}
              />
            </div>
            <button 
              onClick={nano.repairAndRetry}
              className="text-start text-[10px] text-text-3 hover:text-emerald-400 underline underline-offset-2 transition-colors"
            >
              Stuck? Clear & Retry
            </button>
          </div>
        )}

        {/* Nano Error */}
        {(selectedModel === 'nano-fast' || selectedModel === 'nano-pro') && nano?.status === 'error' && (
          <button 
            onClick={nano.repairAndRetry}
            className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-500 transition-all hover:bg-red-500/30 hover:scale-105"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Failed · Clear & Retry
          </button>
        )}

        {/* Nano Ready Badge */}
        {(selectedModel === 'nano-fast' || selectedModel === 'nano-pro') && nano?.status === 'ready' && (
          <div className="mr-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-500">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">{nano.heavyReady ? 'Nano · Pro' : 'Nano · Fast'}</span>
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
          /* Welcome State - Claude style */
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

            {/* Mascot + Welcome - Auto cycling emotions */}
            <div className="mb-6 flex flex-col items-center gap-5">
              {/* Large Zero Mascot with closely overlapping props */}
              <div className="relative flex items-center justify-center h-[140px] w-[140px]">
                {/* Zero Mascot */}
                <ZeroMascot 
                  size={120} 
                  state={mounted ? getMascotState(weatherState.mood, weatherState.isLoading, zeroActivity) : 'idle'}
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
                  "left-1/2 -translate-x-1/2 bottom-[8px]",  // perfectly centered, adjusted up slightly
                  zeroActivity === 'eating' 
                    ? "opacity-100 scale-100 translate-y-0" 
                    : "opacity-0 scale-90 translate-y-4"
                )}>
                  <RamenBowl size={44} animated={zeroActivity === 'eating'} />
                </div>

                {/* Milk Box (held exactly at mouth) */}
                <div className={cn(
                  "absolute z-20 pointer-events-none transition-all duration-500",
                  "left-1/2 -translate-x-1/2 bottom-[8px]", // perfectly centered, adjusted up slightly
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

            {/* Weather-aware greeting - only show dynamic content after mount to avoid hydration mismatch */}
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
                {/* Rotating glow effect */}
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
        ) : (
          /* Message List */
          <MessageList
            messages={messages}
            isLoading={isLoading}
            onRegenerate={onRegenerate}
          />
        )}
      </div>

      {/* Input Area (when in conversation) */}
      {!isNewChat && (
        <div className="shrink-0 border-t border-border bg-bg-0 p-4 safe-area-bottom relative">
          
          {/* Real-time Error Detection Banner */}
          {nano?.lastError && (
             <div className="absolute bottom-full left-0 right-0 p-3 mx-auto max-w-2xl translate-y-[-10px] animate-in slide-in-from-bottom flex justify-between items-center bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg shadow-lg z-50">
                <div className="flex-1 min-w-0 pr-4">
                   <p className="font-semibold mb-1">Nano Runtime Issue Detected</p>
                   <p className="text-xs opacity-90 truncate font-mono bg-red-500/5 p-1 rounded mb-1">{nano.lastError.bug}</p>
                   <p className="text-xs mt-1 text-red-400 font-medium flex items-center gap-1">
                     <Brain className="h-3 w-3" /> {nano.lastError.fix}
                   </p>
                </div>
                <button 
                  onClick={nano.clearError} 
                  className="p-1.5 hover:bg-red-500/20 rounded-md transition-colors shrink-0"
                  aria-label="Dismiss error"
                >
                   <X className="h-4 w-4" />
                </button>
             </div>
          )}

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
