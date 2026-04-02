'use client'

import { useState, useEffect } from 'react'
import { ZeroMascot, type MascotState } from './zero-mascot'
import { cn } from '@/lib/utils'

interface FloatingMascotProps {
  className?: string
  defaultState?: MascotState
  message?: string
  showMessage?: boolean
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  autoAnimate?: boolean
}

export function FloatingMascot({
  className,
  defaultState = 'idle',
  message,
  showMessage = false,
  position = 'bottom-right',
  autoAnimate = true,
}: FloatingMascotProps) {
  const [state, setState] = useState<MascotState>(defaultState)
  const [isExpanded, setIsExpanded] = useState(false)
  const [bubbleVisible, setBubbleVisible] = useState(showMessage)

  // Auto-animate through expressions
  useEffect(() => {
    if (!autoAnimate) return
    
    const expressions: MascotState[] = ['idle', 'happy', 'wink', 'idle']
    let index = 0
    
    const interval = setInterval(() => {
      index = (index + 1) % expressions.length
      setState(expressions[index])
    }, 4000)
    
    return () => clearInterval(interval)
  }, [autoAnimate])

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  }

  const bubblePosition = {
    'bottom-right': '-left-4 -translate-x-full bottom-4',
    'bottom-left': '-right-4 translate-x-full bottom-4',
    'top-right': '-left-4 -translate-x-full top-4',
    'top-left': '-right-4 translate-x-full top-4',
  }

  return (
    <div 
      className={cn(
        'fixed z-50',
        positionClasses[position],
        className
      )}
    >
      {/* Speech bubble */}
      {bubbleVisible && message && (
        <div 
          className={cn(
            'absolute whitespace-nowrap',
            'bg-bg-1 border border-stroke-1 rounded-2xl px-4 py-2',
            'shadow-lg shadow-black/5',
            'animate-in fade-in slide-in-from-bottom-2 duration-300',
            bubblePosition[position]
          )}
        >
          <p className="text-text-1 text-sm font-medium">{message}</p>
          {/* Bubble tail */}
          <div 
            className={cn(
              'absolute w-3 h-3 bg-bg-1 border-r border-b border-stroke-1 rotate-[-45deg]',
              position.includes('right') ? '-right-1.5' : '-left-1.5',
              'top-1/2 -translate-y-1/2'
            )}
          />
        </div>
      )}

      {/* Mascot container */}
      <div 
        className={cn(
          'relative transition-transform duration-300 ease-out',
          isExpanded && 'scale-110'
        )}
        onMouseEnter={() => {
          setIsExpanded(true)
          if (message) setBubbleVisible(true)
        }}
        onMouseLeave={() => {
          setIsExpanded(false)
          if (!showMessage) setBubbleVisible(false)
        }}
      >
        {/* Glow ring */}
        <div className={cn(
          'absolute inset-0 rounded-full',
          'bg-gradient-to-br from-zero-400/30 to-zero-600/20',
          'blur-xl scale-150 opacity-0 transition-opacity duration-300',
          isExpanded && 'opacity-100'
        )} />
        
        {/* Shadow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/10 rounded-full blur-md" />
        
        {/* Mascot */}
        <ZeroMascot 
          size={72}
          state={state}
          mood="chill"
          interactive
          onClick={() => {
            setState('happy')
            setBubbleVisible(true)
            setTimeout(() => setState(defaultState), 1500)
          }}
        />
      </div>
    </div>
  )
}
