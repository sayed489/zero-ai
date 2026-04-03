import { redis } from "@/lib/redis"

export interface SearchResult {
  title: string
  url: string
  snippet: string
  favicon: string
}

// ─── DuckDuckGo (PRIMARY — free, no key required) ───────────────────────────
async function ddgSearch(query: string): Promise<SearchResult[]> {
  const res = await fetch(
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
    {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(8000),
    }
  )
  const html = await res.text()
  const results: SearchResult[] = []

  // Parse DDG HTML results
  const resultRegex = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g
  const snippetRegex = /<a[^>]+class="result__snippet"[^>]*>([^<]+)<\/a>/g

  const links: { url: string; title: string }[] = []
  let match
  while ((match = resultRegex.exec(html)) !== null && links.length < 5) {
    // DDG wraps real URLs in a redirect; extract the actual URL
    let url = match[1]
    const uddgMatch = url.match(/[?&]uddg=([^&]+)/)
    if (uddgMatch) url = decodeURIComponent(uddgMatch[1])
    links.push({ url, title: match[2].trim() })
  }

  const snippets: string[] = []
  while ((match = snippetRegex.exec(html)) !== null && snippets.length < 5) {
    snippets.push(match[1].trim())
  }

  for (let i = 0; i < links.length; i++) {
    try {
      const hostname = new URL(links[i].url).hostname
      results.push({
        url: links[i].url,
        title: links[i].title,
        snippet: snippets[i] || "",
        favicon: `https://www.google.com/s2/favicons?domain=${hostname}`,
      })
    } catch {
      // Skip malformed URLs
    }
  }

  return results
}

// ─── Serper (optional — needs SERPER_KEY) ───────────────────────────────────
async function serperSearch(query: string): Promise<SearchResult[]> {
  if (!process.env.SERPER_KEY || process.env.SERPER_KEY.startsWith("your-")) return []
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.SERPER_KEY!,
    },
    body: JSON.stringify({ q: query, num: 5 }),
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) throw new Error("Serper failed")
  const data = await res.json()
  return (data.organic || []).map((r: any) => ({
    title: r.title,
    url: r.link,
    snippet: r.snippet,
    favicon: `https://www.google.com/s2/favicons?domain=${new URL(r.link).hostname}`,
  }))
}

// ─── Brave (optional — needs BRAVE_KEY) ─────────────────────────────────────
async function braveSearch(query: string): Promise<SearchResult[]> {
  if (!process.env.BRAVE_KEY || process.env.BRAVE_KEY.startsWith("your-")) return []
  const res = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
    {
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": process.env.BRAVE_KEY!,
      },
      signal: AbortSignal.timeout(5000),
    }
  )
  if (!res.ok) throw new Error("Brave failed")
  const data = await res.json()
  return (data.web?.results || []).map((r: any) => ({
    title: r.title,
    url: r.url,
    snippet: r.description,
    favicon: `https://www.google.com/s2/favicons?domain=${new URL(r.url).hostname}`,
  }))
}

// ─── Tavily (optional — needs TAVILY_API_KEY) ───────────────────────────────────
async function tavilySearch(query: string): Promise<SearchResult[]> {
  if (!process.env.TAVILY_API_KEY || process.env.TAVILY_API_KEY.startsWith("your-")) return []
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: process.env.TAVILY_API_KEY, query, max_results: 5 }),
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) throw new Error("Tavily failed")
  const data = await res.json()
  return (data.results || []).map((r: any) => ({
    title: r.title,
    url: r.url,
    snippet: r.content?.slice(0, 200),
    favicon: `https://www.google.com/s2/favicons?domain=${new URL(r.url).hostname}`,
  }))
}

// ─── SearchAPI.io (optional — needs SEARCHAPI_API_KEY) ──────────────────────
async function searchApiSearch(query: string): Promise<SearchResult[]> {
  if (!process.env.SEARCHAPI_API_KEY || process.env.SEARCHAPI_API_KEY.startsWith("your-")) return []
  const res = await fetch(`https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(query)}&api_key=${process.env.SEARCHAPI_API_KEY}`, {
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) throw new Error("SearchAPI failed")
  const data = await res.json()
  return (data.organic_results || []).slice(0, 5).map((r: any) => ({
    title: r.title,
    url: r.link,
    snippet: r.snippet,
    favicon: `https://www.google.com/s2/favicons?domain=${new URL(r.link).hostname}`,
  }))
}

// ─── Main search with fallback chain ────────────────────────────────────────
export async function search(query: string): Promise<SearchResult[]> {
  // Check cache first
  const cacheKey = `search:${Buffer.from(query).toString("base64").slice(0, 32)}`
  try {
    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached as string)
  } catch {
    // Redis unavailable — continue without cache
  }

  // Prioritize fast API providers (SearchAPI, Tavily, Serper), fall back to DDG web scraping
  const providers = [searchApiSearch, tavilySearch, serperSearch, braveSearch, ddgSearch]
  for (const provider of providers) {
    try {
      const results = await provider(query)
      if (results.length > 0) {
        try {
          await redis.set(cacheKey, JSON.stringify(results), { ex: 3600 })
        } catch {
          // Cache set failed — non-fatal
        }
        return results
      }
    } catch {
      continue
    }
  }
  return []
}
