'use client'

import { MessageBubble } from '@/components/chat/message-bubble'
import { ZeroThinking } from '@/components/mascot/zero-thinking'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/lib/types'

interface MessageListProps {
  messages: ChatMessage[]
  isLoading: boolean
  isThinking?: boolean
  thinkingStatus?: string
  onRegenerate: () => void
  compact?: boolean
}

export function MessageList({ messages, isLoading, isThinking, thinkingStatus, onRegenerate, compact = false }: MessageListProps) {
  return (
    <div className={cn(
      'mx-auto px-4 py-4',
      compact ? 'max-w-full' : 'max-w-3xl py-6'
    )}>
      <div className={cn('space-y-4', !compact && 'space-y-6')}>
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isLast={index === messages.length - 1}
            onRegenerate={onRegenerate}
            compact={compact}
          />
        ))}
        
        {isThinking && (
          <div className={cn('py-4 flex flex-col items-start gap-2 animate-in fade-in slide-in-from-left-2 duration-700', !compact && 'py-6')}>
            <div className="flex items-center gap-3 text-text-3 px-1">
               <div className="flex gap-1.5 items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-zero-300 animate-pulse" style={{ animationDuration: '1s' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-zero-300 animate-pulse opacity-60" style={{ animationDuration: '1s', animationDelay: '200ms' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-zero-300 animate-pulse opacity-30" style={{ animationDuration: '1s', animationDelay: '400ms' }} />
               </div>
               <span className="text-sm font-medium tracking-tight animate-pulse underline decoration-zero-300/30 underline-offset-4 decoration-2">
                 {thinkingStatus || 'Thinking...'}
               </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
