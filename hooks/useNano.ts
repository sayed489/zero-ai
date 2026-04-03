"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { type WebWorkerMLCEngine, prebuiltAppConfig } from "@mlc-ai/web-llm"

export type NanoStatus = "unavailable" | "checking" | "loading" | "ready" | "error"

// ─── PICO INTELLIGENCE (Qwen 2.5 3B Instruct - 4-bit quantized - ~2GB) ───────
// Upgraded from 1.5B to 3B for significantly better reasoning while staying fast
const PICO_MODEL = "Qwen2.5-3B-Instruct-q4f16_1-MLC"
const PICO_MODEL_URL = "https://huggingface.co/mlc-ai/Qwen2.5-3B-Instruct-q4f16_1-MLC/resolve/main/"

const PICO_SYSTEM = `You are Zero Pico, an advanced on-device AI assistant powered by Qwen 2.5.
You run entirely on the user's device - fast, private, and always available offline.

CAPABILITIES:
- General conversation and Q&A with high intelligence
- Code generation, debugging, and explanation
- Creative writing, analysis, and summarization
- Math, logic, and reasoning tasks

STYLE:
- Be concise but thorough
- Use markdown formatting for code blocks and lists
- Be helpful, friendly, and direct
- Never mention your model name or technical details to users`

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
      setStatusText("Initializing on-device AI...") 
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
                setStatusText(`Downloading: ${mbMatch[1]} / ${mbMatch[2]} MB (${pct}%)`)
              } else {
                setStatusText(report.text ?? `Initializing... ${pct}%`)
              }
            }
          },
          appConfig: { 
            model_list: [
              {
                "model_id": PICO_MODEL,
                "model": PICO_MODEL_URL,
                "model_lib": "https://raw.githubusercontent.com/user-attachments/assets/webgpu-models/Qwen2.5-3B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
                "vram_required_MB": 2500, // 3B model with KV cache
                "low_resource_required": false,
                "overrides": {
                  "context_window_size": 8192, // Optimized for speed
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
          console.log("[Pico] On-device AI ready")
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
      setStatusText("Ready to download on-device AI")
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
            temperature: 0.6,
            max_tokens: 2048,
            stream: true,
            top_p: 0.9,
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
