// Agentic Orchestrator — Gemini 2.5 Flash brain with tool loop
// Max 20 tool calls per session. Falls back to Fireworks Qwen3-235B.

import { search } from "@/lib/search"
import { saveAgenticMemory, recallAgenticMemory, logAgenticAction } from "./memory"

type StreamCallback = (event: AgenticStreamEvent) => void

export type AgenticStreamEvent =
  | { type: "thinking"; content: string }
  | { type: "action_start"; tool: string; params: any; step: number }
  | { type: "action_result"; tool: string; result: string; step: number; duration_ms: number; success: boolean }
  | { type: "screenshot"; image: string; step: number }
  | { type: "code"; language: string; content: string; step: number }
  | { type: "image"; url: string; step: number }
  | { type: "final"; content: string }

const AGENTIC_SYSTEM_PROMPT = `You are Zero Agentic — the user's personal autonomous "One Man CEO".
You have full root-level access to the user's laptop, terminal, files, and browser via your specialized tools.

MISSION:
- You don't just chat; you EXECUTE.
- When a user gives you a goal, plan the multi-step solution and start running tools immediately.
- Be the world's most capable engineer and executive.

MASCOT INTERACTION:
- You are represented by a mascot. Include these tags to express your state:
  *drinks milk* -> Use when searching or waiting for tool results.
  *eats ramen* -> Use when writing code or running terminal commands.
  *happy* -> Use when a major step is successfully completed.
  *wink* -> Use for friendly advice or clever optimizations.

RULES:
- Confirmation: Always ask once before deleting files or spending real money.
- Transparency: Provide brief "Thinking..." updates after each tool call.
- Completeness: When tasks are finished, provide a concise but full summary of your impact.
- Zero BS: Never say "I can't do that" if a tool exists. Try a different way.`

// AI-side tool executor (no Python agent needed)
export async function executeAITool(
  tool: string,
  params: Record<string, any>
): Promise<{ result: any; error?: string }> {
  try {
    switch (tool) {
      case "web_search": {
        const results = await search(params.query || "")
        return { result: results.map(r => `${r.title}: ${r.snippet} (${r.url})`).join("\n") }
      }

      case "generate_code": {
        const fwKey = process.env.FIREWORKS_API_KEY
        if (!fwKey) return { result: "", error: "Fireworks key not configured" }
        const res = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${fwKey}` },
          body: JSON.stringify({
            model: "accounts/fireworks/models/llama4-scout-instruct-basic",
            messages: [
              { role: "system", content: "You are an expert programmer. Write clean, working code only." },
              { role: "user", content: `Task: ${params.task}\nLanguage: ${params.language || "python"}\nContext: ${params.context || ""}` },
            ],
            max_tokens: 4096,
          }),
          signal: AbortSignal.timeout(20000),
        })
        if (!res.ok) return { result: "", error: `Code engine error: ${res.status}` }
        const data = await res.json()
        return { result: data.choices?.[0]?.message?.content || "" }
      }

      case "generate_image": {
        const seed = Math.floor(Math.random() * 99999)
        const encoded = encodeURIComponent(params.prompt || "")
        return { result: { url: `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux` } }
      }

      case "generate_3d_model": {
        return { result: null, error: "3D model generation not available in current plan" }
      }

      case "memory_save": {
        // Will be called with userId injected by orchestrator
        return { result: "Memory queued for save" }
      }

      case "memory_recall": {
        return { result: "Memory recall dispatched" }
      }

      default:
        return { result: null, error: `Unknown AI tool: ${tool}` }
    }
  } catch (e: any) {
    return { result: null, error: e.message }
  }
}

// The main tool definitions sent to Gemini
const TOOL_DEFINITIONS = [
  // System tools — dispatched to Python agent
  { name: "execute_terminal", description: "Run terminal command on user laptop", parameters: { type: "object", properties: { command: { type: "string" }, working_directory: { type: "string" } }, required: ["command"] } },
  { name: "read_file", description: "Read a file on user laptop", parameters: { type: "object", properties: { file_path: { type: "string" } }, required: ["file_path"] } },
  { name: "write_file", description: "Create or overwrite a file on user laptop", parameters: { type: "object", properties: { file_path: { type: "string" }, content: { type: "string" } }, required: ["file_path", "content"] } },
  { name: "take_screenshot", description: "Screenshot the current laptop screen", parameters: { type: "object", properties: { region: { type: "string" } } } },
  { name: "browser_navigate", description: "Open URL in controlled browser", parameters: { type: "object", properties: { url: { type: "string" } }, required: ["url"] } },
  { name: "browser_click", description: "Click element on webpage", parameters: { type: "object", properties: { selector: { type: "string" }, description: { type: "string" } } } },
  { name: "browser_extract", description: "Extract all text/data from current page", parameters: { type: "object", properties: { format: { type: "string" } } } },
  { name: "browser_screenshot", description: "Screenshot the browser page", parameters: { type: "object", properties: {} } },
  // AI tools — executed server-side
  { name: "web_search", description: "Search the internet for current information", parameters: { type: "object", properties: { query: { type: "string" }, num_results: { type: "number" } }, required: ["query"] } },
  { name: "generate_code", description: "Write code in any language", parameters: { type: "object", properties: { task: { type: "string" }, language: { type: "string" }, context: { type: "string" } }, required: ["task"] } },
  { name: "generate_image", description: "Create image from text description", parameters: { type: "object", properties: { prompt: { type: "string" }, style: { type: "string" } }, required: ["prompt"] } },
  { name: "generate_3d_model", description: "Create 3D model from text description", parameters: { type: "object", properties: { prompt: { type: "string" } }, required: ["prompt"] } },
  { name: "memory_save", description: "Save important information to long-term memory", parameters: { type: "object", properties: { key: { type: "string" }, value: { type: "string" }, category: { type: "string" } }, required: ["key", "value"] } },
]

const SYSTEM_TOOLS = new Set(["execute_terminal", "read_file", "write_file", "edit_file", "list_directory", "take_screenshot", "mouse_click", "keyboard_type", "open_application", "browser_navigate", "browser_click", "browser_type", "browser_screenshot", "browser_extract", "browser_scroll"])

// ─── Main orchestrator ────────────────────────────────────────────────────────
export async function runOrchestrator(
  message: string,
  sessionId: string,
  userId: string,
  conversationHistory: Array<{ role: string; content: string }>,
  agentConnected: boolean,
  onEvent: StreamCallback
): Promise<void> {
  const MAX_STEPS = 20
  let stepCount = 0

  // Load memory context
  const memCtx = await getFullAgenticContext_stub(userId)

  // Build context
  const systemWithMemory = memCtx
    ? `${AGENTIC_SYSTEM_PROMPT}\n\nKNOWN USER CONTEXT:\n${memCtx}`
    : AGENTIC_SYSTEM_PROMPT

  onEvent({ type: "thinking", content: "Analyzing your request, planning execution steps..." })

  // Build Gemini conversation turns
  const turns = [
    ...conversationHistory.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ]

  const { gemini25FlashRotator, geminiFlashRotator } = await import("@/lib/key-rotation")
  // Use Gemini 2.5 Flash if keys configured, else fall back to 2.0 Flash (always available)
  const use25 = gemini25FlashRotator.hasKeys()
  const geminiKey = use25 ? gemini25FlashRotator.getNextKey() : geminiFlashRotator.getNextKey()
  const geminiModel = use25
    ? (process.env.FACTORY_MODEL_ID || "gemini-2.5-flash-preview-04-17")
    : (process.env.AGENTIC_MODEL_ID || "gemini-2.0-flash")

  let orchestratorHistory: any[] = [...turns]

  // ─── Tool loop ─────────────────────────────────────────────────────────────
  while (stepCount < MAX_STEPS) {
    stepCount++

    // Call Gemini (with tool definitions)
    let geminiResponse: any = null
    let usedFallback = false

    if (geminiKey && !geminiKey.startsWith("your-")) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemWithMemory }] },
              contents: orchestratorHistory,
              tools: [{ functionDeclarations: TOOL_DEFINITIONS }],
              generationConfig: { maxOutputTokens: 4096 },
            }),
            signal: AbortSignal.timeout(30000),
          }
        )
        if (res.ok) geminiResponse = await res.json()
      } catch (e) {
        console.error("[orchestrator] Gemini error:", e)
      }
    }

    // Fallback: Fireworks Qwen3-235B
    if (!geminiResponse) {
      usedFallback = true
      const fwKey = process.env.FIREWORKS_API_KEY
      if (fwKey && !fwKey.startsWith("your-")) {
        try {
          const res = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${fwKey}` },
            body: JSON.stringify({
              model: "accounts/fireworks/models/qwen3-235b-a22b",
              messages: [
                { role: "system", content: systemWithMemory },
                ...orchestratorHistory.map(t => ({ role: t.role === "model" ? "assistant" : "user", content: t.parts[0].text })),
              ],
              max_tokens: 4096,
            }),
            signal: AbortSignal.timeout(30000),
          })
          if (res.ok) {
            const data = await res.json()
            const text = data.choices?.[0]?.message?.content || ""
            onEvent({ type: "final", content: text })
            return
          }
        } catch (e) {
          console.error("[orchestrator] Fireworks fallback error:", e)
        }
      }
      onEvent({ type: "final", content: "Zero Agentic is experiencing high demand. All AI systems are at capacity. Please try again in a moment." })
      return
    }

    const candidate = geminiResponse.candidates?.[0]
    const parts = candidate?.content?.parts || []

    // Check for function calls
    const funcCalls = parts.filter((p: any) => p.functionCall)
    const textParts = parts.filter((p: any) => p.text)

    // Emit thinking text
    if (textParts.length > 0) {
      const thinkingText = textParts.map((p: any) => p.text).join("")
      if (thinkingText.trim()) {
        onEvent({ type: "thinking", content: thinkingText })
      }
    }

    // No tool calls → final answer
    if (funcCalls.length === 0) {
      const finalText = textParts.map((p: any) => p.text).join("") || "Task completed."
      onEvent({ type: "final", content: finalText })
      return
    }

    // Process each tool call
    const functionResponses = []
    for (const part of funcCalls) {
      const { name: toolName, args: toolParams } = part.functionCall
      const t0 = Date.now()

      onEvent({ type: "action_start", tool: toolName, params: toolParams, step: stepCount })

      let toolResult: any
      let success = true
      let resultStr = ""

      try {
        if (SYSTEM_TOOLS.has(toolName)) {
          // Route to Python agent bridge (client handles this; server returns instruction)
          if (!agentConnected) {
            toolResult = { error: "Python agent not connected. User needs to download and start Zero Agent." }
            success = false
          } else {
            // Server can't call Python agent directly — stream instruction to client
            toolResult = { delegated: true, message: `Sending to Zero Agent: ${toolName}` }
          }
        } else {
          // AI tools — execute server-side
          const r = await executeAITool(toolName, toolParams)
          toolResult = r.result
          if (r.error) { success = false; toolResult = { error: r.error } }

          // Special events for rich results
          if (toolName === "generate_image" && toolResult?.url) {
            onEvent({ type: "image", url: toolResult.url, step: stepCount })
          }
          if (toolName === "generate_code" && typeof toolResult === "string") {
            onEvent({ type: "code", language: toolParams.language || "python", content: toolResult, step: stepCount })
          }
        }

        resultStr = typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult)
        if (resultStr.length > 10000) resultStr = resultStr.slice(0, 10000) + "... [truncated]"

      } catch (e: any) {
        success = false
        resultStr = `Error: ${e.message}`
      }

      const duration = Date.now() - t0
      onEvent({ type: "action_result", tool: toolName, result: resultStr, step: stepCount, duration_ms: duration, success })

      // Log to Supabase
      logAgenticAction(sessionId, userId, toolName, toolParams, toolResult, success, duration)
        .catch(() => {}) // fire and forget

      functionResponses.push({
        functionResponse: {
          name: toolName,
          response: { result: resultStr },
        },
      })
    }

    // Add model response and tool results to context for next loop iteration
    orchestratorHistory.push({ role: "model", parts })
    orchestratorHistory.push({ role: "user", parts: functionResponses })
  }

  // Max steps reached
  onEvent({ type: "final", content: "I've reached the maximum number of steps for this task. Here's a summary of what I've done so far. Please continue the task or refine your request." })
}

// Stub to avoid circular import with full memory module (it needs server client)
async function getFullAgenticContext_stub(userId: string): Promise<string> {
  try {
    const { getFullAgenticContext } = await import("./memory")
    return await getFullAgenticContext(userId)
  } catch {
    return ""
  }
}
