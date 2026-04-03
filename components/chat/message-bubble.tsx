'use client'

import { useState } from 'react'
import { Copy, RefreshCw, Share2, ThumbsDown, Check, Volume2, VolumeX } from 'lucide-react'
import { ZeroMascot } from '@/components/mascot/zero-mascot'
import { CodeBlock } from '@/components/chat/code-block'
import { ImageCard } from '@/components/chat/image-card'
import { cn } from '@/lib/utils'
import { useVoice } from '@/hooks/useVoice'
import type { ChatMessage } from '@/lib/types'

interface MessageBubbleProps {
  message: ChatMessage
  isLast: boolean
  onRegenerate: () => void
  compact?: boolean
}

// ─── Markdown renderer (no dependencies) ────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let key = 0

  // Split by lines for block-level parsing
  const lines = text.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Headers
    if (line.startsWith('### ')) {
      nodes.push(<h3 key={key++} className="mt-4 mb-2 text-base font-semibold text-text-1">{renderInline(line.slice(4))}</h3>)
      i++; continue
    }
    if (line.startsWith('## ')) {
      nodes.push(<h2 key={key++} className="mt-5 mb-2 text-lg font-semibold text-text-1">{renderInline(line.slice(3))}</h2>)
      i++; continue
    }
    if (line.startsWith('# ')) {
      nodes.push(<h1 key={key++} className="mt-6 mb-3 text-xl font-bold text-text-1">{renderInline(line.slice(2))}</h1>)
      i++; continue
    }

    // Unordered lists
    if (/^[-*] /.test(line)) {
      const items: React.ReactNode[] = []
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(<li key={key++} className="ml-4 list-disc text-text-1">{renderInline(lines[i].slice(2))}</li>)
        i++
      }
      nodes.push(<ul key={key++} className="my-2 space-y-1">{items}</ul>)
      continue
    }

    // Ordered lists
    if (/^\d+\. /.test(line)) {
      const items: React.ReactNode[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(<li key={key++} className="ml-4 list-decimal text-text-1">{renderInline(lines[i].replace(/^\d+\.\s/, ''))}</li>)
        i++
      }
      nodes.push(<ol key={key++} className="my-2 space-y-1">{items}</ol>)
      continue
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={key++} className="my-4 border-border" />)
      i++; continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2))
        i++
      }
      nodes.push(
        <blockquote key={key++} className="my-2 border-l-3 border-zero-300 pl-4 italic text-text-2">
          {quoteLines.map((ql, qi) => <span key={qi}>{renderInline(ql)}<br /></span>)}
        </blockquote>
      )
      continue
    }

    // Empty line
    if (line.trim() === '') {
      i++; continue
    }

    // Regular paragraph
    nodes.push(<p key={key++} className="my-1 text-text-1 leading-relaxed">{renderInline(line)}</p>)
    i++
  }

  return nodes
}

// ─── Inline markdown ────────────────────────────────────────────────────────
function renderInline(text: string): React.ReactNode {
  // Process inline elements: bold, italic, inline code, links, images
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Image: ![alt](url)
    const imgMatch = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/)
    if (imgMatch) {
      parts.push(
        <img key={key++} src={imgMatch[2]} alt={imgMatch[1]}
          className="my-2 max-w-full rounded-lg border border-border" loading="lazy" />
      )
      remaining = remaining.slice(imgMatch[0].length)
      continue
    }

    // Link: [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
    if (linkMatch) {
      parts.push(
        <a key={key++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer"
          className="text-zero-300 underline decoration-zero-300/30 hover:decoration-zero-300">{linkMatch[1]}</a>
      )
      remaining = remaining.slice(linkMatch[0].length)
      continue
    }

    // Bold: **text**
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/)
    if (boldMatch) {
      parts.push(<strong key={key++} className="font-semibold text-text-1">{boldMatch[1]}</strong>)
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }

    // Italic: *text*
    const italicMatch = remaining.match(/^\*(.+?)\*/)
    if (italicMatch) {
      parts.push(<em key={key++} className="italic">{italicMatch[1]}</em>)
      remaining = remaining.slice(italicMatch[0].length)
      continue
    }

    // Inline code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/)
    if (codeMatch) {
      parts.push(
        <code key={key++} className="rounded bg-bg-3 px-1.5 py-0.5 text-sm font-mono text-zero-300">{codeMatch[1]}</code>
      )
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }

    // Regular text — consume until next special char
    const nextSpecial = remaining.search(/[*`\[!]/)
    if (nextSpecial === -1) {
      parts.push(remaining)
      break
    } else if (nextSpecial === 0) {
      // Special char that didn't match any pattern — treat as text
      parts.push(remaining[0])
      remaining = remaining.slice(1)
    } else {
      parts.push(remaining.slice(0, nextSpecial))
      remaining = remaining.slice(nextSpecial)
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>
}

export function MessageBubble({ message, isLast, onRegenerate, compact = false }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const voice = useVoice()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVoice = () => {
    if (voice.isSpeaking) {
      voice.stopSpeaking()
    } else {
      voice.speak(message.content)
    }
  }

  // Parse content for code blocks — code blocks rendered separately, rest as markdown
  const renderContent = (content: string) => {
    const codeBlockRegex = /```(\w+)?(?:\s+filename="[^"]*")?\n([\s\S]*?)```/g
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = content.slice(lastIndex, match.index)
        parts.push(<div key={`md-${lastIndex}`}>{renderMarkdown(textBefore)}</div>)
      }
      parts.push(
        <CodeBlock
          key={`code-${match.index}`}
          language={match[1] || 'plaintext'}
          code={match[2].trim()}
        />
      )
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < content.length) {
      const textAfter = content.slice(lastIndex)
      parts.push(<div key={`md-${lastIndex}`}>{renderMarkdown(textAfter)}</div>)
    }

    return parts.length > 0 ? parts : <div>{renderMarkdown(content)}</div>
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

        {message.hasImage && message.imageUrl && (
          <ImageCard imageUrl={message.imageUrl} prompt={message.content} />
        )}

        {!message.isStreaming && message.content && (
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

            {/* Voice read-aloud button */}
            <button
              onClick={handleVoice}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors',
                voice.isSpeaking
                  ? 'bg-zero-300/10 text-zero-300'
                  : 'text-text-3 hover:bg-bg-2 hover:text-text-2'
              )}
            >
              {voice.isSpeaking ? <><VolumeX className="h-3.5 w-3.5" />Stop</> : <><Volume2 className="h-3.5 w-3.5" />Listen</>}
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
