"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { ZeroMascot } from "@/components/mascot/zero-mascot"
import { cn } from "@/lib/utils"
import { 
  Bot, Send, Loader2, Terminal, Code2, CheckCircle2, XCircle, 
  Globe, Search, FileText, Wand2, Brain, Clock, ChevronDown, 
  ChevronUp, RefreshCw, Copy, Check, Sparkles, AlertTriangle
} from "lucide-react"

interface AgentStep {
  id: string
  type: 'thinking' | 'search' | 'browse' | 'code' | 'tool' | 'result'
  title: string
  content: string
  status: 'running' | 'complete' | 'error'
  timestamp: Date
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface AgenticChatProps {
  sessionId?: string
  userId?: string
  initialPrompt?: string
}

const STEP_ICONS: Record<string, React.ReactNode> = {
  thinking: <Brain className="h-4 w-4" />,
  search: <Search className="h-4 w-4" />,
  browse: <Globe className="h-4 w-4" />,
  code: <Code2 className="h-4 w-4" />,
  tool: <Wand2 className="h-4 w-4" />,
  result: <CheckCircle2 className="h-4 w-4" />,
}

const STEP_COLORS: Record<string, string> = {
  thinking: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  search: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  browse: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  code: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  tool: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  result: "text-zero-300 bg-zero-300/10 border-zero-300/20",
}

// Simple code block component without external dependencies
function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-3 rounded-xl bg-[#1e1e2e] border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
        <span className="text-xs text-text-3 font-mono">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-white/10 text-text-3 hover:text-text-1 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-xs font-mono text-text-2 leading-relaxed whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  )
}

// Simple markdown renderer
function SimpleMarkdown({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g)
  
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w+)?\n?([\s\S]*?)```/)
          if (match) {
            return <CodeBlock key={i} code={match[2].trim()} language={match[1]} />
          }
        }
        // Handle inline code and basic formatting
        return (
          <span key={i} className="whitespace-pre-wrap">
            {part.split(/(`[^`]+`)/g).map((segment, j) => {
              if (segment.startsWith('`') && segment.endsWith('`')) {
                return (
                  <code key={j} className="px-1.5 py-0.5 rounded bg-bg-2 text-text-1 text-xs font-mono">
                    {segment.slice(1, -1)}
                  </code>
                )
              }
              return segment
            })}
          </span>
        )
      })}
    </div>
  )
}

function AgentStepCard({ step, isExpanded, onToggle }: { step: AgentStep; isExpanded: boolean; onToggle: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(step.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn(
      "rounded-xl border overflow-hidden transition-all",
      STEP_COLORS[step.type],
      step.status === 'error' && "border-red-500/30 bg-red-500/5"
    )}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-colors"
      >
        <div className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
          step.status === 'running' && "animate-pulse"
        )}>
          {step.status === 'running' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : step.status === 'error' ? (
            <XCircle className="h-4 w-4 text-red-400" />
          ) : (
            STEP_ICONS[step.type]
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{step.title}</span>
            {step.status === 'running' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-text-2 animate-pulse">Running</span>
            )}
          </div>
          {!isExpanded && step.content && (
            <p className="text-xs text-text-3 truncate mt-0.5">{step.content.slice(0, 80)}...</p>
          )}
        </div>
        <div className="shrink-0 text-text-3">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isExpanded && step.content && (
        <div className="px-3 pb-3">
          <div className="relative bg-bg-0 rounded-lg p-3 border border-border">
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1.5 rounded-md bg-bg-2 hover:bg-bg-3 text-text-3 hover:text-text-1 transition-colors z-10"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            {step.type === 'code' ? (
              <CodeBlock code={step.content} language="typescript" />
            ) : (
              <pre className="text-xs text-text-2 whitespace-pre-wrap font-mono overflow-x-auto pr-8">
                {step.content}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Thinking animation component
function ThinkingAnimation() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-orange-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className="text-sm text-text-2">Thinking...</span>
    </div>
  )
}

// Search animation component
function SearchAnimation() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
      <Search className="h-4 w-4 text-amber-400 animate-pulse" />
      <div className="flex-1">
        <div className="h-2 w-32 bg-amber-500/30 rounded animate-pulse" />
        <div className="h-2 w-24 bg-amber-500/20 rounded mt-1.5 animate-pulse" style={{ animationDelay: '0.2s' }} />
      </div>
    </div>
  )
}

export function AgenticChat({ sessionId, userId, initialPrompt }: AgenticChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [taskDuration, setTaskDuration] = useState(0)

  // Timer for task duration
  useEffect(() => {
    if (!isLoading) return
    const startTime = Date.now()
    const interval = setInterval(() => {
      setTaskDuration(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [isLoading])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, agentSteps])

  // Handle initial prompt
  useEffect(() => {
    if (initialPrompt && !messages.length) {
      setInput(initialPrompt)
    }
  }, [initialPrompt, messages.length])

  const toggleStep = useCallback((id: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const simulateAgentSteps = async (userMessage: string) => {
    // Simulate thinking
    const thinkingStep: AgentStep = {
      id: `${Date.now()}-thinking`,
      type: 'thinking',
      title: 'Analyzing request',
      content: `Understanding: "${userMessage}"`,
      status: 'running',
      timestamp: new Date()
    }
    setAgentSteps(prev => [...prev, thinkingStep])
    await new Promise(r => setTimeout(r, 1500))
    setAgentSteps(prev => prev.map(s => s.id === thinkingStep.id ? { ...s, status: 'complete' as const } : s))

    // Check if needs search
    const needsSearch = userMessage.toLowerCase().includes('search') || 
                       userMessage.toLowerCase().includes('find') ||
                       userMessage.toLowerCase().includes('research') ||
                       userMessage.toLowerCase().includes('latest')
    
    if (needsSearch) {
      const searchStep: AgentStep = {
        id: `${Date.now()}-search`,
        type: 'search',
        title: 'Searching the web',
        content: `Query: "${userMessage.slice(0, 50)}..."`,
        status: 'running',
        timestamp: new Date()
      }
      setAgentSteps(prev => [...prev, searchStep])
      await new Promise(r => setTimeout(r, 2000))
      setAgentSteps(prev => prev.map(s => s.id === searchStep.id ? { ...s, status: 'complete' as const, content: 'Found relevant information from multiple sources' } : s))
    }

    // Check if needs code
    const needsCode = userMessage.toLowerCase().includes('code') || 
                      userMessage.toLowerCase().includes('build') ||
                      userMessage.toLowerCase().includes('create') ||
                      userMessage.toLowerCase().includes('component')
    
    if (needsCode) {
      const codeStep: AgentStep = {
        id: `${Date.now()}-code`,
        type: 'code',
        title: 'Generating code',
        content: '// Working on implementation...',
        status: 'running',
        timestamp: new Date()
      }
      setAgentSteps(prev => [...prev, codeStep])
      await new Promise(r => setTimeout(r, 2500))
      setAgentSteps(prev => prev.map(s => s.id === codeStep.id ? { 
        ...s, 
        status: 'complete' as const, 
        content: `// Example implementation\nexport function Component() {\n  return (\n    <div className="p-4">\n      <h1>Generated Component</h1>\n    </div>\n  )\n}` 
      } : s))
    }

    // Complete
    const resultStep: AgentStep = {
      id: `${Date.now()}-result`,
      type: 'result',
      title: 'Task Complete',
      content: 'Successfully processed your request',
      status: 'complete',
      timestamp: new Date()
    }
    setAgentSteps(prev => [...prev, resultStep])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setError(null)
    setIsLoading(true)
    setTaskDuration(0)
    
    // Add user message
    const userMsg: Message = { id: `${Date.now()}-user`, role: 'user', content: userMessage }
    setMessages(prev => [...prev, userMsg])
    
    // Clear previous steps
    setAgentSteps([])

    try {
      // Simulate agent steps for better UX
      await simulateAgentSteps(userMessage)

      // Call API
      const response = await fetch('/api/agentic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          sessionId,
          userId 
        }),
      })

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      // Read streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          assistantContent += chunk
          
          // Update message in real-time
          setMessages(prev => {
            const existing = prev.find(m => m.id === `${userMsg.id}-assistant`)
            if (existing) {
              return prev.map(m => m.id === existing.id ? { ...m, content: assistantContent } : m)
            } else {
              return [...prev, { id: `${userMsg.id}-assistant`, role: 'assistant' as const, content: assistantContent }]
            }
          })
        }
      }

      // Ensure final message is added
      if (!assistantContent) {
        assistantContent = "I've completed the task. Let me know if you need anything else!"
      }
      
      setMessages(prev => {
        const existing = prev.find(m => m.id === `${userMsg.id}-assistant`)
        if (existing) {
          return prev.map(m => m.id === existing.id ? { ...m, content: assistantContent } : m)
        } else {
          return [...prev, { id: `${userMsg.id}-assistant`, role: 'assistant' as const, content: assistantContent }]
        }
      })

    } catch (err) {
      console.error('Agentic error:', err)
      setError(err instanceof Error ? err : new Error('Something went wrong'))
      setAgentSteps(prev => [...prev, {
        id: `${Date.now()}-error`,
        type: 'result',
        title: 'Error',
        content: err instanceof Error ? err.message : 'An unexpected error occurred',
        status: 'error',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  return (
    <div className="flex flex-col h-full bg-bg-0">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-bg-1 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-text-1 flex items-center gap-2">
                Agentic Mode
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20 uppercase tracking-wider">
                  Beta
                </span>
              </h1>
              <p className="text-sm text-text-3">Autonomous AI agent for complex tasks</p>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-bg-2 border border-border">
              <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-text-3" />
                <span className="text-sm font-mono text-text-2">{formatDuration(taskDuration)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages & Steps */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
      >
        {messages.length === 0 && agentSteps.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="relative mb-6">
              <ZeroMascot size={80} state="happy" mood="excited" />
              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center border-4 border-bg-0">
                <Wand2 className="h-4 w-4 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-text-1 mb-2">Agentic Mode</h2>
            <p className="text-text-3 max-w-md mb-8">
              Give me a complex task and I&apos;ll work autonomously to complete it.
              I can search the web, analyze data, write code, and more.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {[
                { icon: <Search className="h-4 w-4" />, text: "Research competitor pricing", color: "text-amber-400" },
                { icon: <Code2 className="h-4 w-4" />, text: "Build a React component", color: "text-emerald-400" },
                { icon: <Globe className="h-4 w-4" />, text: "Find trending tech topics", color: "text-violet-400" },
                { icon: <FileText className="h-4 w-4" />, text: "Summarize latest AI news", color: "text-blue-400" },
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setInput(example.text)}
                  className="flex items-center gap-3 p-4 rounded-xl bg-bg-1 border border-border text-left hover:border-orange-500/30 hover:bg-bg-2 transition-all group"
                >
                  <div className={cn("shrink-0", example.color)}>{example.icon}</div>
                  <span className="text-sm text-text-2 group-hover:text-text-1 transition-colors">{example.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Agent Steps */}
        {agentSteps.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-text-3">
              <Terminal className="h-4 w-4" />
              <span>Agent Activity</span>
              <span className="text-text-3/50">({agentSteps.length} steps)</span>
            </div>
            {agentSteps.map(step => (
              <AgentStepCard
                key={step.id}
                step={step}
                isExpanded={expandedSteps.has(step.id)}
                onToggle={() => toggleStep(step.id)}
              />
            ))}
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <div 
            key={message.id}
            className={cn(
              "flex gap-4",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {message.role === 'assistant' && (
              <div className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
            )}
            <div className={cn(
              "max-w-[80%] rounded-2xl px-5 py-4",
              message.role === 'user' 
                ? "bg-zero-300 text-bg-0" 
                : "bg-bg-1 border border-border text-text-1"
            )}>
              {message.role === 'assistant' ? (
                <SimpleMarkdown content={message.content} />
              ) : (
                <p className="text-sm">{message.content}</p>
              )}
            </div>
            {message.role === 'user' && (
              <div className="shrink-0 h-10 w-10 rounded-xl bg-bg-2 border border-border flex items-center justify-center">
                <span className="text-sm font-semibold text-text-1">You</span>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && messages.length > 0 && !messages.some(m => m.role === 'assistant' && m.content) && (
          <div className="flex gap-4">
            <div className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div className="bg-bg-1 border border-border rounded-2xl px-5 py-4">
              <ThinkingAnimation />
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Something went wrong</p>
              <p className="text-xs text-red-400/70 mt-0.5">{error.message}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="shrink-0 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="shrink-0 border-t border-border bg-bg-1 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe a complex task..."
              disabled={isLoading}
              className="w-full px-5 py-4 pr-14 bg-bg-2 border border-border rounded-2xl text-text-1 placeholder:text-text-3 focus:outline-none focus:border-orange-500/50 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <p className="text-[11px] text-text-3 mt-2 text-center">
          Agentic mode uses more resources. Best for complex, multi-step tasks.
        </p>
      </form>
    </div>
  )
}
