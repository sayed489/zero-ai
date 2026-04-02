'use client'

import { useState } from 'react'
import { Copy, RefreshCw, Share2, ThumbsDown, Check } from 'lucide-react'
import { ZeroMascot } from '@/components/mascot/zero-mascot'
import { CodeBlock } from '@/components/chat/code-block'
import { ImageCard } from '@/components/chat/image-card'
import { AppFactory } from '@/components/features/app-factory'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/lib/types'

interface MessageBubbleProps {
  message: ChatMessage
  isLast: boolean
  onRegenerate: () => void
  compact?: boolean
}

export function MessageBubble({ message, isLast, onRegenerate, compact = false }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Parse content for code blocks
  const renderContent = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={lastIndex} className="whitespace-pre-wrap">
            {content.slice(lastIndex, match.index)}
          </span>
        )
      }
      parts.push(
        <CodeBlock
          key={match.index}
          language={match[1] || 'plaintext'}
          code={match[2].trim()}
        />
      )
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < content.length) {
      parts.push(
        <span key={lastIndex} className="whitespace-pre-wrap">
          {content.slice(lastIndex)}
        </span>
      )
    }

    return parts.length > 0 ? parts : <span className="whitespace-pre-wrap">{content}</span>
  }

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className={cn(
          'rounded-2xl bg-bg-3 px-4 py-3',
          compact ? 'max-w-[85%] text-sm' : 'max-w-lg'
        )}>
          <p className="text-text-1">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-3', compact && 'gap-2')}>
      <div className="shrink-0">
        <ZeroMascot size={compact ? 24 : 28} state={message.isStreaming ? 'thinking' : 'idle'} />
      </div>

      <div className="min-w-0 flex-1">
        <div className={cn('text-text-1', compact && 'text-sm')}>
          {renderContent(message.content)}
          {message.isStreaming && (
            <span className="stream-cursor ml-0.5 inline-block h-4 w-0.5 bg-zero-300" />
          )}
        </div>

        {/* Premium Image Card with Zero branding */}
        {message.hasImage && message.imageUrl && (
          <ImageCard imageUrl={message.imageUrl} prompt={message.content} />
        )}

        {/* App Factory Output removed to support Split UI */}

        {!message.isStreaming && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors',
                copied
                  ? 'bg-green-500/10 text-green-500'
                  : 'text-text-3 hover:bg-bg-2 hover:text-text-2'
              )}
            >
              {copied ? <><Check className="h-3.5 w-3.5" />Copied</> : <><Copy className="h-3.5 w-3.5" />Copy</>}
            </button>

            <button className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-text-3 transition-colors hover:bg-bg-2 hover:text-text-2">
              <Share2 className="h-3.5 w-3.5" />Share
            </button>

            {isLast && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-text-3 transition-colors hover:bg-bg-2 hover:text-text-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />Regenerate
              </button>
            )}

            <button className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-text-3 transition-colors hover:bg-bg-2 hover:text-text-2">
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
