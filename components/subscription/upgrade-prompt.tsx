'use client'

import { Zap } from 'lucide-react'

interface UpgradePromptProps {
  reason: string
  onUpgrade: () => void
}

export function UpgradePrompt({ reason, onUpgrade }: UpgradePromptProps) {
  return (
    <div className="mx-auto my-6 max-w-md rounded-xl border border-zero-300/30 bg-zero-glow p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zero-300/20">
          <Zap className="h-5 w-5 text-zero-300" />
        </div>
        <div className="flex-1">
          <p className="mb-3 text-sm text-text-1">{reason}</p>
          <button
            onClick={onUpgrade}
            className="rounded-lg bg-zero-300 px-4 py-2 text-sm font-medium text-bg-0 transition-colors hover:bg-zero-400"
          >
            Upgrade now
          </button>
        </div>
      </div>
    </div>
  )
}
