'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Database, 
  Zap,
  Plug,
  ExternalLink,
  Check,
  AlertCircle,
  Server
} from 'lucide-react'
import { ZeroMascot } from '@/components/mascot/zero-mascot'
import { PlanBadge } from '@/components/subscription/plan-badge'
import { cn } from '@/lib/utils'
import { MCP_CONNECTORS, type MCPConnector } from '@/lib/types'
import type { Plan } from '@/lib/utils'

type SettingsTab = 'profile' | 'preferences' | 'appearance' | 'privacy' | 'memory' | 'connectors' | 'subscription'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('connectors')
  const [plan] = useState<Plan>('starter')

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'preferences', label: 'Preferences', icon: <Bell className="h-4 w-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" /> },
    { id: 'connectors', label: 'Connectors', icon: <Plug className="h-4 w-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="h-4 w-4" /> },
    { id: 'memory', label: 'Memory', icon: <Database className="h-4 w-4" /> },
    { id: 'subscription', label: 'Subscription', icon: <Zap className="h-4 w-4" /> },
  ]

  return (
    <div className="min-h-screen bg-bg-0">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-bg-1/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-4">
          <Link
            href="/chat"
            className="flex items-center gap-2 text-text-2 hover:text-text-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <ZeroMascot size={32} state="idle" interactive={false} />
          <h1 className="text-lg font-medium text-text-1">Settings</h1>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Sidebar */}
          <nav className="shrink-0 md:w-48">
            <ul className="space-y-1">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      activeTab === tab.id
                        ? 'bg-zero-glow text-zero-300'
                        : 'text-text-2 hover:bg-bg-2 hover:text-text-1'
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'preferences' && <PreferencesSettings />}
            {activeTab === 'appearance' && <AppearanceSettings />}
            {activeTab === 'connectors' && <ConnectorsSettings />}
            {activeTab === 'privacy' && <PrivacySettings />}
            {activeTab === 'memory' && <MemorySettings plan={plan} />}
            {activeTab === 'subscription' && <SubscriptionSettings plan={plan} />}
          </main>
        </div>
      </div>
    </div>
  )
}

function ProfileSettings() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-text-1">Profile</h2>
        <p className="mt-1 text-sm text-text-2">Manage your account information</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-text-1">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border border-border bg-bg-1 px-4 py-2 text-text-1 placeholder:text-text-3 focus:border-zero-300 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-lg border border-border bg-bg-1 px-4 py-2 text-text-1 placeholder:text-text-3 focus:border-zero-300 focus:outline-none"
          />
        </div>

        <button className="rounded-lg bg-zero-300 px-4 py-2 text-sm font-medium text-bg-0 transition-colors hover:bg-zero-400">
          Save Changes
        </button>
      </div>
    </div>
  )
}

function PreferencesSettings() {
  const [defaultModel, setDefaultModel] = useState('nano')
  const [autoSave, setAutoSave] = useState(true)
  const [suggestions, setSuggestions] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-text-1">Preferences</h2>
        <p className="mt-1 text-sm text-text-2">Customize your Zero AI experience</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-text-1">
            Default AI Model
          </label>
          <select
            value={defaultModel}
            onChange={(e) => setDefaultModel(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg-1 px-4 py-2 text-text-1 focus:border-zero-300 focus:outline-none"
          >
            <option value="nano">Zero Nano (Fast)</option>
            <option value="prime">Zero Prime (Balanced)</option>
            <option value="apex">Zero Apex (Powerful)</option>
            <option value="agentic-chad">Agentic Chad (Agent)</option>
          </select>
        </div>

        <ToggleSetting
          title="Auto-save conversations"
          description="Automatically save chat history"
          value={autoSave}
          onChange={setAutoSave}
        />

        <ToggleSetting
          title="Smart suggestions"
          description="Show AI-powered response suggestions"
          value={suggestions}
          onChange={setSuggestions}
        />
      </div>
    </div>
  )
}

function AppearanceSettings() {
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-text-1">Appearance</h2>
        <p className="mt-1 text-sm text-text-2">Customize how Zero AI looks</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-3 block text-sm font-medium text-text-1">Theme</label>
          <div className="flex gap-3">
            {(['dark', 'light', 'system'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  'flex-1 rounded-lg border px-4 py-3 text-sm font-medium capitalize transition-colors',
                  theme === t
                    ? 'border-zero-300 bg-zero-glow text-zero-300'
                    : 'border-border text-text-2 hover:border-border-hover hover:text-text-1'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ConnectorsSettings() {
  const [connectors, setConnectors] = useState<MCPConnector[]>(MCP_CONNECTORS)
  const [mcpServerUrl, setMcpServerUrl] = useState('')
  const [showMcpServer, setShowMcpServer] = useState(false)

  const toggleConnector = (id: string) => {
    setConnectors(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: c.status === 'connected' ? 'disconnected' : 'connected'
        }
      }
      return c
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-text-1">MCP Connectors</h2>
        <p className="mt-1 text-sm text-text-2">
          Connect external tools and services to extend Zero&apos;s capabilities.{' '}
          <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer" className="text-zero-300 hover:underline">
            Learn about MCP
          </a>
        </p>
      </div>

      <div className="grid gap-3">
        {connectors.map((connector) => (
          <div
            key={connector.id}
            className={cn(
              'rounded-xl border p-4 transition-colors',
              connector.status === 'connected' 
                ? 'border-green-500/30 bg-green-500/5' 
                : 'border-border bg-bg-1'
            )}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg-2 text-xl">
                {connector.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-text-1">{connector.name}</h3>
                  {connector.status === 'connected' && (
                    <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-500">
                      <Check className="h-3 w-3" />
                      Connected
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-text-2">{connector.description}</p>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {connector.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="rounded bg-bg-2 px-2 py-0.5 text-xs text-text-3"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => toggleConnector(connector.id)}
                className={cn(
                  'shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  connector.status === 'connected'
                    ? 'border border-border text-text-2 hover:bg-bg-2'
                    : 'bg-zero-300 text-bg-0 hover:bg-zero-400'
                )}
              >
                {connector.status === 'connected' ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add custom MCP server */}
      <div className="rounded-xl border border-border bg-bg-1 p-4">
        <button 
          onClick={() => setShowMcpServer(!showMcpServer)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-text-2" />
            <div className="text-left">
              <p className="font-medium text-text-1">Custom MCP Server</p>
              <p className="text-sm text-text-2">Connect your own MCP server</p>
            </div>
          </div>
          <span className="text-text-3">{showMcpServer ? '−' : '+'}</span>
        </button>
        
        {showMcpServer && (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <div>
              <label className="mb-2 block text-sm text-text-2">Server URL</label>
              <input
                type="url"
                value={mcpServerUrl}
                onChange={(e) => setMcpServerUrl(e.target.value)}
                placeholder="https://your-mcp-server.com"
                className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm text-text-1 placeholder:text-text-3 focus:border-zero-300 focus:outline-none"
              />
            </div>
            <button className="rounded-lg bg-zero-300 px-4 py-2 text-sm font-medium text-bg-0 transition-colors hover:bg-zero-400">
              Connect Server
            </button>
          </div>
        )}
      </div>

      {/* Export for Claude/Cursor */}
      <div className="rounded-xl border border-border bg-bg-1 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-zero-300" />
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-text-1">Export memories for other apps</h3>
            <p className="mt-0.5 text-sm text-text-2">
              Export your Zero memories to use with Claude, Cursor, or other MCP-compatible apps.
            </p>
            <button className="mt-3 flex items-center gap-2 rounded-lg bg-bg-2 px-4 py-2 text-sm text-text-1 transition-colors hover:bg-bg-3">
              Export MCP Config
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PrivacySettings() {
  const [analytics, setAnalytics] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-text-1">Privacy</h2>
        <p className="mt-1 text-sm text-text-2">Control your data and privacy settings</p>
      </div>

      <div className="space-y-4">
        <ToggleSetting
          title="Usage analytics"
          description="Help improve Zero AI with anonymous usage data"
          value={analytics}
          onChange={setAnalytics}
        />

        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <h3 className="mb-2 font-medium text-red-400">Danger Zone</h3>
          <p className="mb-4 text-sm text-text-2">
            Delete all your data including conversations and memories. This action cannot be undone.
          </p>
          <button className="rounded-lg border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10">
            Delete All Data
          </button>
        </div>
      </div>
    </div>
  )
}

function MemorySettings({ plan }: { plan: Plan }) {
  const memoryCount = 42
  const maxMemory = plan === 'starter' ? 50 : plan === 'pro' ? 2000 : 999999

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-text-1">Memory</h2>
        <p className="mt-1 text-sm text-text-2">Manage what Zero remembers about you</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-bg-1 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-text-2">Memory usage</span>
            <span className="text-sm font-medium text-text-1">
              {memoryCount} / {maxMemory === 999999 ? 'Unlimited' : maxMemory}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-bg-3">
            <div
              className="h-full bg-zero-300"
              style={{ width: `${Math.min((memoryCount / maxMemory) * 100, 100)}%` }}
            />
          </div>
        </div>

        <button className="w-full rounded-lg border border-border bg-bg-1 px-4 py-3 text-sm text-text-2 transition-colors hover:border-border-hover hover:text-text-1">
          View All Memories
        </button>

        <button className="w-full rounded-lg border border-border bg-bg-1 px-4 py-3 text-sm text-text-2 transition-colors hover:border-border-hover hover:text-text-1">
          Export for Claude/Cursor (MCP)
        </button>

        <button className="w-full rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400 transition-colors hover:bg-red-500/10">
          Clear All Memories
        </button>
      </div>
    </div>
  )
}

function SubscriptionSettings({ plan }: { plan: Plan }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-text-1">Subscription</h2>
        <p className="mt-1 text-sm text-text-2">Manage your Zero AI subscription</p>
      </div>

      <div className="rounded-lg border border-border bg-bg-1 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-2">Current Plan</p>
            <div className="mt-1 flex items-center gap-2">
              <PlanBadge plan={plan} />
            </div>
          </div>
          {plan === 'starter' && (
            <Link
              href="/pricing"
              className="rounded-lg bg-zero-300 px-4 py-2 text-sm font-medium text-bg-0 transition-colors hover:bg-zero-400"
            >
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Plan features */}
      <div className="rounded-xl border border-border bg-bg-1 p-4">
        <h3 className="font-medium text-text-1">Your Plan Includes</h3>
        <ul className="mt-3 space-y-2 text-sm text-text-2">
          <li className="flex items-center justify-between">
            <span>Zero Nano</span>
            <span className="font-medium text-text-1">Included</span>
          </li>
          <li className="flex items-center justify-between">
            <span>Zero Prime</span>
            <span className="font-medium text-text-1">Included</span>
          </li>
          <li className="flex items-center justify-between">
            <span>Zero Apex</span>
            <span className="font-medium text-zero-300">{plan === 'starter' ? 'Pro' : 'Included'}</span>
          </li>
          <li className="flex items-center justify-between">
            <span>Agentic Chad</span>
            <span className="font-medium text-zero-300">{plan === 'starter' ? 'Pro' : 'Included'}</span>
          </li>
        </ul>
      </div>

      {plan !== 'starter' && (
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-bg-1 p-4">
            <p className="text-sm text-text-2">Next billing date</p>
            <p className="mt-1 font-medium text-text-1">April 15, 2026</p>
          </div>

          <button className="w-full rounded-lg border border-border bg-bg-1 px-4 py-3 text-sm text-text-2 transition-colors hover:border-border-hover hover:text-text-1">
            Manage Billing
          </button>

          <button className="w-full rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400 transition-colors hover:bg-red-500/10">
            Cancel Subscription
          </button>
        </div>
      )}
    </div>
  )
}

// Reusable toggle component
function ToggleSetting({ 
  title, 
  description, 
  value, 
  onChange 
}: { 
  title: string
  description: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-bg-1 p-4">
      <div className="min-w-0 flex-1 pr-4">
        <p className="font-medium text-text-1">{title}</p>
        <p className="text-sm text-text-2">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          value ? 'bg-zero-300' : 'bg-bg-3'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            value ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  )
}
