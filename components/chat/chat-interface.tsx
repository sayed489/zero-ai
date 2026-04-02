'use client'

import { useState, useCallback } from 'react'
import { Sidebar } from '@/components/sidebar/sidebar'
import { MobileSidebar } from '@/components/sidebar/mobile-sidebar'
import { ChatArea } from '@/components/chat/chat-area'
import { useChat } from '@/hooks/use-chat'
import type { AIModel } from '@/lib/types'

// Main chat interface component
export function ChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AIModel>('nano-fast')
  
  const {
    messages,
    isLoading,
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

  return (
    <div className="flex h-screen bg-bg-0">
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
      <ChatArea
        messages={messages}
        isLoading={isLoading}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        onSend={handleSend}
        onRegenerate={regenerateMessage}
        onOpenSidebar={() => setSidebarOpen(true)}
        onNewChat={clearMessages}
        nano={nano}
      />
    </div>
  )
}
