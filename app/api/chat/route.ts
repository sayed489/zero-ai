import { streamWithFallback } from "@/lib/providers/router"
import { detectIntent } from "@/lib/intent"
import { checkRateLimit } from "@/lib/rateLimit"
import { getMemories, extractMemoriesBackground } from "@/lib/memory"
import { search } from "@/lib/search"
import { generateImage } from "@/lib/imageGen"

export const runtime = "edge"

export async function POST(req: Request) {
  const { messages, tier, userId, sessionId, plan } = await req.json()

  // Rate limit check
  const rl = await checkRateLimit(userId, plan || "nano")
  if (!rl.allowed) {
    return Response.json(
      { error: "Daily limit reached", resetAt: rl.resetAt, upgrade: true },
      { status: 429 }
    )
  }

  const lastMessage = messages[messages.length - 1]?.content as string
  const intent = detectIntent(lastMessage)

  // Handle image generation
  if (intent.isImageGen) {
    const result = await generateImage(intent.imagePrompt || lastMessage)
    return Response.json({ type: "image", url: result.url, provider: result.provider })
  }

  // Get memories for context
  const memories = userId ? await getMemories(userId, lastMessage) : []
  const memoryContext =
    memories.length > 0
      ? `User context (remember these facts): ${memories.join(". ")}.`
      : ""

  // Get search results if needed
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

  let appFactoryContext = ""
  if (intent.isAppFactory) {
    appFactoryContext = `
You are an expert React UI Architect building a "Billion Dollar Startup" web application block.
You MUST output code in a multi-file React architecture. 
For EACH file you create, wrap it in a markdown block specifying the language and filename like this:
\`\`\`tsx filename="App.tsx"
export default function App() { ... }
\`\`\`
RULES:
1. ALWAYS provide at least an "App.tsx". 
2. Break down complex UIs into smaller components (e.g. filename="components/Header.tsx").
3. USE TAILWIND CSS classes extensively for styling. 
4. The UI MUST look like an ultra-premium, dark-mode 2026 startup. Use glassmorphism (\`bg-black/40 backdrop-blur-md\`), breathtaking gradients (\`bg-gradient-to-r from-violet-500 to-fuchsia-500\`), subtle borders (\`border-white/10\`), and elegant typography. DO NOT output a basic or boring UI.
5. Use Lucide React for icons if needed (\`import { IconName } from 'lucide-react'\`).
6. Do NOT output a package.json or public HTML files. ONLY output your .tsx and .ts and .css components.
`
  }

  const systemPrompt = [
    "You are Zero, a helpful and friendly AI assistant.",
    memoryContext,
    searchContext,
    appFactoryContext
  ]
    .filter(Boolean)
    .join("\n")

  // Stream AI response
  const stream = await streamWithFallback(messages, tier || "nano", systemPrompt)

  // Background: extract memories after response
  if (userId && messages.length >= 2) {
    extractMemoriesBackground(messages.slice(-3), userId)
  }

  // Return SSE stream with search sources appended
  const headers: Record<string, string> = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  }
  if (searchResults.length > 0) {
    headers["X-Search-Results"] = JSON.stringify(searchResults)
  }

  return new Response(stream, { headers })
}
