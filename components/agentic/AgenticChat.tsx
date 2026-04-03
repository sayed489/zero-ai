'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Send, Globe, Code, Image, Terminal, FileText, Chrome, Zap, Loader2, Bot, AlertCircle, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AgentDownload } from './AgentDownload'
import { ActionFeed, ActionItem } from './ActionFeed'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  actions?: ActionItem[]
  images?: string[]
  codeBlocks?: { language: string; content: string }[]
}

const TOOL_ICONS: Record<string, any> = {
  execute_terminal: Terminal,
  read_file: FileText,
  write_file: FileText,
  browser_navigate: Chrome,
  browser_click: Chrome,
  browser_extract: Chrome,
  browser_screenshot: Chrome,
  web_search: Globe,
  generate_code: Code,
  generate_image: Image,
  memory_save: Bot,
  memory_recall: Bot,
  take_screenshot: Image,
}

const EXAMPLE_PROMPTS = [
  "Search GitHub trending repos today",
  "Write a Python web scraper",
  "Generate an isometric city image",
  "Create a daily email digest workflow"
]

export function AgenticChat({ userId }: { userId?: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [agentConnected, setAgentConnected] = useState(false)
  const [showDownload, setShowDownload] = useState(false)
  const [liveActions, setLiveActions] = useState<ActionItem[]>([])
  const [statusText, setStatusText] = useState('Ready')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Check Python agent connection
  useEffect(() => {
    const checkAgent = () => {
      try {
        const ws = new WebSocket(process.env.NEXT_PUBLIC_AGENT_WS_URL ?? 'ws://localhost:7821')
        ws.onopen = () => { setAgentConnected(true); ws.close() }
        ws.onerror = () => setAgentConnected(false)
      } catch { setAgentConnected(false) }
    }
    checkAgent()
    const interval = setInterval(checkAgent, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, liveActions])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isRunning) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsRunning(true)
    setLiveActions([])
    setStatusText('Planning...')

    const assistantId = `ast_${Date.now()}`
    let accContent = ''
    let accActions: ActionItem[] = []
    let accImages: string[] = []
    let accCode: { language: string; content: string }[] = []

    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', actions: [], images: [], codeBlocks: [] }])

    const history = messages.map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/agentic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId: `sess_${userId}_${Date.now()}`,
          userId: userId || 'anonymous',
          conversationHistory: history,
          agentConnected,
        }),
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })

        const lines = buf.split('\n')
        buf = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') break

          try {
            const event = JSON.parse(raw)

            if (event.type === 'thinking') {
              accContent += (accContent ? '\n' : '') + event.content
              setStatusText('Thinking...')
            } else if (event.type === 'final') {
              accContent = event.content
              setStatusText('Done')
            } else if (event.type === 'action_start') {
              setStatusText(`Running: ${event.tool}`)
              const actionItem: ActionItem = {
                id: `${event.step}_${event.tool}`,
                tool: event.tool,
                params: event.params,
                step: event.step,
                status: 'running',
              }
              accActions = [...accActions, actionItem]
              setLiveActions([...accActions])
            } else if (event.type === 'action_result') {
              accActions = accActions.map(a =>
                a.tool === event.tool && a.step === event.step
                  ? { ...a, result: event.result, status: event.success ? 'done' : 'failed', duration_ms: event.duration_ms }
                  : a
              )
              setLiveActions([...accActions])
            } else if (event.type === 'image') {
              accImages = [...accImages, event.url]
            } else if (event.type === 'code') {
              accCode = [...accCode, { language: event.language, content: event.content }]
            }

            setMessages(prev => prev.map(m =>
              m.id === assistantId
                ? { ...m, content: accContent, actions: accActions, images: accImages, codeBlocks: accCode }
                : m
            ))
          } catch {}
        }
      }
    } catch (e: any) {
      setStatusText('Error')
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: `Agentic error: ${e.message}` } : m
      ))
    } finally {
      setIsRunning(false)
      setLiveActions([])
    }
  }, [input, isRunning, messages, agentConnected, userId])

  return (
    <div className="flex h-full bg-bg-0">
      {/* Left - Conversation */}
      <div className="flex flex-col flex-1 min-w-0 border-r border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-bg-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-zero-300 to-zero-500 flex items-center justify-center shadow-lg shadow-zero-300/20">
              <Bot className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-1">Agentic Chad</p>
              <p className="text-[11px] text-text-3">Autonomous AI Agent</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Status badge */}
            <div className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
              isRunning ? 'bg-zero-300/10 text-zero-300' : 'bg-bg-2 text-text-2'
            )}>
              {isRunning && <Loader2 className="h-3 w-3 animate-spin" />}
              {statusText}
            </div>
            {/* Agent connection indicator */}
            <button
              onClick={() => setShowDownload(true)}
              title={agentConnected ? 'Agent connected' : 'Agent not connected'}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                agentConnected
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
              )}
            >
              <span className={cn('h-2 w-2 rounded-full', agentConnected ? 'bg-emerald-400' : 'bg-orange-400 animate-pulse')} />
              {agentConnected ? 'Agent online' : 'Agent offline'}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-zero-300/20 to-zero-500/10 border border-zero-300/20 flex items-center justify-center">
                <Bot className="h-10 w-10 text-zero-300" />
              </div>
              <div>
                <p className="text-text-1 font-semibold text-lg">Agentic Chad is ready</p>
                <p className="text-text-3 text-sm mt-2 max-w-md">
                  Give me any task and I will execute it. I can browse the web, write code, generate images, and more.
                </p>
              </div>
              
              {!agentConnected && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Desktop agent not connected. Some features require it.</span>
                  <button 
                    onClick={() => setShowDownload(true)}
                    className="flex items-center gap-1 ml-2 underline hover:no-underline"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 max-w-lg mt-2">
                {EXAMPLE_PROMPTS.map(ex => (
                  <button 
                    key={ex} 
                    onClick={() => setInput(ex)}
                    className="rounded-xl border border-border bg-bg-1 px-4 py-3 text-sm text-text-2 hover:text-text-1 hover:border-zero-300/40 hover:bg-bg-2 transition-all text-left"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' && 'justify-end')}>
              {msg.role === 'assistant' && (
                <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br from-zero-300 to-zero-500 flex items-center justify-center mt-0.5 shadow-lg shadow-zero-300/10">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm',
                msg.role === 'user'
                  ? 'bg-zero-300 text-bg-0 rounded-tr-md'
                  : 'bg-bg-1 border border-border text-text-1 rounded-tl-md'
              )}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content || (msg.role === 'assistant' && isRunning ? 'Thinking...' : '')}</p>

                {/* Generated images */}
                {msg.images && msg.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.images.map((url, i) => (
                      <img key={i} src={url} alt="Generated" className="rounded-xl max-w-full max-h-64 object-cover border border-border" />
                    ))}
                  </div>
                )}

                {/* Code blocks */}
                {msg.codeBlocks && msg.codeBlocks.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.codeBlocks.map((cb, i) => (
                      <div key={i} className="rounded-xl bg-bg-0 border border-border overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-bg-2">
                          <Code className="h-3 w-3 text-zero-300" />
                          <span className="text-xs text-text-3">{cb.language}</span>
                        </div>
                        <pre className="p-3 text-xs text-text-2 overflow-x-auto"><code>{cb.content}</code></pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border bg-bg-1 px-4 py-3">
          <div className="flex items-end gap-2 rounded-2xl bg-bg-2 border border-border px-3 py-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Give me any task..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-text-1 placeholder:text-text-3 focus:outline-none max-h-32"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isRunning}
              className="shrink-0 h-9 w-9 rounded-xl bg-zero-300 text-bg-0 flex items-center justify-center hover:bg-zero-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Right - Live Action Feed */}
      <div className="w-[360px] shrink-0 flex flex-col bg-bg-1 hidden lg:flex">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-text-1">Action Feed</p>
          {liveActions.length > 0 && (
            <span className="rounded-full bg-zero-300/10 text-zero-300 text-xs px-2.5 py-0.5 font-medium">
              {liveActions.length} steps
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <ActionFeed actions={liveActions} isRunning={isRunning} />
        </div>
      </div>

      {/* Agent download modal */}
      {showDownload && <AgentDownload onClose={() => setShowDownload(false)} />}
    </div>
  )
}
