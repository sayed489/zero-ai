'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react'
import { ZeroMascot } from '@/components/mascot/zero-mascot'
import { MessageList } from '@/components/chat/message-list'
import { ChatInput } from '@/components/chat/chat-input'
import { useChat } from '@/hooks/use-chat'
import { cn } from '@/lib/utils'
import type { AIModel } from '@/lib/types'

interface ChatBoxProps {
  defaultOpen?: boolean
  position?: 'bottom-right' | 'bottom-left'
  className?: string
}

export function ChatBox({ 
  defaultOpen = false, 
  position = 'bottom-right',
  className 
}: ChatBoxProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isMinimized, setIsMinimized] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AIModel>('nano-fast')
  const scrollRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    isLoading,
    sendMessage,
    regenerateMessage,
    clearMessages,
  } = useChat()

  const handleSend = async (content: string, skill?: string) => {
    await sendMessage(content, selectedModel, skill)
  }

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const positionClasses = position === 'bottom-right' 
    ? 'right-4 sm:right-6' 
    : 'left-4 sm:left-6'

  // Floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-zero-400 text-white shadow-lg transition-all hover:bg-zero-500 hover:scale-110',
          positionClasses,
          className
        )}
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
        {messages.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
            {messages.length}
          </span>
        )}
      </button>
    )
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-1 shadow-2xl transition-all duration-300',
        positionClasses,
        isMinimized 
          ? 'h-14 w-72' 
          : 'h-[500px] w-[380px] sm:h-[550px] sm:w-[400px]',
        className
      )}
    >
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-bg-2 px-4">
        <div className="flex items-center gap-3">
          <ZeroMascot size={32} state={isLoading ? 'thinking' : 'idle'} interactive={false} />
          <div>
            <h3 className="text-sm font-semibold text-text-1">Zero AI</h3>
            <p className="text-xs text-text-3">
              {isLoading ? 'Thinking...' : messages.length > 0 ? `${messages.length} messages` : 'Ask me anything'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded-lg p-2 text-text-3 transition-colors hover:bg-bg-3 hover:text-text-1"
            aria-label={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 text-text-3 transition-colors hover:bg-bg-3 hover:text-text-1"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chat content - hidden when minimized */}
      {!isMinimized && (
        <>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <ZeroMascot size={64} state="happy" interactive />
                <h4 className="mt-4 text-lg font-medium text-text-1">Hi there!</h4>
                <p className="mt-2 text-sm text-text-3">
                  I&apos;m Zero, your AI assistant. How can I help you today?
                </p>
              </div>
            ) : (
              <MessageList
                messages={messages}
                isLoading={isLoading}
                onRegenerate={regenerateMessage}
                compact
              />
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-border p-3">
            <ChatInput
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              onSend={handleSend}
              isLoading={isLoading}
              placeholder="Type a message..."
              variant="default"
            />
          </div>

          {/* Footer with clear button */}
          {messages.length > 0 && (
            <div className="flex items-center justify-center border-t border-border py-2">
              <button
                onClick={clearMessages}
                className="text-xs text-text-3 hover:text-red-400 transition-colors"
              >
                Clear chat history
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
