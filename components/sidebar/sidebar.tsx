'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Settings, 
  MessageSquare, 
  FolderOpen, 
  Sparkles, 
  Code2,
  ChevronDown,
  Globe,
  HelpCircle,
  ArrowUpCircle,
  Gift,
  LogOut,
  Layers
} from 'lucide-react'
import { ZeroMascot } from '@/components/mascot/zero-mascot'
import { ChatHistory } from '@/components/sidebar/chat-history'
import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
  onNewChat: () => void
}

export function Sidebar({ className, onNewChat }: SidebarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const navItems = [
    { icon: MessageSquare, label: 'Chats', href: '/chat' },
    { icon: FolderOpen, label: 'Projects', href: '/projects' },
    { icon: Sparkles, label: 'Artifacts', href: '/artifacts' },
    { icon: Code2, label: 'Code', href: '/code' },
  ]

  return (
    <aside
      className={cn(
        'flex w-72 flex-col border-r border-border bg-bg-1',
        className
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <ZeroMascot size={32} state="idle" interactive={false} />
          <span className="font-semibold text-text-1">Zero</span>
        </Link>
        <button
          className="rounded-lg p-1.5 text-text-2 transition-colors hover:bg-bg-2 hover:text-text-1"
          aria-label="Toggle sidebar width"
        >
          <Layers className="h-4 w-4" />
        </button>
      </div>

      {/* New Chat & Search */}
      <div className="space-y-1 p-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-2 transition-colors hover:bg-bg-2 hover:text-text-1"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>
        <button
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-2 transition-colors hover:bg-bg-2 hover:text-text-1"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
        <Link
          href="/settings"
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-2 transition-colors hover:bg-bg-2 hover:text-text-1"
        >
          <Layers className="h-4 w-4" />
          Customize
        </Link>
      </div>

      {/* Navigation */}
      <nav className="border-t border-border px-3 pt-3">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-2 transition-colors hover:bg-bg-2 hover:text-text-1"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Recents Section */}
      <div className="flex-1 overflow-hidden border-t border-border mt-3">
        <div className="px-3 py-2">
          <span className="text-xs font-medium text-text-3 uppercase tracking-wider">
            Recents
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          <ChatHistory />
        </div>
      </div>

      {/* Profile Section */}
      <div className="border-t border-border">
        {isProfileOpen && (
          <div className="border-b border-border bg-bg-2 p-2 space-y-0.5">
            <Link
              href="/settings"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-2 transition-colors hover:bg-bg-3 hover:text-text-1"
            >
              <Settings className="h-4 w-4" />
              Settings
              <span className="ml-auto text-xs text-text-3">Ctrl+,</span>
            </Link>
            <button
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-2 transition-colors hover:bg-bg-3 hover:text-text-1"
            >
              <Globe className="h-4 w-4" />
              Language
              <ChevronDown className="ml-auto h-3 w-3" />
            </button>
            <button
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-2 transition-colors hover:bg-bg-3 hover:text-text-1"
            >
              <HelpCircle className="h-4 w-4" />
              Get help
            </button>
            <div className="my-1 h-px bg-border" />
            <Link
              href="/pricing"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-2 transition-colors hover:bg-bg-3 hover:text-text-1"
            >
              <ArrowUpCircle className="h-4 w-4" />
              Upgrade plan
            </Link>
            <button
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-2 transition-colors hover:bg-bg-3 hover:text-text-1"
            >
              <Gift className="h-4 w-4" />
              Gift Zero
            </button>
            <div className="my-1 h-px bg-border" />
            <button
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-2 transition-colors hover:bg-bg-3 hover:text-text-1"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        )}
        
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-bg-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-3 text-sm font-medium text-text-1">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-1 truncate">User</p>
            <p className="text-xs text-text-3">Starter plan</p>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 text-text-3 transition-transform",
            isProfileOpen && "rotate-180"
          )} />
        </button>
      </div>
    </aside>
  )
}
