'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const updateAudioLevel = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length
    setAudioLevel(average / 255)

    if (isRecording) {
      animationRef.current = requestAnimationFrame(updateAudioLevel)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Set up audio analyzer
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        setIsProcessing(true)
        stream.getTracks().forEach((track) => track.stop())

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })

        try {
          // Send to transcription API
          const formData = new FormData()
          formData.append('audio', audioBlob)

          const res = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          })

          if (res.ok) {
            const { text } = await res.json()
            if (text) {
              onTranscript(text)
            }
          }
        } catch (error) {
          console.error('Transcription error:', error)
        } finally {
          setIsProcessing(false)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      updateAudioLevel()
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setAudioLevel(0)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <button
      onClick={toggleRecording}
      disabled={disabled || isProcessing}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-full transition-all',
        isRecording
          ? 'bg-red-500 text-white'
          : 'bg-bg-2 text-text-2 hover:bg-bg-3 hover:text-text-1',
        (disabled || isProcessing) && 'cursor-not-allowed opacity-50'
      )}
      aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
    >
      {/* Audio level indicator */}
      {isRecording && (
        <div
          className="absolute inset-0 rounded-full bg-red-400 opacity-50"
          style={{
            transform: `scale(${1 + audioLevel * 0.5})`,
            transition: 'transform 0.05s ease-out',
          }}
        />
      )}

      {isProcessing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isRecording ? (
        <MicOff className="relative z-10 h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </button>
  )
}

// Text-to-speech output component
interface VoiceOutputProps {
  text: string
}

export function VoiceOutput({ text }: VoiceOutputProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = () => {
    if (isSpeaking) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }

  return (
    <button
      onClick={speak}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
        isSpeaking
          ? 'bg-zero-300/20 text-zero-300'
          : 'text-text-3 hover:bg-bg-2 hover:text-text-1'
      )}
      aria-label={isSpeaking ? 'Stop speaking' : 'Read aloud'}
    >
      <Volume2 className={cn('h-4 w-4', isSpeaking && 'animate-pulse')} />
    </button>
  )
}
