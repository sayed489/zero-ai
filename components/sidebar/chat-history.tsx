'use client'

import { useState, useEffect } from 'react'
import { MoreHorizontal, Trash2, MessageSquare, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export function ChatHistory() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [chats, setChats] = useState<{ id: string, title: string, active: boolean, model: string }[]>([])

  useEffect(() => {
    let isMounted = true

    const loadChats = async () => {
      try {
        // If Supabase isn't configured, use local storage only
        if (!isSupabaseConfigured) {
          const saved = localStorage.getItem('zero-chat-history')
          if (saved && isMounted) {
            const parsed = JSON.parse(saved)
            if (parsed && parsed.length > 0) {
              const firstMsg = parsed.find((m: { role: string }) => m.role === 'user')
              setChats([{
                id: 'current',
                title: firstMsg ? (firstMsg.content.slice(0, 30) + '...') : 'New Conversation',
                active: true,
                model: 'pico'
              }])
            } else {
              setChats([{ id: 'new', title: 'New Conversation', active: true, model: 'pico' }])
            }
          } else {
            setChats([{ id: 'new', title: 'New Conversation', active: true, model: 'pico' }])
          }
          return
        }

        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          // Fallback to local storage for guests
          const saved = localStorage.getItem('zero-chat-history')
          if (saved && isMounted) {
            const parsed = JSON.parse(saved)
            if (parsed && parsed.length > 0) {
              const firstMsg = parsed.find((m: { role: string }) => m.role === 'user')
              setChats([{
                id: 'current',
                title: firstMsg ? (firstMsg.content.slice(0, 30) + '...') : 'New Conversation',
                active: true,
                model: 'pico'
              }])
            } else {
               setChats([{ id: 'new', title: 'New Conversation', active: true, model: 'pico' }])
            }
          } else {
            setChats([{ id: 'new', title: 'New Conversation', active: true, model: 'pico' }])
          }
          return
        }

        // Fetch from Supabase for logged in users
        const { data: convos, error } = await supabase
          .from('conversations')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(20)

        if (error) throw error

        if (isMounted) {
          if (convos && convos.length > 0) {
            setChats(convos.map((c: { id: string; title?: string; model_tier?: string }) => ({
              id: c.id,
              title: c.title || 'New Conversation',
              active: false,
              model: c.model_tier || 'pico'
            })))
          } else {
            setChats([{ id: 'new', title: 'New Conversation', active: true, model: 'pico' }])
          }
        }
      } catch (e) {
        console.error("Failed to load chats:", e)
        // Fallback on error
        if (isMounted) {
          setChats([{ id: 'new', title: 'New Conversation', active: true, model: 'pico' }])
        }
      }
    }

    loadChats()

    // Only subscribe if Supabase is configured
    if (isSupabaseConfigured) {
      const supabase = createClient()
      const channelId = `history_${Date.now()}_${Math.random()}`
      const channel = supabase.channel(channelId)
      
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        loadChats()
      })
      
      channel.subscribe()

      return () => {
        isMounted = false
        supabase.removeChannel(channel)
      }
    }

    return () => {
      isMounted = false
    }
  }, [])

  const deleteChat = async (id: string) => {
    if (id === 'current' || id === 'new') {
      localStorage.removeItem('zero-chat-history')
      window.location.reload()
      return
    }

    if (!isSupabaseConfigured) return

    try {
      const supabase = createClient()
      await supabase.from('conversations').delete().eq('id', id)
      setChats(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      console.error("Deletion failed:", e)
    }
  }

  const startNewChat = () => {
    localStorage.removeItem('zero-chat-history')
    window.location.reload()
  }

  return (
    <div className="space-y-1">
      {/* New Chat Button */}
      <button
        onClick={startNewChat}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors text-text-2 hover:bg-bg-2 hover:text-text-1 border border-dashed border-border hover:border-zero-300/50"
      >
        <Plus className="h-4 w-4" />
        <span className="text-sm">New Chat</span>
      </button>

      {/* Chat List */}
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
              if (chat.id === 'new' || chat.id === 'current') {
                // Already on current chat
              } else {
                // Future: push router to /chat/id
              }
            }}
          >
            <MessageSquare className="h-4 w-4 shrink-0 text-text-3" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="truncate text-sm">{chat.title}</span>
              <span className="text-[10px] text-text-3 capitalize">{chat.model.replace('-', ' ')}</span>
            </div>
            
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
                onClick={(e) => {
                  e.stopPropagation()
                  deleteChat(chat.id)
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Chat
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
