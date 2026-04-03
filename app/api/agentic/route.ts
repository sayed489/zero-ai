import { streamText, tool, generateText } from "ai"
import { z } from "zod"
import { gateway } from "@ai-sdk/gateway"
import { tavilySearch } from "@/lib/tools/web-search"
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts"

export const maxDuration = 120
export const runtime = "nodejs"

const AGENTIC_SYSTEM = `${SYSTEM_PROMPTS.BASE}

You are Zero in AGENTIC MODE - an autonomous AI agent that completes complex, multi-step tasks.

CAPABILITIES:
- Web search and research
- Data analysis and synthesis  
- Code generation and debugging
- Content creation and writing
- Task planning and execution

APPROACH:
1. UNDERSTAND: Carefully analyze the user's request
2. PLAN: Break down complex tasks into steps
3. EXECUTE: Use tools and knowledge systematically
4. SYNTHESIZE: Combine findings into clear results
5. DELIVER: Present actionable, well-formatted output

GUIDELINES:
- Think step-by-step and explain your reasoning
- Use web search for current information
- Be thorough but efficient
- If uncertain, explain limitations
- Format output for readability (markdown, code blocks, etc.)
- Always aim to fully complete the task`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, sessionId, userId } = body

    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages required", { status: 400 })
    }

    // Use the most capable model for agentic tasks
    const model = gateway("anthropic/claude-opus-4.6")

    const result = streamText({
      model,
      system: AGENTIC_SYSTEM,
      messages,
      maxSteps: 10,
      maxTokens: 8192,
      temperature: 0.7,
      tools: {
        webSearch: tool({
          description: "Search the web for current information. Use for research, finding facts, news, documentation, etc.",
          parameters: z.object({
            query: z.string().describe("The search query"),
            maxResults: z.number().optional().default(5).describe("Maximum number of results"),
          }),
          execute: async ({ query, maxResults }) => {
            try {
              const results = await tavilySearch(query, maxResults || 5)
              return {
                success: true,
                results: results.map((r: { title: string; url: string; content: string }) => ({
                  title: r.title,
                  url: r.url,
                  snippet: r.content?.slice(0, 500) || ""
                }))
              }
            } catch (error) {
              return { 
                success: false, 
                error: "Search failed", 
                results: [] 
              }
            }
          }
        }),

        analyzeWebpage: tool({
          description: "Fetch and analyze content from a specific URL",
          parameters: z.object({
            url: z.string().url().describe("The URL to analyze"),
          }),
          execute: async ({ url }) => {
            try {
              const response = await fetch(url, {
                headers: { "User-Agent": "Zero-Agent/1.0" },
                signal: AbortSignal.timeout(10000)
              })
              const html = await response.text()
              // Simple text extraction
              const text = html
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 8000)
              
              return { success: true, content: text, url }
            } catch (error) {
              return { success: false, error: "Failed to fetch URL", content: "" }
            }
          }
        }),

        generateCode: tool({
          description: "Generate code for a specific task or problem",
          parameters: z.object({
            task: z.string().describe("Description of what the code should do"),
            language: z.string().describe("Programming language (e.g., typescript, python, javascript)"),
            framework: z.string().optional().describe("Framework if applicable (e.g., react, next.js, express)"),
          }),
          execute: async ({ task, language, framework }) => {
            // Use a focused code generation call
            const codeResult = await generateText({
              model: gateway("anthropic/claude-sonnet-4"),
              system: `You are an expert ${language} programmer${framework ? ` specializing in ${framework}` : ''}. Generate clean, well-commented, production-ready code.`,
              prompt: `Generate ${language} code for: ${task}\n\nProvide ONLY the code, no explanations.`,
              maxTokens: 4096,
            })
            
            return {
              success: true,
              code: codeResult.text,
              language,
              framework
            }
          }
        }),

        createPlan: tool({
          description: "Create a detailed plan for accomplishing a complex task",
          parameters: z.object({
            objective: z.string().describe("The main objective to accomplish"),
            constraints: z.string().optional().describe("Any constraints or requirements"),
          }),
          execute: async ({ objective, constraints }) => {
            const planResult = await generateText({
              model: gateway("openai/gpt-5-mini"),
              system: "You are a strategic planner. Create clear, actionable step-by-step plans.",
              prompt: `Create a detailed plan for: ${objective}\n${constraints ? `Constraints: ${constraints}` : ''}\n\nProvide numbered steps with clear actions.`,
              maxTokens: 2048,
            })
            
            return {
              success: true,
              plan: planResult.text,
              objective
            }
          }
        }),

        summarize: tool({
          description: "Summarize a large amount of text or information",
          parameters: z.object({
            content: z.string().describe("The content to summarize"),
            style: z.enum(["brief", "detailed", "bullet-points"]).describe("Summary style"),
          }),
          execute: async ({ content, style }) => {
            const styleGuide = {
              brief: "Provide a 2-3 sentence summary",
              detailed: "Provide a comprehensive paragraph summary",
              "bullet-points": "Provide key points as bullet points"
            }
            
            const summaryResult = await generateText({
              model: gateway("openai/gpt-5-mini"),
              system: `You are a summarization expert. ${styleGuide[style]}`,
              prompt: `Summarize the following:\n\n${content}`,
              maxTokens: 1024,
            })
            
            return {
              success: true,
              summary: summaryResult.text,
              style
            }
          }
        }),
      },
      onStepFinish: ({ stepType, text, toolCalls, toolResults }) => {
        console.log("[Agentic] Step completed:", { stepType, hasText: !!text, toolCallCount: toolCalls?.length })
      },
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("[Agentic API Error]", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return new Response(JSON.stringify({ error: message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
