'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Trash2, MoreHorizontal, Clock, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatSession {
  id: string
  title: string
  preview: string
  createdAt: Date
  model: string
}

export function ChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('zero_chat_sessions')
      if (stored) {
        const parsed = JSON.parse(stored)
        setSessions(parsed.map((s: ChatSession) => ({
          ...s,
          createdAt: new Date(s.createdAt)
        })))
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = sessions.filter(s => s.id !== id)
    setSessions(updated)
    localStorage.setItem('zero_chat_sessions', JSON.stringify(updated))
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="h-10 w-10 rounded-xl bg-bg-2 border border-border flex items-center justify-center mb-3">
          <MessageSquare className="h-5 w-5 text-text-3" />
        </div>
        <p className="text-sm text-text-2 font-medium">No conversations yet</p>
        <p className="text-xs text-text-3 mt-1">Start chatting to see history</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5 pb-2">
      {sessions.slice(0, 20).map((session) => (
        <button
          key={session.id}
          onClick={() => setActiveId(session.id)}
          onMouseEnter={() => setHoveredId(session.id)}
          onMouseLeave={() => setHoveredId(null)}
          className={cn(
            "group relative flex flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-all",
            activeId === session.id
              ? "bg-zero-300/10 border border-zero-300/20"
              : "hover:bg-bg-2 border border-transparent"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className={cn(
              "text-sm font-medium truncate flex-1",
              activeId === session.id ? "text-zero-300" : "text-text-1"
            )}>
              {session.title}
            </span>
            {hoveredId === session.id && (
              <button
                onClick={(e) => deleteSession(session.id, e)}
                className="p-1 rounded hover:bg-bg-3 text-text-3 hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-text-3">
            <Clock className="h-3 w-3" />
            <span>{formatTime(session.createdAt)}</span>
            <span className="h-1 w-1 rounded-full bg-text-3/50" />
            <span className="capitalize">{session.model}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
