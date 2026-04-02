'use client'

import { useState, useEffect } from 'react'
import { Trophy, Check } from 'lucide-react'
import { ZeroMascot } from '@/components/mascot/zero-mascot'
import { cn } from '@/lib/utils'

interface ModelResponse {
  model: string
  name: string
  content: string
  isStreaming: boolean
  color: string
}

interface ZeroVsXProps {
  prompt: string
  onVote?: (model: string) => void
}

const MODELS = [
  { id: 'groq', name: 'Llama 3.3', color: 'border-blue-500 bg-blue-500/10' },
  { id: 'gemini', name: 'Gemini Flash', color: 'border-green-500 bg-green-500/10' },
  { id: 'cloudflare', name: 'Qwen Coder', color: 'border-orange-500 bg-orange-500/10' },
]

export function ZeroVsX({ prompt, onVote }: ZeroVsXProps) {
  const [responses, setResponses] = useState<ModelResponse[]>(
    MODELS.map((m) => ({
      model: m.id,
      name: m.name,
      content: '',
      isStreaming: true,
      color: m.color,
    }))
  )
  const [voted, setVoted] = useState<string | null>(null)

  useEffect(() => {
    // Start all three streams simultaneously
    MODELS.forEach((model) => {
      streamModel(model.id, prompt)
    })
  }, [prompt])

  const streamModel = async (modelId: string, content: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content }],
          model: modelId,
        }),
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  fullContent += parsed.content
                  setResponses((prev) =>
                    prev.map((r) =>
                      r.model === modelId ? { ...r, content: fullContent } : r
                    )
                  )
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      }

      setResponses((prev) =>
        prev.map((r) =>
          r.model === modelId ? { ...r, isStreaming: false } : r
        )
      )
    } catch (error) {
      console.error(`Error streaming ${modelId}:`, error)
      setResponses((prev) =>
        prev.map((r) =>
          r.model === modelId
            ? { ...r, content: 'Error getting response', isStreaming: false }
            : r
        )
      )
    }
  }

  const handleVote = (model: string) => {
    if (voted) return
    setVoted(model)
    onVote?.(model)
  }

  return (
    <div className="my-6">
      <div className="mb-4 flex items-center gap-2">
        <ZeroMascot size={24} state="idle" />
        <h3 className="text-lg font-medium text-text-1">Compare Models</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {responses.map((response) => (
          <div
            key={response.model}
            className={cn(
              'flex flex-col rounded-xl border-2 bg-bg-1 transition-all',
              voted === response.model ? response.color : 'border-border',
              !voted && 'hover:border-border-hover'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-medium text-text-1">{response.name}</span>
              {voted === response.model && (
                <Trophy className="h-5 w-5 text-yellow-500" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
              <p className="whitespace-pre-wrap text-sm text-text-2">
                {response.content}
                {response.isStreaming && (
                  <span className="stream-cursor ml-0.5 inline-block h-4 w-0.5 bg-zero-300" />
                )}
              </p>
            </div>

            {/* Vote button */}
            <div className="border-t border-border p-3">
              <button
                onClick={() => handleVote(response.model)}
                disabled={voted !== null || response.isStreaming}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors',
                  voted === response.model
                    ? 'bg-zero-300 text-bg-0'
                    : voted
                      ? 'cursor-not-allowed bg-bg-2 text-text-3'
                      : 'bg-bg-2 text-text-2 hover:bg-bg-3 hover:text-text-1'
                )}
              >
                {voted === response.model ? (
                  <>
                    <Check className="h-4 w-4" />
                    Selected
                  </>
                ) : (
                  'This one was best'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
