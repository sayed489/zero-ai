"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export type ZeroLiveStatus = "disconnected" | "connecting" | "live" | "error"

export function useZeroLive(apiKey: string | undefined | null, maxDurationSeconds = 180) {
  const [status, setStatus] = useState<ZeroLiveStatus>("disconnected")
  const [error, setError] = useState<string | null>(null)
  const [volume, setVolume] = useState(0)
  const [aiTalking, setAiTalking] = useState(false)
  const [timeLeft, setTimeLeft] = useState(maxDurationSeconds)

  const wsRef = useRef<WebSocket | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const playbackQueue = useRef<Int16Array[]>([])
  const isPlaying = useRef(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const disconnect = useCallback((keepError = false) => {
    if (wsRef.current) {
      // Remove generic onclose handler so it doesn't re-trigger disconnect when we explicitly close
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(console.error);
      audioCtxRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (!keepError) {
      setStatus("disconnected");
    }
    setAiTalking(false);
    setVolume(0);
  }, []);

  const connect = useCallback(async () => {
    if (!apiKey) {
      setError("No API key available for Zero Live")
      return
    }

    setStatus("connecting")
    setError(null)
    setTimeLeft(maxDurationSeconds)

    try {
      // Setup Web Audio
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: 16000 } })
      streamRef.current = stream
      
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 })
      audioCtxRef.current = ctx

      // Connect WebSocket
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = async () => {
        // Setup payload
        ws.send(JSON.stringify({
          setup: {
            model: "models/gemini-2.0-flash-exp",
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } }
              },
              thinkingConfig: {
                includeThoughts: true,
                thinkingLevel: "High" 
              }
            },
            systemInstruction: {
              parts: [{ text: "You are Zero, a helpful and immersive AI assistant. Keep responses concise and natural for voice conversation." }]
            }
          }
        }))

        // Use AudioWorklet instead of deprecated ScriptProcessorNode
        const workletCode = `
          class PCMProcessor extends AudioWorkletProcessor {
            process(inputs, outputs, parameters) {
              const input = inputs[0];
              if (input && input.length > 0) {
                const channelData = input[0];
                if (channelData && channelData.length > 0) {
                  this.port.postMessage(channelData);
                }
              }
              return true;
            }
          }
          registerProcessor('pcm-processor', PCMProcessor);
        `;
        
        const blob = new Blob([workletCode], { type: 'application/javascript' });
        const workletUrl = URL.createObjectURL(blob);
        
        await ctx.audioWorklet.addModule(workletUrl);
        URL.revokeObjectURL(workletUrl);

        const workletNode = new AudioWorkletNode(ctx, 'pcm-processor');
        const source = ctx.createMediaStreamSource(stream);
        
        source.connect(workletNode);
        workletNode.connect(ctx.destination);

        workletNode.port.onmessage = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          
          const inputData = e.data;
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
          const rms = Math.sqrt(sum / inputData.length);
          setVolume(Math.min(1, rms * 15)); // Higher sensitivity for orb

          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          
          const buffer = new Uint8Array(pcmData.buffer);
          let binary = '';
          for (let i = 0; i < buffer.byteLength; i++) binary += String.fromCharCode(buffer[i]);
          
          ws.send(JSON.stringify({
            realtimeInput: {
              mediaChunks: [{
                mimeType: "audio/pcm;rate=16000",
                data: btoa(binary)
              }]
            }
          }));
        };

        setStatus("live")
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              disconnect()
              setError("Time limit reached for Free Tier.")
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.error) {
             console.error("Gemini Live API Error:", data.error);
             setError(`API Error: ${data.error.message || JSON.stringify(data.error)}`);
             setStatus("error");
             disconnect(true);
             return;
          }
          const parts = data.serverContent?.modelTurn?.parts || []
          
          for (const part of parts) {
            if (part.inlineData?.mimeType.startsWith("audio/pcm")) {
              const binaryStr = atob(part.inlineData.data)
              const pcmData = new Int16Array(binaryStr.length / 2)
              for (let i = 0; i < pcmData.length; i++) {
                pcmData[i] = binaryStr.charCodeAt(i * 2) | (binaryStr.charCodeAt(i * 2 + 1) << 8)
              }
              playbackQueue.current.push(pcmData)
              if (!isPlaying.current) playNextAudioChunk()
            }
          }
        } catch (err) {
          console.error("Failed to parse message", err);
        }
      }

      ws.onerror = () => {
        setError("Connection dropped. Please try again.")
        setStatus("error")
        disconnect(true)
      }
      
      ws.onclose = () => {
        // If connection was unexpectedly closed by remote
        disconnect()
      }

    } catch (err: any) {
      setError(err.message || "Microphone access denied.")
      setStatus("error")
    }
  }, [apiKey, maxDurationSeconds, disconnect])

  const playNextAudioChunk = () => {
    if (playbackQueue.current.length === 0 || !audioCtxRef.current) {
      isPlaying.current = false
      setAiTalking(false)
      return
    }

    isPlaying.current = true
    setAiTalking(true)
    const pcmData = playbackQueue.current.shift()!
    const audioBuffer = audioCtxRef.current.createBuffer(1, pcmData.length, 16000)
    const channelData = audioBuffer.getChannelData(0)
    
    for (let i = 0; i < pcmData.length; i++) channelData[i] = pcmData[i] / 32768.0

    const source = audioCtxRef.current.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioCtxRef.current.destination)
    source.onended = playNextAudioChunk
    source.start()
  }

  useEffect(() => disconnect, [disconnect])

  return { status, error, volume, aiTalking, timeLeft, connect, disconnect }
}
