'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Sparkles, Zap, Rocket, Bot } from 'lucide-react'
import { MODELS, type AIModel, type ModelInfo } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ModelSelectorProps {
  selected: AIModel
  onChange: (model: AIModel) => void
  extendedThinking?: boolean
  onExtendedThinkingChange?: (enabled: boolean) => void
}

const modelIcons: Record<AIModel, React.ReactNode> = {
  'nano-fast': <Zap className="h-4 w-4" />,
  'nano-pro': <Rocket className="h-4 w-4" />,
  'prime': <Sparkles className="h-4 w-4" />,
  'apex': <Sparkles className="h-4 w-4" />,
  'agentic-chad': <Bot className="h-4 w-4" />
}

export function ModelSelector({ 
  selected, 
  onChange,
  extendedThinking = false,
  onExtendedThinkingChange
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedModel = MODELS.find((m) => m.id === selected) || MODELS[0]

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Group models by tier
  const defaultModels = MODELS.filter(m => m.tier === 'default')
  const proModels = MODELS.filter(m => m.tier === 'pro')
  const newModels = MODELS.filter(m => m.tier === 'new')

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg bg-bg-2 px-3 py-1.5 text-sm text-text-1 transition-colors hover:bg-bg-3"
      >
        <span className="text-zero-300">{modelIcons[selected]}</span>
        <span>{selectedModel.name}</span>
        <ChevronDown className={cn('h-4 w-4 text-text-2 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-80 overflow-hidden rounded-xl border border-border bg-bg-1 shadow-xl">
          {/* Selected model with extended thinking */}
          <div className="border-b border-border p-3">
            <ModelItem 
              model={selectedModel} 
              icon={modelIcons[selectedModel.id]}
              isSelected 
              onClick={() => {}}
              showCheck
            />
            
            {/* Extended thinking toggle */}
            {selectedModel.supportsExtendedThinking && onExtendedThinkingChange && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-bg-2 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-text-1">Extended thinking</p>
                  <p className="text-xs text-text-3">Think longer for complex tasks</p>
                </div>
                <button
                  onClick={() => onExtendedThinkingChange(!extendedThinking)}
                  className={cn(
                    'relative h-5 w-9 rounded-full transition-colors',
                    extendedThinking ? 'bg-zero-300' : 'bg-bg-3'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                      extendedThinking ? 'translate-x-4' : 'translate-x-0.5'
                    )}
                  />
                </button>
              </div>
            )}
          </div>

          {/* More models */}
          <div className="max-h-80 overflow-y-auto p-2">
            <p className="px-2 py-1 text-xs font-medium text-text-3">Standard</p>
            {defaultModels.filter(m => m.id !== selected).map((model) => (
              <ModelItem
                key={model.id}
                model={model}
                icon={modelIcons[model.id]}
                isSelected={selected === model.id}
                onClick={() => {
                  onChange(model.id)
                  setOpen(false)
                }}
              />
            ))}
            
            {proModels.length > 0 && (
              <>
                <div className="my-1 h-px bg-border" />
                <p className="px-2 py-1 text-xs font-medium text-text-3">Pro</p>
                {proModels.filter(m => m.id !== selected).map((model) => (
                  <ModelItem
                    key={model.id}
                    model={model}
                    icon={modelIcons[model.id]}
                    isSelected={selected === model.id}
                    onClick={() => {
                      onChange(model.id)
                      setOpen(false)
                    }}
                    badge="Pro"
                  />
                ))}
              </>
            )}
            
            {newModels.length > 0 && (
              <>
                <div className="my-1 h-px bg-border" />
                <p className="px-2 py-1 text-xs font-medium text-text-3">New</p>
                {newModels.filter(m => m.id !== selected).map((model) => (
                  <ModelItem
                    key={model.id}
                    model={model}
                    icon={modelIcons[model.id]}
                    isSelected={selected === model.id}
                    onClick={() => {
                      onChange(model.id)
                      setOpen(false)
                    }}
                    badge="New"
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface ModelItemProps {
  model: ModelInfo
  icon: React.ReactNode
  isSelected: boolean
  onClick: () => void
  showCheck?: boolean
  badge?: string
}

function ModelItem({ model, icon, isSelected, onClick, showCheck, badge }: ModelItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
        isSelected ? 'bg-bg-2' : 'hover:bg-bg-2'
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-3 text-zero-300">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-1">{model.name}</span>
          {badge && (
            <span className={cn(
              'rounded px-1.5 py-0.5 text-xs font-medium',
              badge === 'New' ? 'bg-green-500/20 text-green-400' : 'bg-zero-300/20 text-zero-300'
            )}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-text-3 truncate">{model.description}</p>
      </div>
      {showCheck && isSelected && (
        <Check className="h-4 w-4 text-zero-300 shrink-0" />
      )}
    </button>
  )
}

// Voice input indicator
export function VoiceIndicator({ isActive }: { isActive: boolean }) {
  return (
    <div className={cn(
      'flex items-center justify-center gap-0.5',
      isActive && 'animate-pulse'
    )}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-0.5 rounded-full bg-text-2 transition-all',
            isActive ? 'voice-bar' : 'h-2'
          )}
          style={{
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  )
}
