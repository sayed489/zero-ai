'use client'

import { useState } from 'react'
import { Copy, Check, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  language: string
  code: string
}

const EXECUTABLE_LANGUAGES = ['python', 'javascript', 'typescript', 'go', 'rust', 'cpp', 'c++']

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [output, setOutput] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  const isExecutable = EXECUTABLE_LANGUAGES.includes(language.toLowerCase())

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRun = async () => {
    if (running) return
    setRunning(true)
    setOutput(null)

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code }),
      })
      const data = await res.json()
      setOutput(data.output || data.error || 'No output')
    } catch {
      setOutput('Failed to execute code')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-border bg-bg-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-bg-1 px-4 py-2">
        <span className="text-xs font-medium text-text-3">{language}</span>
        <div className="flex items-center gap-2">
          {isExecutable && (
            <button
              onClick={handleRun}
              disabled={running}
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                running
                  ? 'cursor-not-allowed bg-bg-2 text-text-3'
                  : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
              )}
            >
              <Play className="h-3 w-3" />
              {running ? 'Running...' : 'Run'}
            </button>
          )}
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors',
              copied
                ? 'bg-green-500/10 text-green-500'
                : 'text-text-3 hover:bg-bg-2 hover:text-text-2'
            )}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Code */}
      <pre className="overflow-x-auto p-4">
        <code className="font-mono text-sm text-text-1">{code}</code>
      </pre>

      {/* Output */}
      {output !== null && (
        <div className="border-t border-border bg-bg-1">
          <div className="px-4 py-2 text-xs font-medium text-text-3">Output</div>
          <pre className="overflow-x-auto px-4 pb-4">
            <code className="font-mono text-sm text-text-2">{output}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
