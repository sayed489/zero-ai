import { redis } from "@/lib/redis"

export interface SearchResult {
  title: string
  url: string
  snippet: string
  favicon: string
}

async function serperSearch(query: string): Promise<SearchResult[]> {
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

async function braveSearch(query: string): Promise<SearchResult[]> {
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

async function tavilySearch(query: string): Promise<SearchResult[]> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: process.env.TAVILY_KEY, query, max_results: 5 }),
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

async function ddgSearch(query: string): Promise<SearchResult[]> {
  const res = await fetch(
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
    {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    }
  )
  const html = await res.text()
  const results: SearchResult[] = []
  const regex =
    /<a class="result__a" href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([^<]+)<\/a>/g
  let match
  while ((match = regex.exec(html)) !== null && results.length < 5) {
    results.push({ url: match[1], title: match[2], snippet: match[3], favicon: "" })
  }
  return results
}

export async function search(query: string): Promise<SearchResult[]> {
  const cacheKey = `search:${Buffer.from(query).toString("base64").slice(0, 32)}`
  let cached = null
  try {
    cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached as string)
  } catch (e) {
    console.error("Redis cache get error:", e)
  }

  const providers = [serperSearch, braveSearch, tavilySearch, ddgSearch]
  for (const provider of providers) {
    try {
      const results = await provider(query)
      if (results.length > 0) {
        try {
          await redis.set(cacheKey, JSON.stringify(results), { ex: 3600 })
        } catch(e) {
          console.error("Redis cache set error:", e)
        }
        return results
      }
    } catch (e) {
      continue
    }
  }
  return []
}
