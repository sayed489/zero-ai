/**
 * Tavily Search API Integration
 * Provides web search capabilities for the AI agents
 */

interface TavilySearchResult {
  title: string
  url: string
  content: string
  score: number
  raw_content?: string
}

interface TavilySearchResponse {
  results: TavilySearchResult[]
  query: string
  response_time: number
}

/**
 * Search the web using Tavily API
 * Falls back to a simple mock if API key is not available
 */
export async function tavilySearch(
  query: string, 
  maxResults: number = 5
): Promise<TavilySearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY

  if (!apiKey) {
    console.warn("[Tavily] API key not configured, using mock results")
    return getMockResults(query)
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        max_results: maxResults,
        include_answer: false,
        include_raw_content: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`)
    }

    const data: TavilySearchResponse = await response.json()
    return data.results || []
  } catch (error) {
    console.error("[Tavily] Search failed:", error)
    return getMockResults(query)
  }
}

/**
 * Mock results for when Tavily is not configured
 * Provides useful responses for common queries
 */
function getMockResults(query: string): TavilySearchResult[] {
  const lowerQuery = query.toLowerCase()
  
  // Provide contextual mock results based on query type
  if (lowerQuery.includes("react") || lowerQuery.includes("component")) {
    return [
      {
        title: "React Documentation - Official Guide",
        url: "https://react.dev/learn",
        content: "React is a JavaScript library for building user interfaces. Learn React fundamentals including components, props, state, and hooks.",
        score: 0.95
      },
      {
        title: "React Hooks Complete Guide",
        url: "https://react.dev/reference/react",
        content: "Master React hooks including useState, useEffect, useContext, and custom hooks for building modern React applications.",
        score: 0.90
      }
    ]
  }
  
  if (lowerQuery.includes("ai") || lowerQuery.includes("llm") || lowerQuery.includes("gpt")) {
    return [
      {
        title: "AI and Large Language Models Overview",
        url: "https://openai.com/research",
        content: "Large language models (LLMs) like GPT-4 represent a breakthrough in artificial intelligence, capable of understanding and generating human-like text.",
        score: 0.92
      },
      {
        title: "Building AI Applications",
        url: "https://sdk.vercel.ai/docs",
        content: "The AI SDK provides tools for building AI-powered applications with streaming, tool calling, and multi-modal support.",
        score: 0.88
      }
    ]
  }
  
  if (lowerQuery.includes("next") || lowerQuery.includes("vercel")) {
    return [
      {
        title: "Next.js Documentation",
        url: "https://nextjs.org/docs",
        content: "Next.js is a React framework that enables server-side rendering, static site generation, and API routes for full-stack web applications.",
        score: 0.94
      }
    ]
  }

  // Default generic results
  return [
    {
      title: `Search Results for: ${query}`,
      url: "https://example.com/search",
      content: `Information about "${query}". For the most accurate and up-to-date information, please configure the Tavily API key in your environment variables.`,
      score: 0.5
    }
  ]
}
