'use client'

import { useState } from 'react'
import { Brain, ChevronDown, X, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock memories - will be replaced with real data
const mockMemories = [
  { id: '1', fact: 'Prefers TypeScript over JavaScript', category: 'preference' },
  { id: '2', fact: 'Working on a SaaS project called Zero AI', category: 'project' },
  { id: '3', fact: 'Based in India', category: 'personal' },
]

const categoryColors: Record<string, string> = {
  preference: 'bg-blue-500/10 text-blue-400',
  project: 'bg-green-500/10 text-green-400',
  skill: 'bg-yellow-500/10 text-yellow-400',
  personal: 'bg-purple-500/10 text-purple-400',
  goal: 'bg-orange-500/10 text-orange-400',
}

export function MemoryPanel() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="p-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-bg-2"
      >
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-zero-300" />
          <span className="text-sm font-medium text-text-1">Zero knows you</span>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-text-3 transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {mockMemories.map((memory) => (
            <div
              key={memory.id}
              className="group flex items-start gap-2 rounded-lg bg-bg-2 p-2"
            >
              <span
                className={cn(
                  'shrink-0 rounded px-1.5 py-0.5 text-xs',
                  categoryColors[memory.category] || 'bg-bg-3 text-text-3'
                )}
              >
                {memory.category}
              </span>
              <span className="min-w-0 flex-1 text-sm text-text-2">{memory.fact}</span>
              <button
                className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove memory"
              >
                <X className="h-3.5 w-3.5 text-text-3 hover:text-text-2" />
              </button>
            </div>
          ))}

          <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-xs text-text-3 transition-colors hover:border-border-hover hover:text-text-2">
            <Download className="h-3.5 w-3.5" />
            Export for Claude/Cursor
          </button>
        </div>
      )}
    </div>
  )
}
