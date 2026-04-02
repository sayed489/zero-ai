'use client'

import { ZeroMascot } from './zero-mascot'
import { cn } from '@/lib/utils'

interface ZeroThinkingProps {
  className?: string
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ZeroThinking({ 
  className, 
  message = 'Zero is thinking...',
  size = 'md' 
}: ZeroThinkingProps) {
  const sizeMap = {
    sm: { mascot: 28, text: 'text-xs' },
    md: { mascot: 36, text: 'text-sm' },
    lg: { mascot: 48, text: 'text-base' },
  }
  
  const { mascot, text } = sizeMap[size]
  
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative">
        <ZeroMascot size={mascot} state="thinking" interactive={false} />
        <div className="absolute -inset-2 rounded-full bg-zero-400/10 animate-pulse -z-10" />
      </div>
      <div className="flex items-center gap-2">
        <span className={cn('text-text-2 font-medium', text)}>{message}</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="thinking-dot h-1.5 w-1.5 rounded-full bg-zero-400"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
