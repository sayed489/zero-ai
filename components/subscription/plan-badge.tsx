'use client'

import { Crown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Plan } from '@/lib/utils'

interface PlanBadgeProps {
  plan: Plan
  className?: string
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  if (plan === 'starter') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-bg-2 px-2 py-0.5 text-xs font-medium text-text-2',
          className
        )}
      >
        Starter
      </span>
    )
  }

  if (plan === 'pro') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full bg-zero-300/20 px-2 py-0.5 text-xs font-medium text-zero-300',
          className
        )}
      >
        <Sparkles className="h-3 w-3" />
        Pro
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-2 py-0.5 text-xs font-medium text-yellow-500',
        className
      )}
    >
      <Crown className="h-3 w-3" />
      Ultra
    </span>
  )
}
