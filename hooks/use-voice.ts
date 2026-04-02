'use client'

import { useCallback, useRef, useEffect } from 'react'

interface UseVoiceOptions {
  enabled?: boolean
}

export function useVoice({ enabled = true }: UseVoiceOptions = {}) {
  const isSpeakingRef = useRef(false)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis
    }
  }, [])

  const getVoice = useCallback(() => {
    if (!synthRef.current) return null

    const voices = synthRef.current.getVoices()
    if (!voices.length) return null

    // Prefer female voice for Zero
    const femaleVoice = voices.find(v => v.name.includes('Female')) ||
                       voices.find(v => v.name.includes('woman')) ||
                       voices.find(v => v.name.includes('Google UK English Female')) ||
                       voices[0]
    return femaleVoice
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!enabled || !synthRef.current) return

      if (isSpeakingRef.current) {
        synthRef.current.cancel()
      }

      const utterance = new SpeechSynthesisUtterance(text)
      const voice = getVoice()

      if (voice) {
        utterance.voice = voice
      }

      utterance.pitch = 1.4
      utterance.rate = 1.05
      utterance.volume = 0.95

      utterance.onstart = () => {
        isSpeakingRef.current = true
      }

      utterance.onend = () => {
        isSpeakingRef.current = false
      }

      utterance.onerror = () => {
        isSpeakingRef.current = false
      }

      synthRef.current.speak(utterance)
    },
    [enabled, getVoice]
  )

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      isSpeakingRef.current = false
    }
  }, [])

  const isSpeaking = useCallback(() => isSpeakingRef.current, [])

  return {
    speak,
    stop,
    isSpeaking,
  }
}
