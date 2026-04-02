import { NextRequest, NextResponse } from 'next/server'

const GROQ_WHISPER_URL = 'https://api.groq.com/openai/v1/audio/transcriptions'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not set' },
        { status: 500 }
      )
    }

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Create new FormData for Groq API
    const groqFormData = new FormData()
    groqFormData.append('file', audioFile)
    groqFormData.append('model', 'whisper-large-v3')
    groqFormData.append('language', 'en')

    const response = await fetch(GROQ_WHISPER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: groqFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq Whisper error:', errorText)
      return NextResponse.json(
        { error: 'Transcription failed' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({ text: data.text })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
