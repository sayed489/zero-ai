'use client'

import { useState, useEffect } from 'react'
import { MoreHorizontal, Trash2, Edit2, Share } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ChatHistory() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [chats, setChats] = useState<{ id: string, title: string, active: boolean }[]>([])

  useEffect(() => {
    // Basic implementation: read the single chat history we have
    const loadChats = () => {
      try {
        const saved = localStorage.getItem('zero-chat-history')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed && parsed.length > 0) {
            const firstMsg = parsed.find((m: any) => m.role === 'user')
            setChats([{
              id: 'current',
              title: firstMsg ? (firstMsg.content.slice(0, 30) + '...') : 'New Conversation',
              active: true
            }])
          } else {
             setChats([{ id: 'new', title: 'New Conversation', active: true }])
          }
        }
      } catch (e) {
         setChats([{ id: 'new', title: 'New Conversation', active: true }])
      }
    }

    loadChats()
    window.addEventListener('storage', loadChats)
    // Small polling to keep it synced without complex event emitters
    const interval = setInterval(loadChats, 2000)
    return () => {
      window.removeEventListener('storage', loadChats)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="space-y-0.5">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className="relative"
          onMouseEnter={() => setHoveredId(chat.id)}
          onMouseLeave={() => {
            setHoveredId(null)
            setMenuOpenId(null)
          }}
        >
          <div
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors cursor-pointer',
              chat.active
                ? 'bg-bg-2 text-text-1'
                : 'text-text-2 hover:bg-bg-2 hover:text-text-1'
            )}
            onClick={() => {
              if (chat.id === 'new') {
                localStorage.removeItem('zero-chat-history')
                window.location.reload()
              }
            }}
          >
            <span className="flex-1 truncate text-sm">{chat.title}</span>
            
            {/* More options button */}
            {(hoveredId === chat.id || menuOpenId === chat.id) && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpenId(menuOpenId === chat.id ? null : chat.id)
                }}
                className="shrink-0 rounded p-0.5 text-text-3 hover:bg-bg-3 hover:text-text-1"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Dropdown menu */}
          {menuOpenId === chat.id && (
            <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-border bg-bg-1 py-1 shadow-xl">
              <button 
                onClick={() => {
                  localStorage.removeItem('zero-chat-history')
                  window.location.reload()
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Chat
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
