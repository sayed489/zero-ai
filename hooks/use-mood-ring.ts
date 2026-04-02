'use client'

import { useMemo } from 'react'

const MOOD_KEYWORDS = {
  code: { color: '#f59e0b', keywords: ['code', 'function', 'javascript', 'python', 'debug', 'bug'] },
  error: { color: '#ef4444', keywords: ['error', 'failed', 'problem', 'issue', 'broken', 'crash'] },
  success: { color: '#10b981', keywords: ['success', 'done', 'complete', 'finished', 'working', 'fixed'] },
  thinking: { color: '#a78bfa', keywords: ['think', 'reason', 'explain', 'analyze', 'logic', 'question'] },
  creative: { color: '#ec4899', keywords: ['write', 'create', 'story', 'poem', 'imagine', 'design', 'art'] },
  search: { color: '#3b82f6', keywords: ['search', 'find', 'research', 'look', 'query', 'investigate'] },
  default: { color: '#c4b5fd', keywords: [] },
}

export function useMoodRing(text: string) {
  const moodColor = useMemo(() => {
    if (!text) return MOOD_KEYWORDS.default.color

    const lowerText = text.toLowerCase()

    for (const [, mood] of Object.entries(MOOD_KEYWORDS)) {
      if (mood.keywords.length === 0) continue
      if (mood.keywords.some(kw => lowerText.includes(kw))) {
        return mood.color
      }
    }

    return MOOD_KEYWORDS.default.color
  }, [text])

  return moodColor
}
