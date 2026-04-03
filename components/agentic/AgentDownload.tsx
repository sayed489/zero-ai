'use client'

import { useState } from 'react'
import { X, Download, Terminal, CheckCircle, Loader2, ExternalLink, Shield, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  "Download the Zero Agent binary for your OS below",
  "Open a terminal in your Downloads folder",
  "Run the agent binary (it starts a local WebSocket server)",
  "Return here — the green indicator will confirm it's connected",
]

export function AgentDownload({ onClose }: { onClose: () => void }) {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'idle' | 'ok' | 'fail'>('idle')

  const testConnection = async () => {
    setTesting(true)
    setTestResult('idle')
    try {
      await new Promise<void>((resolve, reject) => {
        const ws = new WebSocket(process.env.NEXT_PUBLIC_AGENT_WS_URL ?? 'ws://localhost:7821')
        const timer = setTimeout(() => { ws.close(); reject(new Error('timeout')) }, 4000)
        ws.onopen = () => { clearTimeout(timer); ws.close(); resolve() }
        ws.onerror = () => { clearTimeout(timer); reject(new Error('failed')) }
      })
      setTestResult('ok')
    } catch {
      setTestResult('fail')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-[2rem] border border-border bg-bg-1 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-zero-300 to-zero-600 flex items-center justify-center">
              <Cpu className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-1">Zero Agent</p>
              <p className="text-xs text-text-3">Local laptop access bridge</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-bg-3 text-text-3 hover:text-text-1 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* What it does */}
          <div className="rounded-xl bg-zero-500/5 border border-zero-500/20 p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 text-zero-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-text-1">What Zero Agent does</p>
                <p className="text-xs text-text-3 mt-1">
                  Runs a local WebSocket server on <code className="text-zero-400 bg-bg-2 px-1 rounded">localhost:7821</code>. 
                  Zero AI connects to it to execute terminal commands, automate your browser, read/write files, 
                  and take screenshots — all privately on your machine. Nothing leaves your laptop without your knowledge.
                </p>
              </div>
            </div>
          </div>

          {/* Setup steps */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-text-2 uppercase tracking-wider">Setup Steps</p>
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-5 w-5 shrink-0 rounded-full bg-bg-2 border border-border flex items-center justify-center text-[10px] font-semibold text-text-2">
                  {i + 1}
                </div>
                <p className="text-sm text-text-2 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          {/* Download buttons */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-text-2 uppercase tracking-wider">Download</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { os: 'Windows', ext: '.exe', icon: '🪟' },
                { os: 'macOS', ext: '.pkg', icon: '🍎' },
                { os: 'Linux', ext: '.sh', icon: '🐧' },
              ].map(({ os, ext, icon }) => (
                <a
                  key={os}
                  href={`/downloads/zero-agent-${os.toLowerCase()}${ext}`}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-bg-0 p-3 hover:border-zero-500/40 hover:bg-bg-2 transition-all group"
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-xs font-medium text-text-1">{os}</span>
                  <span className="text-[10px] text-text-3">{ext}</span>
                  <Download className="h-3.5 w-3.5 text-zero-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>

          {/* Run command hint */}
          <div className="rounded-xl bg-bg-0 border border-border p-3">
            <p className="text-[10px] text-text-3 mb-1.5 font-medium uppercase tracking-wider">Or install via pip (Python 3.10+)</p>
            <code className="text-xs text-zero-400 font-mono">pip install zero-agent && zero-agent start</code>
          </div>

          {/* Test connection */}
          <div className="flex items-center gap-3">
            <button
              onClick={testConnection}
              disabled={testing}
              className="flex items-center gap-2 rounded-xl border border-border bg-bg-2 px-4 py-2.5 text-sm font-medium text-text-1 hover:bg-bg-3 hover:border-zero-500/30 disabled:opacity-50 transition-all"
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Terminal className="h-4 w-4" />}
              Test Connection
            </button>
            {testResult === 'ok' && (
              <div className="flex items-center gap-1.5 text-green-400 text-sm">
                <CheckCircle className="h-4 w-4" />
                Connected! You can close this.
              </div>
            )}
            {testResult === 'fail' && (
              <p className="text-red-400 text-sm">Not found on localhost:7821 — is the agent running?</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
