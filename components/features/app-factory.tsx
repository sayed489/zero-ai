'use client'

import { useState, useMemo } from 'react'
import { X, Maximize2, Minimize2, RotateCcw, FolderOpen, Terminal, Eye, Copy, Check, Sparkles } from 'lucide-react'
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  SandpackConsole,
} from '@codesandbox/sandpack-react'
import { atomDark } from '@codesandbox/sandpack-themes'

interface AppFactoryProps {
  files: Record<string, string>
  description?: string
  onClose?: () => void
}

type PanelView = 'preview' | 'console'

export function AppFactory({ files, description, onClose }: AppFactoryProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [key, setKey] = useState(0)
  const [bottomPanel, setBottomPanel] = useState<PanelView>('preview')
  const [showFileExplorer, setShowFileExplorer] = useState(true)
  const [copied, setCopied] = useState(false)

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

  return (
    <div className={`flex w-full flex-col bg-bg-0 border-l border-border animate-in slide-in-from-right duration-300 ${
      isFullscreen ? 'fixed inset-0 z-50' : 'h-full'
    }`}>
      {/* Premium Header Bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-bg-1 px-4">
        <div className="flex items-center gap-3">
          {/* App icon */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-zero-300 to-zero-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-text-1">Zero App Factory</span>
            <span className="text-[10px] text-text-3">{fileCount} files generated</span>
          </div>
          {description && (
            <div className="hidden lg:flex items-center gap-2 ml-3 pl-3 border-l border-border">
              <span className="text-[11px] text-text-2 max-w-[200px] truncate">{description}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-text-2 transition-colors hover:text-text-1 hover:bg-bg-2"
            title="Copy main code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={() => setShowFileExplorer(!showFileExplorer)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
              showFileExplorer ? 'bg-bg-2 text-text-1' : 'text-text-2 hover:text-text-1 hover:bg-bg-2'
            }`}
            title="Toggle file explorer"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Files</span>
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

      {/* Panel Tabs: Preview / Console */}
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
          <span>Live</span>
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
            recompileDelay: 400,
          }}
        >
          <SandpackLayout
            style={{
              border: 'none',
              borderRadius: 0,
              height: '100%',
              background: '#0e0e10',
            }}
          >
            {/* File Explorer Panel */}
            {showFileExplorer && (
              <SandpackFileExplorer
                style={{
                  height: '100%',
                  minWidth: '180px',
                  maxWidth: '200px',
                  borderRight: '1px solid #2c2c34',
                  background: '#141416',
                }}
              />
            )}

            {/* Code Editor */}
            <SandpackCodeEditor
              showTabs
              showLineNumbers
              showInlineErrors
              wrapContent
              closableTabs
              style={{
                height: '100%',
                flex: 1,
                minWidth: 0,
              }}
            />

            {/* Preview or Console Panel */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
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
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  )
}
