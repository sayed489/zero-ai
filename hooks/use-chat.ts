'use client'

import { useState, useCallback, useEffect } from 'react'
import { generateId } from '@/lib/utils'
import type { ChatMessage, AIModel } from '@/lib/types'
import { shouldTriggerAppFactory } from '@/lib/types'
import { useNano } from '@/hooks/useNano'

const CHAT_STORAGE_KEY = 'zero-chat-history'

// Helper to parse ```language filename="xxx"\ncode\n``` into a file dictionary
function parseCodeBlocks(content: string): Record<string, string> {
  const files: Record<string, string> = {}
  const regex = /```[a-z]*\s*(?:filename="([^"]+)")?\n([\s\S]*?)```/g
  let match
  let defaultCounter = 1

  while ((match = regex.exec(content)) !== null) {
    let filename = match[1]
    const code = match[2]

    if (!filename) {
      filename = defaultCounter === 1 ? 'App.tsx' : `Component${defaultCounter}.tsx`
      defaultCounter++
    }

    files[filename] = code
  }
  return files
}

function loadChatHistory(): ChatMessage[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed.map((m: ChatMessage) => ({
        ...m,
        createdAt: new Date(m.createdAt),
      }))
    }
  } catch (e) {
    console.error('[Zero] Failed to load chat history:', e)
  }
  return []
}

function saveChatHistory(messages: ChatMessage[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
  } catch (e) {
    console.error('[Zero] Failed to save chat history:', e)
  }
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [thinkingStatus, setThinkingStatus] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const nano = useNano()

  useEffect(() => {
    const history = loadChatHistory()
    if (history.length > 0) {
      setMessages(history)
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && messages.length > 0) {
      saveChatHistory(messages)
    }
  }, [messages, isHydrated])

  const sendMessage = useCallback(async (content: string, model: AIModel = 'prime', skill?: string) => {
    setIsLoading(true)
    setError(null)
    setIsThinking(true)
    setThinkingStatus('Thinking...')

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      skill,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    try {
      const isAppFactory = shouldTriggerAppFactory(content)

      // ── LOCAL GENERATION (PICO 2B) ───────────────────────────────────────
      if (model === 'pico') {
        // Artificial delay for Pico "Thinking" experience
        setThinkingStatus('Accessing Distilled Knowledge...')
        await new Promise(resolve => setTimeout(resolve, 800))

        if (!nano.isReady) {
          throw new Error("Local AI model is downloading. Please wait for it to finish.")
        }

        const stream = await nano.chat(
          [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
        )
        if (!stream) throw new Error('Local engine not ready')
        
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

        const reader = stream.getReader()
        const decoder = new TextDecoder()
        let fullContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          if (isThinking) setIsThinking(false) // First token received, stop thinking

          const chunk = decoder.decode(value)
          fullContent += chunk

          const files = parseCodeBlocks(fullContent)
          const showFactory = Object.keys(files).length > 0 || isAppFactory

          setMessages((prev) => prev.map((m) => m.id === assistantId ? {
            ...m,
            content: fullContent,
            hasAppFactory: showFactory,
            appFactoryFiles: files
          } : m))
        }
        
        setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, isStreaming: false } : m))
      } else {
        // ── CLOUD GENERATION ───────────────────────────────────────────────
        if (content.toLowerCase().match(/search|find|news|current|what is/)) {
           setThinkingStatus('Searching knowledge base...')
        } else {
           setThinkingStatus('Synthesizing answer...')
        }


        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            tier: model,
            skill: skill,
            userId: 'guest',
            plan: 'starter'
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to send message')
        }

        setIsThinking(false)
        
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
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
          setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, isStreaming: false } : m))
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
      setIsThinking(false)
    }
  }, [messages, nano])

  const regenerateMessage = useCallback(async () => {
    if (messages.length < 2) return

    const lastUserIndex = [...messages].reverse().findIndex((m) => m.role === 'user')
    if (lastUserIndex === -1) return

    const actualIndex = messages.length - 1 - lastUserIndex
    const userMessage = messages[actualIndex]

    setMessages((prev) => prev.slice(0, actualIndex))

    await sendMessage(userMessage.content, userMessage.model as AIModel || 'prime')
  }, [messages, sendMessage])

  const clearMessages = useCallback(() => {
    setMessages([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CHAT_STORAGE_KEY)
    }
  }, [])

  return {
    messages,
    isLoading,
    isThinking,
    thinkingStatus,
    error,
    sendMessage,
    regenerateMessage,
    clearMessages,
    nano,
  }
}
