'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Sparkles, Zap, Rocket, Bot, Cpu, Search, Brain } from 'lucide-react'
import { MODELS, type AIModel, type ModelInfo } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ModelSelectorProps {
  selected: AIModel
  onChange: (model: AIModel) => void
  extendedThinking?: boolean
  onExtendedThinkingChange?: (enabled: boolean) => void
  isThinking?: boolean
  isSearching?: boolean
}

const modelIcons: Record<AIModel, React.ReactNode> = {
  'pico':         <Zap className="h-4 w-4" />,
  'nano':         <Cpu className="h-4 w-4" />,
  'prime':        <Sparkles className="h-4 w-4" />,
  'apex':         <Rocket className="h-4 w-4" />,
  'agentic-chad': <Bot className="h-4 w-4" />,
}

const modelColors: Record<AIModel, string> = {
  'pico':         'text-emerald-400',
  'nano':         'text-blue-400',
  'prime':        'text-violet-400',
  'apex':         'text-orange-400',
  'agentic-chad': 'text-pink-400',
}

const tierBadge: Record<string, { label: string; color: string }> = {
  local: { label: 'Local', color: 'bg-emerald-500/20 text-emerald-400' },
  cloud: { label: 'Cloud', color: 'bg-blue-500/20 text-blue-400' },
  agent: { label: 'Agent', color: 'bg-pink-500/20 text-pink-400' },
}

// Thinking animation — 3 dots bouncing
function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-[3px]">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
        />
      ))}
    </span>
  )
}

// Search animation — pulsing radar ring
function SearchPulse() {
  return (
    <span className="relative inline-flex h-4 w-4">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-50" />
      <Search className="relative h-4 w-4 text-blue-400" />
    </span>
  )
}

export function ModelSelector({
  selected,
  onChange,
  extendedThinking = false,
  onExtendedThinkingChange,
  isThinking = false,
  isSearching = false,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedModel = MODELS.find(m => m.id === selected) || MODELS[0]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const localModels  = MODELS.filter(m => m.tier === 'local')
  const cloudModels  = MODELS.filter(m => m.tier === 'cloud')
  const agentModels  = MODELS.filter(m => m.tier === 'agent')

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg bg-bg-2 px-3 py-1.5 text-sm text-text-1 transition-all hover:bg-bg-3 hover:shadow-sm"
      >
        {/* Animated state icon */}
        {isSearching ? (
          <SearchPulse />
        ) : isThinking ? (
          <span className={modelColors[selected]}><Brain className="h-4 w-4 animate-pulse" /></span>
        ) : (
          <span className={modelColors[selected]}>{modelIcons[selected]}</span>
        )}

        <span className="font-medium">{selectedModel.name}</span>

        {/* Backend model name */}
        <span className="hidden sm:inline text-[10px] text-text-3 bg-bg-3 px-1.5 py-0.5 rounded font-mono">
          {selectedModel.provider}
        </span>

        {/* State label */}
        {isThinking && (
          <span className="flex items-center gap-1 text-[10px] text-violet-400">
            <ThinkingDots />
          </span>
        )}
        {isSearching && (
          <span className="text-[10px] text-blue-400 font-medium animate-pulse">Searching…</span>
        )}

        <ChevronDown className={cn('h-3.5 w-3.5 text-text-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-80 overflow-hidden rounded-xl border border-border bg-bg-1 shadow-2xl shadow-black/50 z-50 backdrop-blur-xl">

          {/* Selected model detail */}
          <div className="border-b border-border p-3">
            <ModelItem
              model={selectedModel}
              isSelected
              onClick={() => {}}
              showCheck
            />

            {/* Extended thinking toggle */}
            {selectedModel.supportsExtendedThinking && onExtendedThinkingChange && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-bg-2 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-text-1 flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 text-violet-400" />
                    Extended Thinking
                  </p>
                  <p className="text-xs text-text-3">Think deeper on hard problems</p>
                </div>
                <button
                  onClick={() => onExtendedThinkingChange(!extendedThinking)}
                  className={cn(
                    'relative h-5 w-9 rounded-full transition-colors',
                    extendedThinking ? 'bg-violet-500' : 'bg-bg-3'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                    extendedThinking ? 'translate-x-4' : 'translate-x-0.5'
                  )} />
                </button>
              </div>
            )}
          </div>

          {/* Model list */}
          <div className="max-h-[320px] overflow-y-auto p-2 space-y-0.5">
            <p className="px-2 py-1 text-[10px] font-semibold text-text-3 uppercase tracking-widest">On-Device</p>
            {localModels.filter(m => m.id !== selected).map(model => (
              <ModelItem key={model.id} model={model} isSelected={false}
                onClick={() => { onChange(model.id); setOpen(false) }} />
            ))}

            <div className="my-1 h-px bg-border" />
            <p className="px-2 py-1 text-[10px] font-semibold text-text-3 uppercase tracking-widest">Cloud Models</p>
            {cloudModels.filter(m => m.id !== selected).map(model => (
              <ModelItem key={model.id} model={model} isSelected={false}
                onClick={() => { onChange(model.id); setOpen(false) }} />
            ))}

            {agentModels.length > 0 && (
              <>
                <div className="my-1 h-px bg-border" />
                <p className="px-2 py-1 text-[10px] font-semibold text-text-3 uppercase tracking-widest">Autonomous</p>
                {agentModels.filter(m => m.id !== selected).map(model => (
                  <ModelItem key={model.id} model={model} isSelected={false}
                    onClick={() => { onChange(model.id); setOpen(false) }} />
                ))}
              </>
            )}
          </div>

          {/* Usage bar footer */}
          <div className="border-t border-border px-3 py-2 flex items-center justify-between text-[10px] text-text-3">
            <span>Free plan limits reset daily at midnight UTC</span>
            <a href="/pricing" className="text-zero-300 hover:underline font-medium">Upgrade ↗</a>
          </div>
        </div>
      )}
    </div>
  )
}

function ModelItem({
  model,
  isSelected,
  onClick,
  showCheck,
}: {
  model: ModelInfo
  isSelected: boolean
  onClick: () => void
  showCheck?: boolean
}) {
  const badge = tierBadge[model.tier]
  const icon = modelIcons[model.id]
  const color = modelColors[model.id]

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all',
        isSelected ? 'bg-bg-2' : 'hover:bg-bg-2'
      )}
    >
      <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg bg-bg-3 shrink-0', color)}>
        {icon}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-text-1">{model.name}</span>
          <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide', badge.color)}>
            {badge.label}
          </span>
          {model.freeDailyLimit && model.freeDailyLimit < 9999 && (
            <span className="text-[9px] text-text-3 bg-bg-3 px-1.5 py-0.5 rounded">
              {model.freeDailyLimit}/day free
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-text-3">{model.description}</span>
        </div>
      </div>

      {showCheck && isSelected && (
        <Check className="h-4 w-4 text-zero-300 shrink-0" />
      )}
    </button>
  )
}

export function VoiceIndicator({ isActive }: { isActive: boolean }) {
  return (
    <div className={cn('flex items-center justify-center gap-0.5', isActive && 'animate-pulse')}>
      {[...Array(5)].map((_, i) => (
        <div key={i}
          className={cn('w-0.5 rounded-full bg-text-2 transition-all', isActive ? 'h-4' : 'h-2')}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  )
}
