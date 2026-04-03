import { streamWithFallback } from "@/lib/providers/router"
import { detectIntent } from "@/lib/intent"
import { checkRateLimit, canAccessTier } from "@/lib/rateLimit"
import { getMemories, extractMemoriesBackground } from "@/lib/memory"
import { search } from "@/lib/search"
import { generateImage } from "@/lib/imageGen"

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const { messages, tier, userId, plan, skill } = await req.json()

    // ── Pico is fully client-side — bounce back ───────────────────────────
    if (tier === "pico") {
      return Response.json({
        type: "pico",
        message: "Pico runs locally on your device via WebLLM. No server needed.",
      })
    }

    // ── Tier access check (Free=Pico/Nano/Prime, Pro=+Apex, Ultra=+Agentic) ─
    const userPlan = plan || "starter"
    if (!canAccessTier(userPlan, tier || "nano")) {
      const tierName = tier === "apex" ? "Zero Apex" : "Agentic Chad"
      const requiredPlan = tier === "apex" ? "Pro" : "Ultra"
      return Response.json(
        { error: `${tierName} requires ${requiredPlan} plan. Upgrade to access.`, upgrade: true },
        { status: 403 }
      )
    }

    // ── Rate limit check ───────────────────────────────────────────────────
    const rateLimitType = tier === "apex" ? "apex" : tier === "agentic-chad" ? "agentic" : "chat"
    const rl = await checkRateLimit(userId || "anonymous", userPlan, rateLimitType)
    if (!rl.allowed) {
      return Response.json(
        { error: "Daily limit reached", remaining: 0, resetAt: rl.resetAt, upgrade: true },
        { status: 429 }
      )
    }

    const lastMessage = messages?.[messages.length - 1]?.content as string || ""
    const intent = detectIntent(lastMessage)

    // ── Image generation ──────────────────────────────────────────────────
    if (intent.isImageGen) {
      const result = await generateImage(intent.imagePrompt || lastMessage)
      return Response.json({ type: "image", url: result.url, provider: result.provider })
    }

    // ── Memory context ─────────────────────────────────────────────────────
    const memories = userId ? await getMemories(userId, lastMessage) : []
    const memoryContext =
      memories.length > 0
        ? `User context (remember these facts): ${memories.join(". ")}.`
        : ""

    // ── Web search context ─────────────────────────────────────────────────
    let searchContext = ""
    let searchResults: any[] = []
    if (intent.isSearch) {
      searchResults = await search(intent.searchQuery || lastMessage)
      if (searchResults.length > 0) {
        searchContext = `\n\nCurrent information from web:\n${searchResults
          .map((r) => `- ${r.title}: ${r.snippet} (${r.url})`)
          .join("\n")}\nUse this information in your response.`
      }
    }

    // ── App Factory context ────────────────────────────────────────────────
    let appFactoryContext = ""
    if (intent.isAppFactory) {
      appFactoryContext = `
You are an expert React UI Architect building a premium web application.
Output code in multi-file React architecture wrapped in markdown blocks:
\`\`\`tsx filename="App.tsx"
export default function App() { ... }
\`\`\`
RULES:
1. Always provide at least an "App.tsx"
2. Break complex UIs into smaller components (e.g. filename="components/Header.tsx")
3. Use Tailwind CSS extensively — dark-mode, glassmorphism, premium look
4. Use Lucide React for icons: import { IconName } from 'lucide-react'
5. Do NOT output package.json or HTML files`
    }

    // ── Agentic Chad → dedicated route ────────────────────────────────────
    if (tier === "agentic-chad") {
      const agenticRes = await fetch(
        new URL("/api/agentic", req.url).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages, userId }),
        }
      )
      return agenticRes
    }

    // ── Map tier to provider config name ──────────────────────────────────
    const providerTier = tier || "nano"

    // ── Build system prompt ────────────────────────────────────────────────
    const roastContext = skill === 'roast' ? "ROAST MODE ACTIVATED: You must violently, ruthlessly, yet cleverly roast the user based on their input. Be savage, sarcastic, completely unfiltered (but safe for work), and extremely witty. Use emojis aggressively." : ""

    const systemPrompt = [
      "You are Zero, a powerful and friendly AI assistant. Be concise, accurate, and helpful.",
      "Format your responses with proper markdown: use **bold**, *italic*, `code`, headers (##), lists, and code blocks when appropriate.",
      "When writing code, always use fenced code blocks with the language specified.",
      "Never mention model names like GPT, Claude, Gemini, etc. You are Zero.",
      roastContext,
      memoryContext,
      searchContext,
      appFactoryContext,
    ]
      .filter(Boolean)
      .join("\n")

    // ── Stream response ────────────────────────────────────────────────────
    const stream = await streamWithFallback(messages, providerTier, systemPrompt)

    if (userId && messages.length >= 2) {
      extractMemoriesBackground(messages.slice(-3), userId)
    }

    const headers: Record<string, string> = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    }
    if (searchResults.length > 0) {
      headers["X-Search-Results"] = JSON.stringify(searchResults)
    }

    return new Response(stream, { headers })
  } catch (err: any) {
    console.error("[chat/route] Error:", err)
    return Response.json(
      { error: "Zero is experiencing high demand, try again in a moment." },
      { status: 500 }
    )
  }
}
