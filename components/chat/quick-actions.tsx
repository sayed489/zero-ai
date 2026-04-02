'use client'

import { Pencil, GraduationCap, Code2, LayoutList, Sparkles } from 'lucide-react'

const actions = [
  { 
    label: 'Write', 
    prompt: 'Help me write ', 
    icon: Pencil,
    color: 'text-text-2'
  },
  { 
    label: 'Learn', 
    prompt: 'Teach me about ', 
    icon: GraduationCap,
    color: 'text-text-2'
  },
  { 
    label: 'Code', 
    prompt: 'Help me code ', 
    icon: Code2,
    color: 'text-text-2'
  },
  { 
    label: 'Life stuff', 
    prompt: 'Help me with ', 
    icon: LayoutList,
    color: 'text-text-2'
  },
]

interface QuickActionsProps {
  onSelect: (prompt: string) => void
}

export function QuickActions({ onSelect }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => onSelect(action.prompt)}
          className="flex items-center gap-2 rounded-full border border-border bg-bg-1 px-4 py-2 text-sm text-text-2 transition-all hover:border-border-hover hover:bg-bg-2 hover:text-text-1"
        >
          <action.icon className="h-4 w-4" />
          <span>{action.label}</span>
        </button>
      ))}
      
      {/* Zero's choice - like Claude's choice */}
      <button
        onClick={() => onSelect('Surprise me with something interesting!')}
        className="flex items-center gap-2 rounded-full border border-border bg-bg-1 px-4 py-2 text-sm text-text-2 transition-all hover:border-zero-300/50 hover:bg-zero-glow hover:text-zero-300"
      >
        <Sparkles className="h-4 w-4" />
        <span>Zero&apos;s choice</span>
      </button>
    </div>
  )
}
