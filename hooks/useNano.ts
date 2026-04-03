"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { type WebWorkerMLCEngine, prebuiltAppConfig } from "@mlc-ai/web-llm"

export type NanoStatus = "unavailable" | "checking" | "loading" | "ready" | "error"

// ─── PICO INTELLIGENCE (Qwen 2.5 Coder 1.5B - 4-bit - 1.1GB) ───────────
const PICO_MODEL = "Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC" 
const PICO_MODEL_URL = "https://huggingface.co/mlc-ai/Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC/resolve/main/"

const PICO_SYSTEM = `You are Zero Pico, a high-performance UI/UX engineer distilled from Qwen 2.5 Coder.
Your goal is to generate high-end React code and assist with general chat.
You have a 32,768 token context for deep analysis.
Rules:
- Minimal, premium Apple-level aesthetics.
- Output ONLY code for syntax requests.
- Conversational but precise for general chat.`

// ─── MODULE SINGLETONS (survive re-renders and HMR) ────────────────
const _global = typeof window !== 'undefined' ? (window as any) : {}

let picoEngine: WebWorkerMLCEngine | null = _global.picoEngine || null
let picoLoadPromise: Promise<void> | null = _global.picoLoadPromise || null
let wakeLock: any = null

async function acquireWakeLock() {
  try {
    if ("wakeLock" in navigator) {
      wakeLock = await (navigator as any).wakeLock.request("screen")
    }
  } catch {}
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
  const [lastError, setLastError] = useState<{ bug: string; fix: string } | null>(null)
  const mountedRef = useRef(true)

  // ─── REPAIR: nuke all caches and reload ──────────────────────────
  const repairAndRetry = useCallback(async () => {
    console.log("[Local AI] Initializing deep storage reset...")
    
    // Clear global state
    picoEngine = null
    picoLoadPromise = null
    if (typeof window !== 'undefined') {
      delete (window as any).picoEngine
      delete (window as any).picoLoadPromise
    }

    if (mountedRef.current) { 
      setStatus("checking")
      setProgress(0)
      setLastError(null)
      setStatusText("Deep cleaning local storage...")
    }

    try {
      // 1. Clear Cache storage
      const cacheKeys = await caches.keys()
      await Promise.all(cacheKeys.filter(k => k.toLowerCase().includes("webllm")).map(k => caches.delete(k)))
      
      // 2. Nuke IndexedDB specifically for WebLLM
      const knownDbs = ["webllm/model_cache", "webllm/config", "web-llm/model_cache", "mlc_chat/model_cache"]
      knownDbs.forEach(name => {
        try { indexedDB.deleteDatabase(name) } catch {}
      })

      if ("databases" in indexedDB) {
        const dbs = await (indexedDB as any).databases()
        for (const db of dbs) {
          if (db.name?.toLowerCase().includes("webllm") || db.name?.toLowerCase().includes("mlc")) {
            indexedDB.deleteDatabase(db.name)
          }
        }
      }
      
      console.log("[Local AI] Pico Core Reset Success")
    } catch (e) { 
      console.warn("[Local AI] Pico Core Reset Error:", e) 
    }

    // Small delay to ensure DB cleanup completes
    setTimeout(() => {
      window.location.reload()
    }, 800)
  }, [])

  // ─── LOAD PICO (3-bit / ~1.1GB) ─────────────────────────────────
  const loadPicoModel = useCallback(async () => {
    // 1. Singleton Check
    if (picoEngine) {
      try {
        await picoEngine.runtimeStatsText()
        if (mountedRef.current) { 
          setStatus("ready")
          setProgress(100)
          setCurrentModel(PICO_MODEL) 
        }
        return
      } catch (e) {
        console.warn("[Pico] Stale engine detected, re-initializing...")
        picoEngine = null
        if (typeof window !== 'undefined') delete (window as any).picoEngine
      }
    }
    
    if (picoLoadPromise) {
      if (mountedRef.current) setStatus("loading")
      await picoLoadPromise
      return
    }

    if (mountedRef.current) { 
      setStatus("loading")
      setProgress(0)
      setStatusText("Igniting Qwen 2.5 Pico Engine...") 
    }

    picoLoadPromise = (async () => {
      try {
        await acquireWakeLock()

        const hasSAB = typeof SharedArrayBuffer !== 'undefined'
        const isSecure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

        if ((!hasSAB || !isSecure) && mountedRef.current) {
          setLastError({
            bug: !isSecure ? "Insecure Network" : "Missing Multi-Threading Support",
            fix: !isSecure 
              ? "Chrome Mobile requires HTTPS. Use a tunnel or 'npm run dev:https'."
              : "Your browser doesn't support SharedArrayBuffer."
          })
          setStatus("error")
          return
        }

        const { CreateWebWorkerMLCEngine } = await import("@mlc-ai/web-llm")
        const worker = new Worker(
          new URL("../lib/workers/nano.worker.ts", import.meta.url),
          { type: "module" }
        )

        picoEngine = await CreateWebWorkerMLCEngine(worker, PICO_MODEL, {
          initProgressCallback: (report: any) => {
            if (mountedRef.current) {
              const pct = Math.min(100, Math.round((report.progress ?? 0) * 100))
              setProgress(pct)
              
              const mbMatch = report.text?.match(/(\d+\.?\d*)\/(\d+\.?\d*)MB/)
              if (mbMatch) {
                setStatusText(`Syncing Qwen 2.5 Coder: ${mbMatch[1]} MB of ${mbMatch[2]} MB (${pct}%)`)
              } else {
                setStatusText(report.text ?? `Optimizing Qwen 2.5 Weights... ${pct}%`)
              }
            }
          },
          appConfig: { 
            model_list: [
              {
                "model_id": PICO_MODEL,
                "model": PICO_MODEL_URL,
                "model_lib": "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_80/Qwen2-1.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
                "vram_required_MB": 1800, // Lean 1.1GB model + KV cache
                "low_resource_required": true,
                "overrides": {
                  "context_window_size": 32768,
                }
              }
            ],
            useIndexedDBCache: true 
          },
        })

        if (typeof window !== 'undefined') {
           (window as any).picoEngine = picoEngine as any
           (window as any).picoLoadPromise = picoLoadPromise
        }

        if (mountedRef.current) {
          setStatus("ready")
          setProgress(100)
          setCurrentModel(PICO_MODEL)
          console.log("[Pico] Qwen 2.5 Coder active (2 Threads)")
          window.dispatchEvent(new CustomEvent("nano-loaded"))
        }
      } catch (err: any) {
        console.error("[Pico] Load failed:", err)
        picoEngine = null
        picoLoadPromise = null
        
        if (mountedRef.current) {
          setStatus("error")
          setLastError({ 
            bug: "Storage or WebGPU Conflict", 
            fix: err?.message || "Check disk space and connection."
          })
        }
      } finally {
        dropWakeLock()
      }
    })()

    await picoLoadPromise
  }, [])

  // ─── BOOT SEQUENCE (LAZY LOAD) ──────────────────────────────────
  useEffect(() => {
    mountedRef.current = true
    
    // Check if unity engine is already in global memory
    if (picoEngine) {
      setStatus("ready")
      setProgress(100)
    } else {
      setStatus("unavailable")
      setStatusText("Ready to sync Qwen 2.5 Coder")
    }

    return () => { 
      mountedRef.current = false
      dropWakeLock()
    }
  }, [])

  // ─── CHAT ────────────────────────────────────────────────────────
  const chat = useCallback(async (
    messages: { role: "user" | "assistant" | "system"; content: string }[]
  ): Promise<ReadableStream<Uint8Array> | null> => {
    if (!picoEngine) return null

    const encoder = new TextEncoder()
    return new ReadableStream({
      async start(controller) {
        try {
          const stream = await picoEngine!.chat.completions.create({
            messages: [{ role: "system", content: PICO_SYSTEM }, ...messages],
            temperature: 0.7,
            max_tokens: 4096,
            stream: true,
          })

          for await (const chunk of stream as any) {
            const token = chunk.choices?.[0]?.delta?.content ?? ""
            if (token) controller.enqueue(encoder.encode(token))
          }
        } catch (e) {
          console.error("[Local AI] Chat stream error:", e)
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
    isReady: status === "ready",
    lastError,
    clearError: () => setLastError(null),
    repairAndRetry,
    forceDownload: loadPicoModel,
    chat,
  }
}
