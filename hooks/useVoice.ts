"use client"

/**
 * useVoice — Premium Web Speech API voice for Zero AI
 * - Uses SpeechRecognition for voice input
 * - Uses SpeechSynthesis for voice output with natural voice selection
 * - Strips emojis and special characters for clean reading
 */

import { useState, useCallback, useRef, useEffect } from "react"

// Strip emojis and special unicode for clean TTS
function cleanForSpeech(text: string): string {
  return text
    // Remove emoji
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
    .replace(/[\u{200D}]/gu, '')
    // Remove markdown symbols
    .replace(/[*_~`#>]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) → text
    .replace(/```[\s\S]*?```/g, 'code block omitted')
    .replace(/`([^`]+)`/g, '$1')
    // Clean up whitespace
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

// Select the most natural-sounding voice
function selectPremiumVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  // Priority order: Google UK English Female > Google US English > Microsoft natural voices > any English
  const priorities = [
    (v: SpeechSynthesisVoice) => v.name.includes('Google UK English Female'),
    (v: SpeechSynthesisVoice) => v.name.includes('Google US English'),
    (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang.startsWith('en'),
    (v: SpeechSynthesisVoice) => v.name.includes('Natural') && v.lang.startsWith('en'),
    (v: SpeechSynthesisVoice) => v.name.includes('Microsoft') && v.name.includes('Online') && v.lang.startsWith('en'),
    (v: SpeechSynthesisVoice) => v.name.includes('Samantha'),
    (v: SpeechSynthesisVoice) => v.name.includes('Karen'),
    (v: SpeechSynthesisVoice) => v.name.includes('Daniel'),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en') && !v.name.includes('espeak'),
  ]

  for (const check of priorities) {
    const match = voices.find(check)
    if (match) return match
  }
  return voices.find(v => v.lang.startsWith('en')) || voices[0] || null
}

export function useVoice() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [voiceSupported, setVoiceSupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null)

  // Initialize voice support detection and voice selection
  useEffect(() => {
    const hasSpeech = typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    const hasSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window
    setVoiceSupported(hasSpeech || hasSynthesis)

    // Pre-select best voice
    if (hasSynthesis) {
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices()
        if (voices.length > 0) {
          selectedVoiceRef.current = selectPremiumVoice(voices)
          console.log('[Voice] Selected:', selectedVoiceRef.current?.name)
        }
      }
      loadVoices()
      speechSynthesis.addEventListener('voiceschanged', loadVoices)
      return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [])

  // Start listening for voice input
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      let interimTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          setTranscript(t)
        } else {
          interimTranscript += t
        }
      }
      if (interimTranscript) setTranscript(interimTranscript)
    }

    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
    setTranscript("")
  }, [])

  // Stop listening
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  // Speak text aloud with premium voice
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return

    // Cancel any ongoing speech
    speechSynthesis.cancel()

    const cleaned = cleanForSpeech(text)
    if (!cleaned) return

    // Break into sentences for more natural pauses
    const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned]

    let index = 0
    setIsSpeaking(true)

    const speakNext = () => {
      if (index >= sentences.length) {
        setIsSpeaking(false)
        return
      }

      const utterance = new SpeechSynthesisUtterance(sentences[index].trim())
      utterance.rate = 1.0        // Natural speed
      utterance.pitch = 1.05      // Slightly warm
      utterance.volume = 0.9

      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current
      }

      utterance.onend = () => {
        index++
        speakNext()
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
      }

      speechSynthesis.speak(utterance)
    }

    speakNext()
  }, [])

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return {
    isListening,
    isSpeaking,
    transcript,
    voiceSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  }
}
