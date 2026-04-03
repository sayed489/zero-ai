'use client'

import { useState, useCallback, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar/sidebar'
import { MobileSidebar } from '@/components/sidebar/mobile-sidebar'
import { ChatArea } from '@/components/chat/chat-area'
import { useChat } from '@/hooks/use-chat'
import type { AIModel } from '@/lib/types'
import { AgenticChat } from '@/components/agentic/AgenticChat'
import { ZeroLiveModal } from '@/components/chat/zero-live'
import { getLiveKey } from '@/app/actions/getLiveKey'

export function ChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [liveModalOpen, setLiveModalOpen] = useState(false)
  const [liveKey, setLiveKey] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<AIModel>(() => {
    if (typeof window !== 'undefined') {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      return isMobile ? 'nano' : 'nano' // Default to Cloud Nano (free) to secure fast load and welcome screen
    }
    return 'nano'
  })

  const {
    messages,
    isLoading,
    isThinking,
    thinkingStatus,
    sendMessage,
    regenerateMessage,
    clearMessages,
    nano,
  } = useChat()

  const handleSend = useCallback(
    async (content: string, skill?: string) => {
      await sendMessage(content, selectedModel, skill)
    },
    [sendMessage, selectedModel]
  )

  const handleOpenLive = async () => {
    if (!liveKey) {
      const key = await getLiveKey()
      setLiveKey(key)
    }
    setLiveModalOpen(true)
  }

  return (
    <div className="flex h-screen bg-bg-0 relative">
      <ZeroLiveModal 
        isOpen={liveModalOpen} 
        onClose={() => setLiveModalOpen(false)} 
        apiKey={liveKey} 
      />

      {/* Desktop Sidebar */}
      <Sidebar
        className="hidden md:flex"
        onNewChat={clearMessages}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        onNewChat={clearMessages}
      />

      {/* Main Chat Area */}
      {selectedModel === 'agentic-chad' ? (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="md:hidden flex h-14 shrink-0 items-center justify-between border-b border-border bg-bg-1 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-text-2 hover:bg-bg-2 hover:text-text-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
            <span className="text-sm font-semibold text-text-1">Zero Agentic</span>
            <div className="w-9" />
          </div>
          <div className="flex-1 overflow-hidden">
            <AgenticChat />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col relative w-full h-full">
          <ChatArea
            messages={messages}
            isLoading={isLoading}
            isThinking={isThinking}
            thinkingStatus={thinkingStatus}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            onSend={handleSend}
            onRegenerate={regenerateMessage}
            onOpenSidebar={() => setSidebarOpen(true)}
            onNewChat={clearMessages}
            nano={nano}
            onOpenLive={handleOpenLive}
          />
        </div>
      )}
    </div>
  )
}
