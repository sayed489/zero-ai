'use client'

import { useState, useCallback, useEffect } from 'react'
import { generateId } from '@/lib/utils'
import type { ChatMessage, AIModel } from '@/lib/types'
import { shouldTriggerAppFactory, shouldTriggerComplexApp } from '@/lib/types'
import { useNano } from '@/hooks/useNano'

const CHAT_STORAGE_KEY = 'zero-chat-history'

// Helper to parse ```language filename="xxx"\ncode\n``` into a file dictionary
function parseCodeBlocks(content: string): Record<string, string> {
  const files: Record<string, string> = {}
  // Regex to match code blocks with optional filename parameter
  const regex = /```[a-z]*\s*(?:filename="([^"]+)")?\n([\s\S]*?)```/g
  let match
  let defaultCounter = 1

  while ((match = regex.exec(content)) !== null) {
    let filename = match[1]
    const code = match[2]
    
    // If no filename specified, guess App.tsx or use default
    if (!filename) {
      filename = defaultCounter === 1 ? 'App.tsx' : `Component${defaultCounter}.tsx`
      defaultCounter++
    }
    
    files[filename] = code
  }
  return files
}

// Load chat history from localStorage
function loadChatHistory(): ChatMessage[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Restore Date objects
      return parsed.map((m: ChatMessage) => ({
        ...m,
        createdAt: new Date(m.createdAt),
      }))
    }
  } catch (e) {
    console.error('[v0] Failed to load chat history:', e)
  }
  return []
}

// Save chat history to localStorage
function saveChatHistory(messages: ChatMessage[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
  } catch (e) {
    console.error('[v0] Failed to save chat history:', e)
  }
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const nano = useNano()

  // Load chat history on mount
  useEffect(() => {
    const history = loadChatHistory()
    if (history.length > 0) {
      setMessages(history)
    }
    setIsHydrated(true)
  }, [])

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (isHydrated && messages.length > 0) {
      saveChatHistory(messages)
    }
  }, [messages, isHydrated])

  const sendMessage = useCallback(async (content: string, model: AIModel = 'prime', skill?: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      skill,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // Create assistant message placeholder
    const assistantId = generateId()
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      model,
      isStreaming: true,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      let nanoDecision = null;
      const isAppFactory = shouldTriggerAppFactory(content);
      const isComplex = shouldTriggerComplexApp(content);

      // Fast heuristic mascot triggering to prevent a second blocking LLM router call
      if (typeof window !== 'undefined') {
        const action = isAppFactory ? 'eating' : content.toLowerCase().includes('search') ? 'drinking' : 'idle';
        window.dispatchEvent(new CustomEvent('mascot-action', { detail: action }));
      }

      const shouldUseAppFactory = isAppFactory;

      const isNanoLocal = model === 'nano-fast' || model === 'nano-pro'

      if (isNanoLocal) {
        if (!nano.isReady) {
          throw new Error("Nano model is currently downloading. Please wait for it to finish.")
        }

        // Nano-Pro uses the heavy 3B engine if available, else falls back to fast
        // Nano-Fast always uses the fast 0.5B engine
        const stream = await nano.chat(
          [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
        )
        if (!stream) throw new Error("Nano stream unavailable")

        const reader = stream.getReader()
        const decoder = new TextDecoder()
        let fullContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          fullContent += chunk
          
          const files = parseCodeBlocks(fullContent)
          // Only nano-pro triggers App Factory
          const showFactory = model === 'nano-pro' && (Object.keys(files).length > 0 || shouldUseAppFactory)
          
          setMessages((prev) => prev.map((m) => m.id === assistantId ? { 
            ...m, 
            content: fullContent,
            hasAppFactory: showFactory,
            appFactoryFiles: files 
          } : m))
        }
      } else {
        // Backend Cloud Streaming Workflow (Prime / Apex)
        // Note: isAppFactory is now handled seamlessly inside this stream by passing intent context on the backend
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            tier: model,
            userId: 'guest', // Using generic ID since auth isn't fully integrated here
            plan: 'nano'
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to send message')
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (reader) {
          let fullContent = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue

                try {
                  const parsed = JSON.parse(data)
                  if (parsed.type === 'token' && parsed.content) {
                    fullContent += parsed.content
                    const files = parseCodeBlocks(fullContent)
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantId
                          ? { 
                              ...m, 
                              content: fullContent,
                              hasAppFactory: Object.keys(files).length > 0 || isAppFactory,
                              appFactoryFiles: files
                            }
                          : m
                      )
                    )
                  } else if (parsed.type === 'image' && parsed.url) {
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantId
                          ? { ...m, hasImage: true, imageUrl: parsed.url, content: fullContent || 'Here is the image you requested:' }
                          : m
                      )
                    )
                  }
                } catch {
                  // Ignore parse errors for incomplete chunks
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Sorry, something went wrong. Please try again.', isStreaming: false }
            : m
        )
      )
    } finally {
      setIsLoading(false)
      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m
        )
      )
    }
  }, [messages, nano])

  const regenerateMessage = useCallback(async () => {
    if (messages.length < 2) return

    // Find the last user message
    const lastUserIndex = [...messages].reverse().findIndex((m) => m.role === 'user')
    if (lastUserIndex === -1) return

    const actualIndex = messages.length - 1 - lastUserIndex
    const userMessage = messages[actualIndex]

    // Remove messages from that point
    setMessages((prev) => prev.slice(0, actualIndex))

    // Resend
    await sendMessage(userMessage.content, userMessage.model as AIModel || 'nano-fast')
  }, [messages, sendMessage])

  const clearMessages = useCallback(() => {
    setMessages([])
    // Clear from localStorage too
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CHAT_STORAGE_KEY)
    }
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    regenerateMessage,
    clearMessages,
    nano,
  }
}
