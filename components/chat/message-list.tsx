'use client'

import { MessageBubble } from '@/components/chat/message-bubble'
import { ZeroThinking } from '@/components/mascot/zero-thinking'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/lib/types'

interface MessageListProps {
  messages: ChatMessage[]
  isLoading: boolean
  onRegenerate: () => void
  compact?: boolean
}

export function MessageList({ messages, isLoading, onRegenerate, compact = false }: MessageListProps) {
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
        
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className={cn('py-2', !compact && 'py-4')}>
            <ZeroThinking size={compact ? 'sm' : 'md'} />
          </div>
        )}
      </div>
    </div>
  )
}
