'use client'

import { useState, useMemo, useEffect } from 'react'
import { X, Maximize2, Minimize2, RotateCcw, FolderOpen, Terminal, Eye, Copy, Check, Sparkles, ExternalLink, Download, Code2, Play, Loader2 } from 'lucide-react'
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  SandpackConsole,
  useSandpack,
} from '@codesandbox/sandpack-react'
import { atomDark } from '@codesandbox/sandpack-themes'

interface AppFactoryProps {
  files: Record<string, string>
  description?: string
  stackblitzUrl?: string
  onClose?: () => void
}

type PanelView = 'preview' | 'console'
type ViewMode = 'split' | 'code' | 'preview'

// Custom refresh button that accesses sandpack context
function RefreshButton() {
  const { sandpack } = useSandpack()
  return (
    <button
      onClick={() => sandpack.runSandpack()}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-text-2 hover:text-text-1 hover:bg-bg-2 transition-colors"
      title="Restart preview"
    >
      <RotateCcw className="h-3.5 w-3.5" />
    </button>
  )
}

export function AppFactory({ files, description, stackblitzUrl, onClose }: AppFactoryProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [key, setKey] = useState(0)
  const [bottomPanel, setBottomPanel] = useState<PanelView>('preview')
  const [showFileExplorer, setShowFileExplorer] = useState(true)
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('split')

  // Normalize & enrich files for Sandpack compatibility
  const sandpackFiles = useMemo(() => {
    const normalized: Record<string, string> = {}

    for (const [filename, code] of Object.entries(files)) {
      const normalizedName = filename.startsWith('/') ? filename : `/${filename}`
      normalized[normalizedName] = code
    }

    // Ensure App.tsx exists
    if (!normalized['/App.tsx'] && !normalized['/App.jsx'] && !normalized['/App.js']) {
      const fileKeys = Object.keys(normalized)
      if (fileKeys.length === 1) {
        normalized['/App.tsx'] = normalized[fileKeys[0]]
        delete normalized[fileKeys[0]]
      }
    }

    // Inject global styles if missing
    if (!normalized['/styles.css']) {
      normalized['/styles.css'] = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  background: #0a0a0a;
  color: #fafafa;
}
`
    }

    return normalized
  }, [files])

  const fileCount = Object.keys(sandpackFiles).length

  const handleCopyCode = async () => {
    const mainFile = sandpackFiles['/App.tsx'] || sandpackFiles['/App.jsx'] || Object.values(sandpackFiles)[0]
    await navigator.clipboard.writeText(mainFile)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    // Create a simple zip-like download of the main file
    const mainFile = sandpackFiles['/App.tsx'] || sandpackFiles['/App.jsx'] || Object.values(sandpackFiles)[0]
    const blob = new Blob([mainFile], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'App.tsx'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  return (
    <div className={`flex w-full flex-col bg-bg-0 border-l border-border animate-in slide-in-from-right duration-300 ${
      isFullscreen ? 'fixed inset-0 z-50' : 'h-full'
    }`}>
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-bg-1 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-zero-300 to-zero-500 shadow-lg shadow-zero-300/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-text-1">App Factory</span>
            <span className="text-[10px] text-text-3">{fileCount} files generated</span>
          </div>
          {description && (
            <div className="hidden lg:flex items-center gap-2 ml-3 pl-3 border-l border-border">
              <span className="text-[11px] text-text-2 max-w-[200px] truncate">{description}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* View mode toggle */}
          <div className="hidden sm:flex items-center gap-1 bg-bg-2 rounded-lg p-1 mr-2">
            <button
              onClick={() => setViewMode('code')}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${viewMode === 'code' ? 'bg-bg-3 text-text-1' : 'text-text-3 hover:text-text-2'}`}
            >
              Code
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${viewMode === 'split' ? 'bg-bg-3 text-text-1' : 'text-text-3 hover:text-text-2'}`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${viewMode === 'preview' ? 'bg-bg-3 text-text-1' : 'text-text-3 hover:text-text-2'}`}
            >
              Preview
            </button>
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-text-2 transition-colors hover:text-text-1 hover:bg-bg-2"
            title="Copy main code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-text-2 transition-colors hover:text-text-1 hover:bg-bg-2"
            title="Download file"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          {stackblitzUrl && (
            <a
              href={stackblitzUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-text-2 transition-colors hover:text-text-1 hover:bg-bg-2"
              title="Open in StackBlitz"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">StackBlitz</span>
            </a>
          )}

          <button
            onClick={() => setShowFileExplorer(!showFileExplorer)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
              showFileExplorer ? 'bg-bg-2 text-text-1' : 'text-text-2 hover:text-text-1 hover:bg-bg-2'
            }`}
            title="Toggle file explorer"
          >
            <FolderOpen className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setKey(k => k + 1)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-text-2 hover:text-text-1 hover:bg-bg-2 transition-colors"
            title="Restart preview"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-text-2 hover:text-text-1 hover:bg-bg-2 transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={onClose}
            className="ml-1 flex items-center justify-center rounded-lg p-1.5 text-text-2 hover:text-text-1 hover:bg-bg-2 transition-colors"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Panel Tabs */}
      <div className="flex h-10 shrink-0 items-center gap-1 border-b border-border bg-bg-1 px-4">
        <button
          onClick={() => setBottomPanel('preview')}
          className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-medium rounded-lg transition-colors ${
            bottomPanel === 'preview'
              ? 'bg-bg-2 text-text-1'
              : 'text-text-3 hover:text-text-1 hover:bg-bg-2'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </button>
        <button
          onClick={() => setBottomPanel('console')}
          className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-medium rounded-lg transition-colors ${
            bottomPanel === 'console'
              ? 'bg-bg-2 text-text-1'
              : 'text-text-3 hover:text-text-1 hover:bg-bg-2'
          }`}
        >
          <Terminal className="h-3.5 w-3.5" />
          Console
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-[10px] text-text-3">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Preview</span>
        </div>
      </div>

      {/* Main Content: Sandpack IDE */}
      <div className="relative flex-1 overflow-hidden" key={key}>
        <SandpackProvider
          template="react-ts"
          theme={atomDark}
          files={sandpackFiles}
          customSetup={{
            dependencies: {
              "lucide-react": "latest",
              "framer-motion": "latest",
              "react-icons": "latest",
              "clsx": "latest",
              "tailwind-merge": "latest",
            },
            entry: "/App.tsx"
          }}
          options={{
            recompileMode: "delayed",
            recompileDelay: 500,
            autorun: true,
            autoReload: true,
          }}
        >
          <SandpackLayout
            style={{
              border: 'none',
              borderRadius: 0,
              height: '100%',
              background: 'var(--bg-0)',
            }}
          >
            {/* File Explorer Panel */}
            {showFileExplorer && viewMode !== 'preview' && (
              <SandpackFileExplorer
                style={{
                  height: '100%',
                  minWidth: '160px',
                  maxWidth: '180px',
                  borderRight: '1px solid var(--border)',
                  background: 'var(--bg-1)',
                }}
              />
            )}

            {/* Code Editor */}
            {viewMode !== 'preview' && (
              <SandpackCodeEditor
                showTabs
                showLineNumbers
                showInlineErrors
                wrapContent
                closableTabs
                style={{
                  height: '100%',
                  flex: viewMode === 'code' ? 1 : 1,
                  minWidth: 0,
                }}
              />
            )}

            {/* Preview or Console Panel */}
            {viewMode !== 'code' && (
              <div style={{ 
                flex: viewMode === 'preview' ? 1 : 1, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%', 
                minWidth: 0 
              }}>
                {bottomPanel === 'preview' ? (
                  <SandpackPreview
                    showNavigator
                    showRefreshButton
                    style={{
                      height: '100%',
                      flex: 1,
                    }}
                  />
                ) : (
                  <SandpackConsole
                    style={{
                      height: '100%',
                      flex: 1,
                    }}
                    showHeader
                  />
                )}
              </div>
            )}
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  )
}

// Standalone App Factory modal for generating new apps
interface AppFactoryModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (description: string) => Promise<void>
  isGenerating: boolean
}

export function AppFactoryModal({ isOpen, onClose, onGenerate, isGenerating }: AppFactoryModalProps) {
  const [description, setDescription] = useState('')
  const [complexity, setComplexity] = useState<'simple' | 'complex'>('simple')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || isGenerating) return
    await onGenerate(description)
    setDescription('')
  }

  const examples = [
    'A todo app with dark mode',
    'A weather dashboard',
    'A portfolio landing page',
    'A calculator with history',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-bg-1 rounded-2xl border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-zero-300 to-zero-500 flex items-center justify-center">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-1">App Factory</h2>
              <p className="text-xs text-text-3">Generate a complete app from a description</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-2 hover:text-text-1 hover:bg-bg-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-2 mb-2">
              Describe your app
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A productivity dashboard with task management..."
              rows={3}
              className="w-full px-4 py-3 bg-bg-2 border border-border rounded-xl text-text-1 placeholder:text-text-3 focus:outline-none focus:border-zero-300 resize-none"
              disabled={isGenerating}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-text-2 mb-2">
              Complexity
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setComplexity('simple')}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  complexity === 'simple'
                    ? 'bg-zero-300/15 text-zero-300 border border-zero-300/30'
                    : 'bg-bg-2 text-text-2 border border-border hover:border-border-hover'
                }`}
              >
                Simple
              </button>
              <button
                type="button"
                onClick={() => setComplexity('complex')}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  complexity === 'complex'
                    ? 'bg-zero-300/15 text-zero-300 border border-zero-300/30'
                    : 'bg-bg-2 text-text-2 border border-border hover:border-border-hover'
                }`}
              >
                Complex
              </button>
            </div>
          </div>

          <div className="mb-5">
            <p className="text-xs text-text-3 mb-2">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setDescription(ex)}
                  className="px-3 py-1.5 text-xs bg-bg-2 border border-border rounded-lg text-text-2 hover:text-text-1 hover:border-border-hover transition-colors"
                  disabled={isGenerating}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!description.trim() || isGenerating}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-zero-300 hover:bg-zero-400 text-bg-0 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Generate App
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
