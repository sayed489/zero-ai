'use client'

import { MessageBubble } from '@/components/chat/message-bubble'
import { AIThinking, AISearching, AIGenerating } from '@/components/chat/ai-thinking'
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
          <div className={cn('animate-in fade-in slide-in-from-bottom-2 duration-500', !compact && 'py-2')}>
            {thinkingStatus?.toLowerCase().includes('search') ? (
              <AISearching query={thinkingStatus.replace(/searching|for|the web/gi, '').trim()} />
            ) : thinkingStatus?.toLowerCase().includes('generat') ? (
              <AIGenerating what={thinkingStatus.replace(/generating/gi, '').trim() || 'response'} />
            ) : (
              <AIThinking 
                status={thinkingStatus || 'Thinking...'} 
                type={
                  thinkingStatus?.toLowerCase().includes('analyz') ? 'analyzing' :
                  thinkingStatus?.toLowerCase().includes('search') ? 'searching' :
                  'thinking'
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
