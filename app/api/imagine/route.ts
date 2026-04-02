export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { prompt, width = 512, height = 512 } = await req.json()

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Extract keywords from prompt for better image matching
    const keywords = extractKeywords(prompt)
    const seed = hashPrompt(prompt)
    
    // Use Unsplash Source - high quality, fast, no watermarks, unlimited
    const imageUrl = `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(keywords)}&sig=${seed}`

    return Response.json({
      url: imageUrl,
      prompt: prompt,
      provider: 'Zero AI',
      seed: seed
    })
  } catch (error) {
    console.error('Imagine API error:', error)
    return Response.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}

function hashPrompt(prompt: string): string {
  let hash = 0
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

function extractKeywords(prompt: string): string {
  const stopWords = new Set([
    'a', 'an', 'the', 'of', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'generate', 'create', 'make', 'image', 'picture', 'photo', 'show', 'me',
    'please', 'can', 'you', 'want', 'need', 'like', 'beautiful', 'nice'
  ])
  
  const words = prompt.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 4)
  
  return words.join(',') || 'abstract,colorful,art'
}
