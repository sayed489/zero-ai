import { ChatBox } from '@/components/chat/chat-box'

export const metadata = {
  title: 'Demo - Zero AI Chat Box',
  description: 'Demo of the compact Zero AI chat box',
}

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-bg-0 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-text-1 mb-4">Zero AI Chat Box Demo</h1>
        <p className="text-text-2 mb-8">
          This page demonstrates the compact chat box widget. Click the chat button in the bottom-right corner to open it.
        </p>
        
        <div className="rounded-2xl border border-border bg-bg-1 p-8">
          <h2 className="text-xl font-semibold text-text-1 mb-4">Features</h2>
          <ul className="space-y-2 text-text-2">
            <li>- Compact floating chat widget</li>
            <li>- Minimizable and expandable</li>
            <li>- Full chat history persistence</li>
            <li>- All AI models supported</li>
            <li>- Voice input support</li>
            <li>- Skills and quick actions</li>
          </ul>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-bg-1 p-8">
          <h2 className="text-xl font-semibold text-text-1 mb-4">Usage</h2>
          <pre className="rounded-lg bg-bg-2 p-4 text-sm text-text-1 overflow-x-auto">
{`import { ChatBox } from '@/components/chat/chat-box'

// Default (bottom-right corner)
<ChatBox />

// Bottom-left corner
<ChatBox position="bottom-left" />

// Start opened
<ChatBox defaultOpen />`}
          </pre>
        </div>
      </div>

      {/* Compact Chat Box Widget */}
      <ChatBox />
    </div>
  )
}
