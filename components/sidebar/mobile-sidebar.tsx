'use client'

import { X } from 'lucide-react'
import { Sidebar } from '@/components/sidebar/sidebar'
import { cn } from '@/lib/utils'

interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNewChat: () => void
}

export function MobileSidebar({ open, onOpenChange, onNewChat }: MobileSidebarProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 md:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar className="h-full" onNewChat={onNewChat} />
        
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-lg p-2 text-text-2 hover:bg-bg-2 hover:text-text-1"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </>
  )
}
