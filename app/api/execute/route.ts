import { createContext, runInContext } from "node:vm"

export const runtime = "nodejs"
export const maxDuration = 30

const BLOCKED_PATTERNS = [
  /require\s*\(\s*['"`]fs['"`]\s*\)/,
  /require\s*\(\s*['"`]child_process['"`]\s*\)/,
  /require\s*\(\s*['"`]path['"`]\s*\)/,
  /require\s*\(\s*['"`]os['"`]\s*\)/,
  /require\s*\(\s*['"`]net['"`]\s*\)/,
  /require\s*\(\s*['"`]http['"`]\s*\)/,
  /require\s*\(\s*['"`]https['"`]\s*\)/,
  /process\.exit/,
  /process\.env/,
  /global\./,
  /globalThis\./,
  /__dirname/,
  /__filename/,
]

function checkBlocked(code: string): string | null {
  for (const p of BLOCKED_PATTERNS) {
    if (p.test(code)) {
      return `Forbidden: dangerous pattern detected — sandboxed execution does not allow system access`
    }
  }
  return null
}

function safeStr(val: unknown): string {
  if (typeof val === "string") return val
  if (val === null) return "null"
  if (val === undefined) return "undefined"
  try { return JSON.stringify(val, null, 2) } catch { return String(val) }
}

export async function POST(req: Request) {
  try {
    const { code, language = "javascript" } = await req.json() as {
      code?: string
      language?: string
    }

    if (!code?.trim()) {
      return Response.json({ error: "code is required" }, { status: 400 })
    }

    const blockReason = checkBlocked(code)
    if (blockReason) {
      return Response.json({ error: blockReason }, { status: 400 })
    }

    const output: string[] = []
    const t0 = Date.now()

    const mockConsole = {
      log: (...args: unknown[]) => output.push(args.map(safeStr).join(" ")),
      warn: (...args: unknown[]) => output.push("[warn] " + args.map(safeStr).join(" ")),
      error: (...args: unknown[]) => output.push("[error] " + args.map(safeStr).join(" ")),
      info: (...args: unknown[]) => output.push("[info] " + args.map(safeStr).join(" ")),
      table: (data: unknown) => output.push(JSON.stringify(data, null, 2)),
    }

    const sandbox: Record<string, unknown> = {
      console: mockConsole,
      Math, JSON, Array, Object, String, Number, Boolean, Date,
      Error, Map, Set, Promise, RegExp, Symbol,
      parseInt, parseFloat, isNaN, isFinite,
      encodeURIComponent, decodeURIComponent,
      setTimeout: (fn: () => void, ms: number) => { if (ms < 2000 && typeof fn === "function") setTimeout(fn, ms) },
    }

    try {
      const ctx = createContext(sandbox)
      const result = runInContext(code, ctx, {
        timeout: 9500,
        filename: "sandbox.js",
        displayErrors: true,
      })

      if (result !== undefined && result !== null) {
        const str = safeStr(result)
        if (str !== "undefined" && !output.some(o => o.slice(0, 30) === str.slice(0, 30))) {
          output.push("→ " + str)
        }
      }
    } catch (execErr: unknown) {
      const msg = execErr instanceof Error ? execErr.message : String(execErr)
      return Response.json({
        output,
        error: msg,
        executionTime: Date.now() - t0,
      })
    }

    return Response.json({
      output,
      error: null,
      executionTime: Date.now() - t0,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error"
    return Response.json({ error: msg }, { status: 500 })
  }
}
