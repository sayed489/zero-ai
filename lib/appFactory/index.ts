import { TEMPLATES, TemplateKey } from "./templates"
import { createClient } from "@supabase/supabase-js"

// Supabase service client for saving jobs
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

// ─── Key selection ────────────────────────────────────────────────────────────
function getAppFactoryKey(): { key: string; model: string } {
  // Try Gemini 2.5 Flash first (better quality)
  const keys25 = [
    process.env.GEMINI_2_5_FLASH_KEY_1,
    process.env.GEMINI_2_5_FLASH_KEY_2,
  ].filter((k): k is string => !!k && !k.startsWith("your-"))

  if (keys25.length > 0) {
    const key = keys25[Math.floor(Math.random() * keys25.length)]
    return { key, model: process.env.FACTORY_MODEL_ID || "gemini-2.5-pro" }
  }

  // Fallback: Gemini 2.0 Flash (working keys always available)
  const keys20 = [
    process.env.GEMINI_FLASH_KEY_1,
    process.env.GEMINI_FLASH_KEY_2,
    process.env.GEMINI_FLASH_KEY_3,
    process.env.GEMINI_FLASH_KEY_4,
  ].filter((k): k is string => !!k && !k.startsWith("your-"))

  if (keys20.length > 0) {
    const key = keys20[Math.floor(Math.random() * keys20.length)]
    return { key, model: "gemini-2.5-flash" }
  }

  return { key: "", model: "gemini-2.5-flash" }
}

// ─── Template classifier ──────────────────────────────────────────────────────
async function classifyTemplate(
  description: string,
  apiKey: string,
  model: string
): Promise<TemplateKey> {
  const validKeys = Object.keys(TEMPLATES) as TemplateKey[]
  const keyList = validKeys.join(", ")

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Which template best fits this app request? Reply with ONLY one word from this list:
${keyList}

App request: "${description}"
Best template:`,
                },
              ],
            },
          ],
          generationConfig: { maxOutputTokens: 10, temperature: 0 },
        }),
      }
    )
    const data = await res.json()
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text
      ?.trim()
      .toLowerCase()
      .replace(/[^a-z-]/g, "")

    return validKeys.includes(answer as TemplateKey)
      ? (answer as TemplateKey)
      : "landing"
  } catch {
    return "landing"
  }
}

// ─── File customizer ──────────────────────────────────────────────────────────
async function customizeFile(
  filename: string,
  baseContent: string,
  description: string,
  complexity: string,
  apiKey: string,
  model: string
): Promise<{ filename: string; content: string }> {
  const isCSS = filename.endsWith(".css")
  const isJS = filename.endsWith(".js") || filename.endsWith(".ts")
  const isHTML = filename.endsWith(".html")

  const instructions = isHTML
    ? "Update HTML elements to precisely match the user request. Use stunning modern Tailwind classes: glassmorphism (`bg-black/40 backdrop-blur-md`), gradients, and premium spacing. The result MUST look like a billion-dollar startup. KEEP the Tailwind CDN script tag."
    : isJS
    ? "Add working JavaScript/TypeScript functionality that matches the request. Link to existing HTML IDs and classes. Use modern ES6+. Keep it clean."
    : isCSS
    ? "Update CSS to enhance the design with premium animations, smooth transitions, and modern aesthetics."
    : "Update this file to match the user request."

  const prompt = `You are customizing a ${filename} file to build this app: "${description}"

CRITICAL: ${instructions}

Return ONLY the raw file content — NO markdown code blocks, NO backticks, NO explanations.

Base template to customize:
${baseContent}`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: complexity === "complex" ? 8192 : 4096,
            temperature: 0.4,
          },
        }),
      }
    )
    const data = await res.json()
    let content: string =
      data.candidates?.[0]?.content?.parts?.[0]?.text || baseContent

    // Strip any markdown code blocks the model returns despite instructions
    const match = content.match(/```[\w]*\n([\s\S]*?)```/)
    if (match) {
      content = match[1].trim()
    } else {
      content = content
        .replace(/^```[\w]*\n?/gm, "")
        .replace(/```$/gm, "")
        .trim()
    }

    return { filename, content }
  } catch {
    return { filename, content: baseContent }
  }
}

// ─── StackBlitz URL builder ───────────────────────────────────────────────────
function buildStackBlitzUrl(
  files: { filename: string; content: string }[]
): string {
  // StackBlitz embed via POST form approach using query params
  const fileObj = files.reduce<Record<string, string>>((acc, f) => {
    acc[f.filename] = f.content
    return acc
  }, {})

  const params = new URLSearchParams()
  params.set("title", "Zero App")
  params.set("description", "Generated by Zero AI")

  // StackBlitz supports file params as files[path]=content
  for (const [path, content] of Object.entries(fileObj)) {
    params.set(`files[${path}]`, content)
  }

  return `https://stackblitz.com/run?${params.toString()}`
}

// ─── Save to Supabase ─────────────────────────────────────────────────────────
export async function saveAppFactoryJob(opts: {
  userId: string
  description: string
  template: string
  files: { filename: string; content: string }[]
  stackblitzUrl: string
  complexity: string
}): Promise<string | null> {
  try {
    const supabase = getSupabase()
    if (!supabase) return null

    const { data, error } = await supabase
      .from("app_factory_jobs")
      .insert({
        user_id: opts.userId,
        description: opts.description,
        template_id: opts.template,
        complexity: opts.complexity,
        status: "completed",
        generated_files: opts.files.reduce<Record<string, string>>((acc, f) => {
          acc[f.filename] = f.content
          return acc
        }, {}),
        stackblitz_url: opts.stackblitzUrl,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error) {
      console.error("[AppFactory] Supabase save error:", error.message)
      return null
    }

    return data?.id || null
  } catch (e: any) {
    console.error("[AppFactory] Save failed:", e.message)
    return null
  }
}

// ─── Main buildApp export ─────────────────────────────────────────────────────
export async function buildApp(
  description: string,
  complexity: "simple" | "complex",
  userId?: string
): Promise<{
  files: { filename: string; content: string }[]
  stackblitzUrl: string
  template: string
  jobId: string | null
}> {
  const { key: apiKey, model } = getAppFactoryKey()

  if (!apiKey) {
    throw new Error(
      "No Gemini API keys configured. Add GEMINI_FLASH_KEY_1 to your .env.local"
    )
  }

  const templateKey = await classifyTemplate(description, apiKey, model)
  const template = TEMPLATES[templateKey]

  if (!template) {
    throw new Error(`Template "${templateKey}" not found`)
  }

  // Customize all files in parallel
  const customizedFiles = await Promise.all(
    Object.entries(template.files).map(([filename, baseContent]) =>
      customizeFile(filename, baseContent, description, complexity, apiKey, model)
    )
  )

  const stackblitzUrl = buildStackBlitzUrl(customizedFiles)

  // Save to Supabase (fire-and-forget if no userId)
  const jobId = userId
    ? await saveAppFactoryJob({
        userId,
        description,
        template: templateKey,
        files: customizedFiles,
        stackblitzUrl,
        complexity,
      })
    : null

  return {
    files: customizedFiles,
    stackblitzUrl,
    template: templateKey,
    jobId,
  }
}
