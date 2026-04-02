import { TEMPLATES, TemplateKey } from "./templates"

async function classifyTemplate(description: string, apiKey: string): Promise<TemplateKey> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Which template fits this request? Reply with ONLY one word from this list:
landing, dashboard, tool, game

Request: "${description}"
Answer:`,
              },
            ],
          },
        ],
        generationConfig: { maxOutputTokens: 10 },
      }),
    }
  )
  const data = await res.json()
  const answer = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase()
  const valid: TemplateKey[] = ["landing", "dashboard", "tool", "game"]
  return valid.includes(answer as TemplateKey) ? (answer as TemplateKey) : "landing"
}

async function customizeFile(
  filename: string,
  baseContent: string,
  description: string,
  complexity: string,
  apiKey: string
): Promise<{ filename: string; content: string }> {
  const isCSS = filename.endsWith(".css")
  const isJS = filename.endsWith(".js")
  const isHTML = filename.endsWith(".html")

  // Bulletproof instructions ensuring stunning UI even for poor prompts
  const instructions = isHTML
    ? "Update the structural HTML elements exactly matching the user request. MUST use stunning, modern Tailwind CSS classes (e.g. glassmorphism `bg-black/40 backdrop-blur-md`, flawless padding, radiant gradients `bg-gradient-to-r from-purple-500 to-pink-500`, subtle borders `border-white/10`). DO NOT remove the Tailwind CDN script. IT MUST LOOK LIKE A BILLION DOLLAR STARTUP. NO EXCEPTIONS."
    : isJS
    ? "Inject working JS functionality for the specific app. Link exactly to the HTML IDs and classes. Use modern ES6. Keep it clean and functional."
    : ""

  const model = complexity === 'complex' ? 'gemini-2.5-flash' : 'gemini-1.5-pro' // Actually let's use 2.5 flash if complex, or 1.5 pro for simple (Wait, they requested Gemini 1.5 Flash for simple)
  const finalModel = complexity === 'complex' ? 'gemini-2.5-flash' : 'gemini-1.5-flash'
  
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${finalModel}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are customizing a ${filename} file to build this app: "${description}"

CRITICAL INSTRUCTIONS: ${instructions}
Return ONLY the raw file content based heavily around the scaffolding provided below. DO NOT EVER output markdown codeblocks (e.g no \`\`\`html). Output ONLY the raw file characters.

Base file to modify:
${baseContent}`,
              },
            ],
          },
        ],
        generationConfig: { maxOutputTokens: 4096 },
      }),
    }
  )
  const data = await res.json()
  let content = data.candidates?.[0]?.content?.parts?.[0]?.text || baseContent
  
  // Robust extraction: If the model uses code blocks despite instructions, extract exactly what's inside
  const codeBlockMatch = content.match(/```[a-z]*\n([\s\S]*?)```/)
  if (codeBlockMatch) {
    content = codeBlockMatch[1].trim()
  } else {
    // Fallback: Just trim any accidental backticks
    content = content.replace(/^```[a-z]*\n?/gm, "").replace(/```$/gm, "").trim()
  }

  return { filename, content }
}

function buildStackBlitzUrl(files: { filename: string; content: string }[]): string {
  const fileObj: Record<string, string> = {}
  files.forEach((f) => {
    fileObj[f.filename] = f.content
  })
  const encoded = Buffer.from(JSON.stringify(fileObj)).toString("base64")
  return `https://stackblitz.com/run?view=preview&title=Zero+App&files=${encodeURIComponent(encoded)}`
}

export async function buildApp(description: string, complexity: 'simple' | 'complex'): Promise<{
  files: { filename: string; content: string }[]
  stackblitzUrl: string
  template: string
}> {
  let apiKey = ''
  if (complexity === 'complex') {
    // Rotate between 2 keys
    const keys = [process.env.GEMINI_2_5_FLASH_KEY_1, process.env.GEMINI_2_5_FLASH_KEY_2]
      .filter(k => k && !k.startsWith('your-'))
    apiKey = keys.length > 0 ? (keys[Math.floor(Math.random() * keys.length)] as string) : ''
  } else {
    // Rotate between 4 keys
    const keys = [
      process.env.GEMINI_FLASH_KEY_1, process.env.GEMINI_FLASH_KEY_2,
      process.env.GEMINI_FLASH_KEY_3, process.env.GEMINI_FLASH_KEY_4
    ].filter(k => k && !k.startsWith('your-'))
    apiKey = keys.length > 0 ? (keys[Math.floor(Math.random() * keys.length)] as string) : ''
  }

  // Fallback to older env key if new rotated ones missing
  if (!apiKey) apiKey = process.env.GEMINI_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''

  const templateKey = await classifyTemplate(description, apiKey)
  const template = TEMPLATES[templateKey]

  // Customize all files in parallel
  const customizedFiles = await Promise.all(
    Object.entries(template.files).map(([filename, baseContent]) =>
      customizeFile(filename, baseContent, description, complexity, apiKey)
    )
  )

  const stackblitzUrl = buildStackBlitzUrl(customizedFiles)

  return {
    files: customizedFiles,
    stackblitzUrl,
    template: templateKey,
  }
}
