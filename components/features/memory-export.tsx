'use client'

import { useState } from 'react'
import { X, Download, Copy, Check, ExternalLink } from 'lucide-react'

interface MemoryExportProps {
  onClose: () => void
}

export function MemoryExport({ onClose }: MemoryExportProps) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<object | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchExport = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/memory/export')
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to export')
      }
      const data = await res.json()
      setConfig(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export memories')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!config) return
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!config) return
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'zero-memory-mcp.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-bg-1">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-medium text-text-1">Export for Claude/Cursor</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-2 hover:bg-bg-2 hover:text-text-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!config && !error && (
            <div className="text-center">
              <p className="mb-4 text-text-2">
                Export your Zero memories as an MCP configuration file. This lets you use
                your memories in Claude Desktop, Cursor, or any MCP-compatible tool.
              </p>
              <button
                onClick={fetchExport}
                disabled={loading}
                className="rounded-lg bg-zero-300 px-6 py-2 font-medium text-bg-0 transition-colors hover:bg-zero-400 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Export'}
              </button>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {config && (
            <>
              <pre className="mb-4 max-h-64 overflow-auto rounded-lg bg-bg-0 p-4 text-xs text-text-2">
                {JSON.stringify(config, null, 2)}
              </pre>

              <div className="mb-4 rounded-lg border border-border bg-bg-2 p-3">
                <h4 className="mb-2 text-sm font-medium text-text-1">How to use:</h4>
                <ol className="space-y-1 text-xs text-text-2">
                  <li>1. Download the JSON file</li>
                  <li>2. Add the contents to your <code className="text-zero-300">claude_desktop_config.json</code></li>
                  <li>3. Restart Claude Desktop</li>
                </ol>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopy}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm text-text-2 transition-colors hover:bg-bg-2 hover:text-text-1"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy JSON
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-zero-300 py-2 text-sm font-medium text-bg-0 transition-colors hover:bg-zero-400"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <a
            href="https://modelcontextprotocol.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 text-xs text-text-3 hover:text-text-2"
          >
            Learn more about MCP
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
