'use client'

import { Skull, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RoastModeProps {
  content: string
}

export function RoastMode({ content }: RoastModeProps) {
  // Split content at the divider
  const divider = '━━━ NOW LET ME FIX IT ━━━'
  const parts = content.split(divider)
  const roast = parts[0]?.trim() || ''
  const fix = parts[1]?.trim() || ''

  const hasRoast = roast.length > 0
  const hasFix = fix.length > 0

  return (
    <div className="space-y-6">
      {/* Roast Section */}
      {hasRoast && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-red-400">
            <Skull className="h-5 w-5" />
            <span className="font-medium">The Roast</span>
          </div>
          <div className="whitespace-pre-wrap text-text-1">{roast}</div>
        </div>
      )}

      {/* Divider */}
      {hasFix && (
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm font-medium text-text-3">NOW LET ME FIX IT</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      )}

      {/* Fix Section */}
      {hasFix && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-green-400">
            <Wrench className="h-5 w-5" />
            <span className="font-medium">The Fix</span>
          </div>
          <div className="whitespace-pre-wrap text-text-1">{fix}</div>
        </div>
      )}
    </div>
  )
}

export function isRoastContent(content: string): boolean {
  return content.includes('━━━ NOW LET ME FIX IT ━━━')
}
