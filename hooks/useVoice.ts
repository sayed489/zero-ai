"use client"

import { useState, useRef } from "react"

export function useVoice() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef<any>(null)

  function startListening(onResult: (text: string) => void) {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (e: any) => {
      onResult(e.results[0][0].transcript)
      setIsListening(false)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  async function speak(text: string) {
    setIsSpeaking(true)
    const truncated = text.slice(0, 500)

    // Try ElevenLabs first
    try {
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: truncated }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.onended = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(url)
        }
        await audio.play()
        return
      }
    } catch {}

    // Fallback: Web Speech API
    const utter = new SpeechSynthesisUtterance(truncated)
    utter.lang = "en-US"
    utter.onend = () => setIsSpeaking(false)
    speechSynthesis.speak(utter)
  }

  function stopSpeaking() {
    speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  return { isListening, isSpeaking, startListening, stopListening, speak, stopSpeaking }
}
