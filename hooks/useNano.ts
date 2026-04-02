"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { type WebWorkerMLCEngine, prebuiltAppConfig } from "@mlc-ai/web-llm"

export type NanoStatus = "unavailable" | "checking" | "loading" | "ready" | "error"

export type NanoAction = "route" | "search" | "fix" | "support"
export type NanoMascotAction = "eating" | "drinking" | "idle"

export interface NanoDecision {
  action: NanoAction
  search_query: string | null
  reason: string
  cleaned_prompt: string | null
  fix_instructions: string | null
  mascot_action: NanoMascotAction
}

// ─── DUAL MODEL ARCHITECTURE ───────────────────────────────────────
// FAST (0.5B): Loads in seconds. Handles routing, quick Q&A, simple chat.
// HEAVY (3B):  Loads in background. Handles full app generation and complex code.
const FAST_MODEL = "Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC"
const HEAVY_MODEL = "Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC"

const NANO_ROUTER_PROMPT = `You are the internal traffic router for "Nano", an extremely fast local AI system.
Analyze the user message and return ONLY a pure JSON object:
{
  "action": "route" | "support" | "search",
  "reason": "short explanation",
  "search_query": null,
  "cleaned_prompt": "the user's prompt",
  "fix_instructions": null,
  "mascot_action": "eating" | "idle" | "drinking"
}
If they ask to build an app → action "route", mascot_action "eating".
If they ask to search → action "search", mascot_action "drinking".
Otherwise → action "support", mascot_action "idle".
DO NOT output any thinking, markdown, or text outside the JSON.`

const NANO_CODER_PROMPT = `You are Nano, a world-class 10x Principal Staff Engineer running locally on WebGPU. You generate fully comprehensive, production-ready, highly styled React/Tailwind apps.

CRITICAL INSTRUCTIONS:
1. THINKING: Before writing ANY code, think step-by-step silently.
2. COMPLETENESS: Output COMPLETE multi-file React+Tailwind code using \`\`\`tsx filename="App.tsx"\`\`\` format.
3. NO SHORTCUTS: NEVER use placeholders, NEVER output partial code, NEVER say "add more here".
4. UI EXCELLENCE: Use modern dark UI with gradients, shadows, micro-animations, lucide-react icons.
5. ROBUSTNESS: Include ALL imports, ALL state, ALL handlers, flawless TypeScript types.

When asked general questions, be incredibly concise, accurate, and helpful.`

const DEFAULT_DECISION: NanoDecision = {
  action: "support",
  search_query: null,
  reason: "Default fallback",
  cleaned_prompt: null,
  fix_instructions: null,
  mascot_action: "idle",
}

// ─── MODULE SINGLETONS (survive re-renders and HMR) ────────────────
let fastEngine: WebWorkerMLCEngine | null = null
let heavyEngine: WebWorkerMLCEngine | null = null
let fastLoadPromise: Promise<void> | null = null
let heavyLoadPromise: Promise<void> | null = null
let wakeLock: any = null

async function acquireWakeLock() {
  try {
    if ("wakeLock" in navigator) {
      wakeLock = await (navigator as any).wakeLock.request("screen")
      console.log("[Nano] WakeLock acquired")
    }
  } catch (_) {}
}

function dropWakeLock() {
  if (wakeLock) {
    wakeLock.release?.().catch(() => {})
    wakeLock = null
  }
}

export function useNano() {
  const [status, setStatus] = useState<NanoStatus>("checking")
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState("")
  const [currentModel, setCurrentModel] = useState<string | null>(null)
  const [heavyReady, setHeavyReady] = useState(false)
  const [lastError, setLastError] = useState<{ bug: string; fix: string } | null>(null)
  const mountedRef = useRef(true)

  // ─── LOAD FAST MODEL (0.5B) ─ ~300MB, loads in seconds ──────────
  const loadFastModel = useCallback(async () => {
    if (fastEngine) {
      if (mountedRef.current) { setStatus("ready"); setProgress(100); setCurrentModel(FAST_MODEL) }
      return
    }
    if (fastLoadPromise) {
      await fastLoadPromise
      if (mountedRef.current && fastEngine) { setStatus("ready"); setProgress(100) }
      return
    }

    if (mountedRef.current) { setStatus("loading"); setProgress(0); setStatusText("Loading Nano Fast (0.5B)…") }

    fastLoadPromise = (async () => {
      try {
        if (!(navigator as any).gpu && mountedRef.current) {
          console.warn("[Nano] WebGPU not supported! Falling back to extremely slow CPU WASM calculations.");
          setLastError({ bug: "Hardware Acceleration Disabled", fix: "WebGPU is not enabled in your browser. Nano is running on your CPU instead of your Graphics Card, which will make it incredibly slow! Try using Chrome or Edge and updating your GPU drivers."});
        }
        
        const { CreateWebWorkerMLCEngine } = await import("@mlc-ai/web-llm")
        const worker = new Worker(
          new URL("../lib/workers/nano.worker.ts", import.meta.url),
          { type: "module" }
        )

        fastEngine = await CreateWebWorkerMLCEngine(worker, FAST_MODEL, {
          initProgressCallback: (report: any) => {
            if (mountedRef.current) {
              const pct = Math.min(100, Math.round((report.progress ?? 0) * 100))
              setProgress((prev) => pct >= prev ? pct : prev)
              setStatusText(report.text ?? "")
            }
          },
          appConfig: { ...prebuiltAppConfig, useIndexedDBCache: true },
        })

        if (mountedRef.current) {
          setStatus("ready")
          setProgress(100)
          setCurrentModel(FAST_MODEL)
          console.log("[Nano] ⚡ Fast model (0.5B) ready!")
          window.dispatchEvent(new CustomEvent("nano-loaded"))
        }
      } catch (err: any) {
        console.error("[Nano] Fast model load failed:", err)
        fastEngine = null
        if (mountedRef.current) {
          setStatus("error")
          const isQuota = err?.name === "QuotaExceededError" || String(err).includes("quota") || String(err).includes("space")
          setLastError({ 
            bug: String(err), 
            fix: isQuota ? "Your hard drive is out of space! Please free up at least 3GB of disk space and try again." : "Fast model failed to load. Click 'Clear & Retry'." 
          })
        }
      }
    })()

    await fastLoadPromise
  }, [])

  // ─── LOAD HEAVY MODEL (3B) ─ ~2GB, loads silently in background ─
  const loadHeavyModel = useCallback(async () => {
    if (heavyEngine) {
      if (mountedRef.current) setHeavyReady(true)
      return
    }
    if (heavyLoadPromise) {
      await heavyLoadPromise
      return
    }

    console.log("[Nano] 🔄 Starting background download of Heavy model (3B)...")
    await acquireWakeLock()

    heavyLoadPromise = (async () => {
      try {
        const { CreateWebWorkerMLCEngine } = await import("@mlc-ai/web-llm")
        const worker = new Worker(
          new URL("../lib/workers/nano.worker.ts", import.meta.url),
          { type: "module" }
        )

        heavyEngine = await CreateWebWorkerMLCEngine(worker, HEAVY_MODEL, {
          initProgressCallback: (report: any) => {
            // Don't hijack the main progress bar — this runs silently
            if (report.text) console.log("[Nano 3B]", report.text)
          },
          appConfig: { ...prebuiltAppConfig, useIndexedDBCache: true },
        })

        dropWakeLock()
        if (mountedRef.current) {
          setHeavyReady(true)
          setCurrentModel(HEAVY_MODEL)
          console.log("[Nano] 🚀 Heavy model (3B) ready!")
        }
      } catch (err: any) {
        const isQuota = err?.name === "QuotaExceededError" || String(err).includes("quota") || String(err).includes("space")
        console.warn(`[Nano] Heavy model load failed (non-fatal)${isQuota ? ' due to out of disk space' : ''}:`, err)
        dropWakeLock()
        heavyEngine = null
      }
    })()

    await heavyLoadPromise
  }, [])

  // ─── REPAIR: nuke all caches and reload ──────────────────────────
  const repairAndRetry = useCallback(async () => {
    fastEngine = null
    heavyEngine = null
    fastLoadPromise = null
    heavyLoadPromise = null
    if (mountedRef.current) { setStatus("checking"); setProgress(0); setLastError(null); setHeavyReady(false) }

    try {
      const keys = await caches.keys()
      await Promise.all(keys.filter(k => k.toLowerCase().includes("webllm")).map(k => caches.delete(k)))
      const dbs = await indexedDB.databases?.() ?? []
      dbs.filter(d => d.name?.toLowerCase().includes("webllm")).forEach(d => d.name && indexedDB.deleteDatabase(d.name))
      console.log("[Nano] Full cache wipe complete")
    } catch (e) { console.warn("[Nano] Cache wipe error:", e) }

    loadFastModel()
  }, [loadFastModel])

  // ─── BOOT SEQUENCE ───────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true

    // Step 1: Load 0.5B instantly → user can chat immediately
    loadFastModel().then(() => {
      // Step 2: Once fast model is live, silently start downloading 3B in background
      if (mountedRef.current) loadHeavyModel()
    })

    return () => { mountedRef.current = false; dropWakeLock() }
  }, [loadFastModel, loadHeavyModel])

  // ─── ROUTER (always uses fast 0.5B for speed) ───────────────────
  const route = useCallback(async (userPrompt: string): Promise<NanoDecision> => {
    const engine = fastEngine
    if (!engine) return DEFAULT_DECISION
    try {
      const reply = await engine.chat.completions.create({
        messages: [
          { role: "system", content: NANO_ROUTER_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 200,
        stream: false,
      })
      const text = reply.choices?.[0]?.message?.content ?? ""
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) return { ...DEFAULT_DECISION, ...JSON.parse(jsonMatch[0]) }
    } catch (e) {
      console.warn("[Nano] Router error:", e)
    }
    return DEFAULT_DECISION
  }, [])

  // ─── CHAT (uses 3B if ready, falls back to 0.5B) ───────────────
  const chat = useCallback(async (
    messages: { role: "user" | "assistant" | "system"; content: string }[]
  ): Promise<ReadableStream<Uint8Array> | null> => {
    // Pick the best available engine
    const engine = heavyEngine || fastEngine
    if (!engine) return null

    const modelName = heavyEngine ? "3B" : "0.5B"
    console.log(`[Nano] Generating with ${modelName} model`)

    const encoder = new TextEncoder()
    return new ReadableStream({
      async start(controller) {
        try {
          let stream;
          try {
            stream = await engine.chat.completions.create({
              messages: [{ role: "system", content: NANO_CODER_PROMPT }, ...messages],
              temperature: 0.7,
              max_tokens: 4096,
              stream: true,
            })
          } catch (err: any) {
            if (engine === heavyEngine && String(err).includes('ModelNotLoadedError')) {
              console.warn("[Nano] Heavy model failed to load into GPU (ModelNotLoadedError). Falling back to Fast model...", err);
              if (!fastEngine) throw err;
              stream = await fastEngine.chat.completions.create({
                messages: [{ role: "system", content: NANO_CODER_PROMPT }, ...messages],
                temperature: 0.7,
                max_tokens: 4096,
                stream: true,
              })
            } else {
              throw err;
            }
          }
          
          for await (const chunk of stream as any) {
            const token = chunk.choices?.[0]?.delta?.content ?? ""
            if (token) controller.enqueue(encoder.encode(token))
          }
        } catch (e) {
          console.error("[Nano] Chat stream error:", e)
        } finally {
          controller.close()
        }
      },
    })
  }, [])

  return {
    status,
    progress,
    statusText,
    currentModel,
    heavyReady,
    isReady: status === "ready",
    lastError,
    clearError: () => setLastError(null),
    repairAndRetry,
    forceDownload: loadFastModel,
    route,
    chat,
  }
}
