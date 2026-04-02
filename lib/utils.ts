import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  })
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) {
    return formatDate(date)
  } else if (days > 0) {
    return `${days}d ago`
  } else if (hours > 0) {
    return `${hours}h ago`
  } else if (minutes > 0) {
    return `${minutes}m ago`
  } else {
    return 'Just now'
  }
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Plan limits
export const PLAN_LIMITS = {
  starter: {
    messagesPerDay: 30,
    imageGen: 5,
    memoryFacts: 50,
    appFactory: 3,
    voice: false,
    memoryExport: false,
    allModels: false,
  },
  pro: {
    messagesPerDay: 500,
    imageGen: 100,
    memoryFacts: 2000,
    appFactory: 50,
    voice: true,
    memoryExport: true,
    allModels: true,
  },
  ultra: {
    messagesPerDay: 9999,
    imageGen: 9999,
    memoryFacts: 99999,
    appFactory: 999,
    voice: true,
    memoryExport: true,
    allModels: true,
  },
} as const

export type Plan = keyof typeof PLAN_LIMITS
