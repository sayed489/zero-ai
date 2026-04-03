'use client'

import { Terminal, Chrome, FileText, Globe, Code, Image, Box, Cpu, Check, X, Loader2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ActionItem = {
  id: string
  tool: string
  params: Record<string, any>
  step: number
  status: 'running' | 'done' | 'failed'
  result?: string
  duration_ms?: number
}

const TOOL_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  execute_terminal: { icon: Terminal, label: 'Terminal', color: 'text-orange-400' },
  browser_navigate: { icon: Chrome, label: 'Navigate', color: 'text-blue-400' },
  browser_click: { icon: Chrome, label: 'Click', color: 'text-blue-400' },
  browser_extract: { icon: Chrome, label: 'Extract', color: 'text-blue-400' },
  browser_screenshot: { icon: Chrome, label: 'Screenshot', color: 'text-blue-400' },
  read_file: { icon: FileText, label: 'Read File', color: 'text-text-2' },
  write_file: { icon: FileText, label: 'Write File', color: 'text-text-2' },
  take_screenshot: { icon: Image, label: 'Screenshot', color: 'text-text-2' },
  web_search: { icon: Globe, label: 'Web Search', color: 'text-zero-400' },
  generate_code: { icon: Code, label: 'Write Code', color: 'text-zero-400' },
  generate_image: { icon: Image, label: 'Generate Image', color: 'text-zero-400' },
  generate_3d_model: { icon: Box, label: '3D Model', color: 'text-zero-400' },
  memory_save: { icon: Cpu, label: 'Save Memory', color: 'text-text-3' },
  memory_recall: { icon: Cpu, label: 'Recall Memory', color: 'text-text-3' },
}

function paramSummary(tool: string, params: Record<string, any>): string {
  if (params.command) return params.command.slice(0, 60)
  if (params.url) return params.url.slice(0, 60)
  if (params.query) return params.query.slice(0, 60)
  if (params.prompt) return params.prompt.slice(0, 60)
  if (params.task) return params.task.slice(0, 60)
  if (params.file_path) return params.file_path.slice(0, 60)
  return Object.values(params).join(', ').slice(0, 60)
}

export function ActionFeed({ actions, isRunning }: { actions: ActionItem[]; isRunning: boolean }) {
  if (!isRunning && actions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
        <div className="h-12 w-12 rounded-xl bg-bg-2 flex items-center justify-center">
          <Terminal className="h-5 w-5 text-text-3" />
        </div>
        <p className="text-xs text-text-3">Actions will appear here as Zero works through your task in real-time.</p>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-2">
      {actions.map((action) => {
        const cfg = TOOL_CONFIG[action.tool] || { icon: Cpu, label: action.tool, color: 'text-text-3' }
        const Icon = cfg.icon
        return (
          <div
            key={action.id}
            className={cn(
              'rounded-xl border p-3 transition-all',
              action.status === 'running' && 'border-zero-500/30 bg-zero-500/5',
              action.status === 'done' && 'border-border bg-bg-0',
              action.status === 'failed' && 'border-red-500/30 bg-red-500/5'
            )}
          >
            <div className="flex items-start gap-2.5">
              {/* Status icon */}
              <div className={cn('mt-0.5 h-6 w-6 shrink-0 rounded-lg flex items-center justify-center',
                action.status === 'running' && 'bg-zero-500/10',
                action.status === 'done' && 'bg-bg-2',
                action.status === 'failed' && 'bg-red-500/10'
              )}>
                {action.status === 'running'
                  ? <Loader2 className="h-3.5 w-3.5 text-zero-400 animate-spin" />
                  : action.status === 'done'
                  ? <Check className="h-3.5 w-3.5 text-green-400" />
                  : <X className="h-3.5 w-3.5 text-red-400" />
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Icon className={cn('h-3.5 w-3.5', cfg.color)} />
                    <span className="text-xs font-medium text-text-1">{cfg.label}</span>
                    <span className="text-[10px] text-text-3">Step {action.step}</span>
                  </div>
                  {action.duration_ms && (
                    <span className="flex items-center gap-1 text-[10px] text-text-3">
                      <Clock className="h-2.5 w-2.5" />
                      {action.duration_ms < 1000 ? `${action.duration_ms}ms` : `${(action.duration_ms / 1000).toFixed(1)}s`}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-[11px] text-text-2 truncate">
                  {paramSummary(action.tool, action.params)}
                </p>

                {action.result && action.status !== 'running' && (
                  <p className={cn(
                    'mt-1.5 text-[11px] rounded-lg px-2 py-1 font-mono line-clamp-3',
                    action.status === 'failed'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-bg-2 text-text-3'
                  )}>
                    {action.result.slice(0, 200)}{action.result.length > 200 ? '…' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {isRunning && actions.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2">
          <Loader2 className="h-3 w-3 animate-spin text-zero-400" />
          <span className="text-xs text-text-3">Executing next step…</span>
        </div>
      )}
    </div>
  )
}
