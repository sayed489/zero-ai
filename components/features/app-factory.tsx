'use client'

import { useState, useMemo } from 'react'
import { X, Maximize2, Minimize2, RotateCcw, FileCode, FolderOpen, Terminal, Eye, ChevronDown, ChevronRight } from 'lucide-react'
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
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}
`
    }

    return normalized
  }, [files])

  const fileCount = Object.keys(sandpackFiles).length

  return (
    <div className={`flex w-full flex-col bg-[#1e1e2e] border-l border-[#313244] animate-in slide-in-from-right duration-300 ${
      isFullscreen ? 'fixed inset-0 z-50' : 'h-full'
    }`}>
      {/* Top Header Bar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#313244] bg-[#181825] px-3">
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <button onClick={onClose} className="h-3 w-3 rounded-full bg-[#f38ba8] hover:brightness-110 transition-all" />
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="h-3 w-3 rounded-full bg-[#f9e2af] hover:brightness-110 transition-all" />
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="h-3 w-3 rounded-full bg-[#a6e3a1] hover:brightness-110 transition-all" />
          </div>
          <div className="flex items-center gap-2 text-[#cdd6f4]">
            <FileCode className="h-3.5 w-3.5 text-[#89b4fa]" />
            <span className="text-xs font-medium">Nano App Factory</span>
            <span className="text-[10px] text-[#6c7086]">·</span>
            <span className="text-[10px] text-[#6c7086]">{fileCount} files</span>
          </div>
          {description && (
            <span className="hidden lg:inline text-[10px] text-[#6c7086] max-w-[250px] truncate">
              — {description}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowFileExplorer(!showFileExplorer)}
            className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-colors ${
              showFileExplorer ? 'bg-[#313244] text-[#cdd6f4]' : 'text-[#6c7086] hover:text-[#cdd6f4]'
            }`}
            title="Toggle file explorer"
          >
            <FolderOpen className="h-3 w-3" />
          </button>
          <button
            onClick={() => setKey(k => k + 1)}
            className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-[#6c7086] hover:text-[#cdd6f4] transition-colors"
            title="Restart"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-[#6c7086] hover:text-[#cdd6f4] transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Right Panel Tabs: Preview / Console */}
      <div className="flex h-8 shrink-0 items-center border-b border-[#313244] bg-[#181825]">
        <button
          onClick={() => setBottomPanel('preview')}
          className={`flex items-center gap-1.5 px-4 h-full text-[11px] font-medium border-b-2 transition-colors ${
            bottomPanel === 'preview'
              ? 'border-[#89b4fa] text-[#cdd6f4] bg-[#1e1e2e]'
              : 'border-transparent text-[#6c7086] hover:text-[#a6adc8]'
          }`}
        >
          <Eye className="h-3 w-3" />
          Preview
        </button>
        <button
          onClick={() => setBottomPanel('console')}
          className={`flex items-center gap-1.5 px-4 h-full text-[11px] font-medium border-b-2 transition-colors ${
            bottomPanel === 'console'
              ? 'border-[#89b4fa] text-[#cdd6f4] bg-[#1e1e2e]'
              : 'border-transparent text-[#6c7086] hover:text-[#a6adc8]'
          }`}
        >
          <Terminal className="h-3 w-3" />
          Terminal
        </button>
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
            },
            entry: "/App.tsx"
          }}
          options={{
            recompileMode: "delayed",
            recompileDelay: 500,
          }}
        >
          <SandpackLayout
            style={{
              border: 'none',
              borderRadius: 0,
              height: '100%',
              background: '#1e1e2e',
            }}
          >
            {/* File Explorer Panel */}
            {showFileExplorer && (
              <SandpackFileExplorer
                style={{
                  height: '100%',
                  minWidth: '180px',
                  maxWidth: '220px',
                  borderRight: '1px solid #313244',
                  background: '#181825',
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
