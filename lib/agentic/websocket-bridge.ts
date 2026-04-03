// WebSocket bridge to Python local agent running at ws://localhost:7821
// Handles tool dispatching, reconnect logic, and result routing

type ToolResult = {
  requestId: string
  result: any
  error?: string
  screenshot?: string // base64 PNG
}

type PendingRequest = {
  resolve: (r: ToolResult) => void
  reject: (e: Error) => void
  timer: ReturnType<typeof setTimeout>
}

class WebSocketBridge {
  private ws: WebSocket | null = null
  private pending = new Map<string, PendingRequest>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private _connected = false

  readonly url = process.env.NEXT_PUBLIC_AGENT_WS_URL ?? "ws://localhost:7821"

  connect() {
    if (typeof window === "undefined") return // SSR guard
    if (this.ws?.readyState === WebSocket.OPEN) return

    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        this._connected = true
        console.log("[Zero Agent] Connected")
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
      }

      this.ws.onmessage = (event) => {
        try {
          const msg: ToolResult = JSON.parse(event.data)
          const pending = this.pending.get(msg.requestId)
          if (pending) {
            clearTimeout(pending.timer)
            this.pending.delete(msg.requestId)
            pending.resolve(msg)
          }
        } catch (e) {
          console.error("[Zero Agent] Parse error:", e)
        }
      }

      this.ws.onclose = () => {
        this._connected = false
        console.log("[Zero Agent] Disconnected — reconnecting in 3s…")
        this.scheduleReconnect()
      }

      this.ws.onerror = () => {
        this._connected = false
        this.ws?.close()
      }
    } catch (e) {
      this._connected = false
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.reconnectTimer = setTimeout(() => this.connect(), 3000)
  }

  isConnected(): boolean {
    return this._connected && this.ws?.readyState === WebSocket.OPEN
  }

  sendTool(tool: string, parameters: Record<string, any>): Promise<ToolResult> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        return reject(new Error("Python agent not connected. Please start the Zero Agent."))
      }

      const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const payload = JSON.stringify({ tool, parameters, requestId })

      const timer = setTimeout(() => {
        this.pending.delete(requestId)
        reject(new Error(`Tool timeout: ${tool} took over 30s`))
      }, 30000)

      this.pending.set(requestId, { resolve, reject, timer })
      this.ws!.send(payload)
    })
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws?.close()
    this.ws = null
    this._connected = false
  }
}

// Singleton export — instantiated client-side only
export const agentBridge = typeof window !== "undefined" ? new WebSocketBridge() : null
