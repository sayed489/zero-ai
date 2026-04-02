'use client'

import { useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

export type MascotState = 
  | 'idle' 
  | 'thinking' 
  | 'happy' 
  | 'speaking' 
  | 'wink' 
  | 'love' 
  | 'surprised' 
  | 'sleep'
  | 'celebrating'
  | 'error'
  | 'eating'
  | 'drinking'
  | 'evil'

export type MascotMood = 'chill' | 'energetic' | 'sleepy' | 'excited'

interface ZeroMascotProps {
  size?: number
  state?: MascotState
  mood?: MascotMood
  interactive?: boolean
  glowColor?: string
  className?: string
  onClick?: () => void
}

export function ZeroMascot({
  size = 80,
  state = 'idle',
  mood = 'chill',
  interactive = true,
  glowColor,
  className = '',
  onClick,
}: ZeroMascotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)
  const rafRef = useRef<number>(0)
  const hoverRef = useRef(false)
  const clickAnimRef = useRef(0)
  const expressionTimeRef = useRef(0)

  // Dynamic color palette based on state
  const getColors = useCallback(() => {
    const base = {
      primary: '#9b7bea',
      secondary: '#c4a8f0',
      highlight: '#e8deff',
      glow: glowColor || 'rgba(155,123,234,0.4)',
      eye: '#4c3080',
      pupil: '#1a0f38',
    }

    switch (state) {
      case 'happy':
      case 'celebrating':
        return { ...base, glow: 'rgba(255,200,100,0.5)', primary: '#b38af5' }
      case 'love':
        return { ...base, glow: 'rgba(255,120,150,0.5)', primary: '#e88ba8' }
      case 'error':
        return { ...base, glow: 'rgba(255,100,100,0.4)', primary: '#e87878' }
      case 'sleep':
        return { ...base, glow: 'rgba(100,150,255,0.3)', primary: '#8a9be8' }
      case 'eating':
        return { ...base, glow: 'rgba(255,180,100,0.4)', primary: '#f5a855' }
      case 'drinking':
        return { ...base, glow: 'rgba(255,255,255,0.45)', primary: '#d8b4fe' }
      default:
        return base
    }
  }, [state, glowColor])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    
    // High DPI support for crisp rendering on all displays
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)
    
    // Enable smooth rendering
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    const draw = () => {
      const t = frameRef.current
      const colors = getColors()
      const W = size
      const H = size
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0) // Reset transform with DPR
      ctx.clearRect(0, 0, W, H)

      const globalCycle = Math.floor(performance.now() / 16.66) % 240

      const cx = W / 2
      const cy = H / 2
      
      // Mood-based animation parameters
      const moodSpeed = mood === 'energetic' ? 1.8 : mood === 'sleepy' ? 0.4 : mood === 'excited' ? 2.2 : 1
      const moodBounce = mood === 'excited' ? 1.5 : mood === 'sleepy' ? 0.3 : 1
      
      // Hover effect
      const hoverScale = hoverRef.current ? 1.08 : 1
      const hoverBrightness = hoverRef.current ? 1.15 : 1
      
      // Click animation
      const clickSquash = clickAnimRef.current > 0 
        ? Math.sin(clickAnimRef.current * 0.3) * 0.15 
        : 0
      if (clickAnimRef.current > 0) clickAnimRef.current--

      // Floating animation
      const bob = Math.sin(t * 0.035 * moodSpeed) * W * 0.025 * moodBounce
      const wobble = Math.sin(t * 0.028 * moodSpeed) * 0.03
      const breathe = 1 + Math.sin(t * 0.04 * moodSpeed) * 0.02
      const oy = cy + bob

      ctx.save()
      ctx.translate(cx, oy)
      ctx.rotate(wobble)
      ctx.scale(
        (breathe + clickSquash) * hoverScale, 
        (breathe * 0.97 - clickSquash * 0.5) * hoverScale
      )

      // === OUTER GLOW (Viral visual appeal) ===
      const glowLayers = [
        { radius: 0.58, alpha: 0.08 },
        { radius: 0.50, alpha: 0.12 },
        { radius: 0.44, alpha: 0.18 },
      ]
      
      glowLayers.forEach(({ radius, alpha }) => {
        const pulse = 1 + Math.sin(t * 0.05) * 0.08
        const og = ctx.createRadialGradient(0, 0, W * 0.08, 0, 0, W * radius * pulse)
        og.addColorStop(0, colors.glow.replace(/[\d.]+\)$/, `${alpha * hoverBrightness})`))
        og.addColorStop(1, 'rgba(155,123,234,0)')
        ctx.fillStyle = og
        ctx.beginPath()
        ctx.arc(0, 0, W * radius * pulse, 0, Math.PI * 2)
        ctx.fill()
      })

      // === MAIN BODY (Smooth organic cloud shape) ===
      const R = W * 0.30
      
      // Shadow underneath
      const shadowGrad = ctx.createRadialGradient(0, R * 0.9, 0, 0, R * 0.9, R * 1.2)
      shadowGrad.addColorStop(0, 'rgba(80,50,120,0.15)')
      shadowGrad.addColorStop(1, 'rgba(80,50,120,0)')
      ctx.fillStyle = shadowGrad
      ctx.beginPath()
      ctx.ellipse(0, R * 0.9, R * 0.9, R * 0.25, 0, 0, Math.PI * 2)
      ctx.fill()

      // Cloud body with smooth beziers
      ctx.beginPath()
      const wave1 = Math.sin(t * 0.025) * R * 0.04
      const wave2 = Math.cos(t * 0.03) * R * 0.03
      
      ctx.moveTo(-R * 0.88, R * 0.38)
      ctx.bezierCurveTo(
        -R * 1.15 + wave1, R * 0.32, 
        -R * 1.22, -R * 0.15, 
        -R * 0.95, -R * 0.30
      )
      ctx.bezierCurveTo(
        -R * 1.08, -R * 0.62, 
        -R * 0.72, -R * 0.92 + wave2, 
        -R * 0.38, -R * 0.78
      )
      ctx.bezierCurveTo(
        -R * 0.28, -R * 1.12, 
        R * 0.12, -R * 1.18 + wave1, 
        R * 0.28, -R * 0.88
      )
      ctx.bezierCurveTo(
        R * 0.42 + wave2, -R * 1.06, 
        R * 0.86, -R * 0.98, 
        R * 0.94, -R * 0.68
      )
      ctx.bezierCurveTo(
        R * 1.18, -R * 0.52, 
        R * 1.18 + wave1, -R * 0.05, 
        R * 0.95, R * 0.20
      )
      ctx.bezierCurveTo(
        R * 1.08, R * 0.48, 
        R * 0.58, R * 0.62, 
        R * 0.30, R * 0.56
      )
      ctx.bezierCurveTo(
        R * 0.10, R * 0.74, 
        -R * 0.15, R * 0.74, 
        -R * 0.35, R * 0.56
      )
      ctx.bezierCurveTo(
        -R * 0.65, R * 0.62, 
        -R * 1.05, R * 0.50, 
        -R * 0.88, R * 0.38
      )
      ctx.closePath()

      // Multi-layer gradient fill for depth
      const fill = ctx.createRadialGradient(-R * 0.15, -R * 0.25, 0, 0, 0, R * 1.15)
      fill.addColorStop(0, `rgba(248,242,255,${0.98 * hoverBrightness})`)
      fill.addColorStop(0.35, `rgba(235,218,255,${0.95 * hoverBrightness})`)
      fill.addColorStop(0.65, `rgba(210,185,248,${0.92 * hoverBrightness})`)
      fill.addColorStop(0.85, `rgba(185,155,235,${0.88 * hoverBrightness})`)
      fill.addColorStop(1, `rgba(160,130,220,${0.82 * hoverBrightness})`)
      ctx.fillStyle = fill
      ctx.fill()

      // Inner shine highlight
      const shine = ctx.createRadialGradient(-R * 0.25, -R * 0.38, 0, -R * 0.1, -R * 0.2, R * 0.65)
      shine.addColorStop(0, 'rgba(255,255,255,0.7)')
      shine.addColorStop(0.4, 'rgba(255,255,255,0.25)')
      shine.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = shine
      ctx.fill()

      // Rim light (top)
      const rim = ctx.createLinearGradient(0, -R * 1.1, 0, -R * 0.3)
      rim.addColorStop(0, 'rgba(255,255,255,0.6)')
      rim.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = rim
      ctx.fill()

      // Subtle edge stroke
      ctx.strokeStyle = 'rgba(155,130,210,0.25)'
      ctx.lineWidth = W * 0.008
      ctx.stroke()

      ctx.restore()

      // === FACIAL FEATURES ===
      const eyeY = oy - W * 0.02
      const eyeGap = W * 0.13
      const eyeR = W * 0.042
      
      // Blinking logic
      const blinkCycle = Math.sin(t * 0.012)
      const shouldBlink = blinkCycle > 0.96 && state !== 'thinking' && state !== 'sleep'
      
      // Expression-specific eye modifications
      const getEyeParams = () => {
        switch (state) {
          case 'happy':
          case 'celebrating':
            return { scaleY: 0.3, isArc: true, arcUp: true }
          case 'love':
            return { scaleY: 1, isHeart: true }
          case 'surprised':
            return { scaleY: 1.4, pupilScale: 0.3 }
          case 'wink':
            return { scaleY: 1, leftWink: true }
          case 'sleep':
            return { scaleY: 0.1, isLine: true }
          case 'thinking':
            return { scaleY: 0.65, lookUp: true }
          case 'error':
            return { scaleY: 1, isX: true }
          case 'eating':
            return { scaleY: 0.6, isHappy: true }
          case 'drinking': {
            const isDrinking = globalCycle < 120
            return isDrinking 
              ? { scaleY: 0.1, isLine: true } // Eyes closed while drinking
              : { scaleY: 0.8, isArc: true }  // Happy ahhh eyes after
          }
          default:
            return { scaleY: 1 }
        }
      }
      
      const eyeParams = getEyeParams()

      const drawEye = (ex: number, _ey: number, isLeft: boolean) => {
        const ey = _ey + (eyeParams.lookUp ? -W * 0.015 : 0)
        
        if (shouldBlink) {
          // Blink animation
          ctx.fillStyle = colors.eye
          ctx.beginPath()
          ctx.ellipse(ex, ey, eyeR * 1.1, eyeR * 0.12, 0, 0, Math.PI * 2)
          ctx.fill()
          return
        }
        
        if (eyeParams.isX) {
          // X eyes for error state
          ctx.strokeStyle = colors.eye
          ctx.lineWidth = W * 0.02
          ctx.lineCap = 'round'
          const xSize = eyeR * 0.8
          ctx.beginPath()
          ctx.moveTo(ex - xSize, ey - xSize)
          ctx.lineTo(ex + xSize, ey + xSize)
          ctx.moveTo(ex + xSize, ey - xSize)
          ctx.lineTo(ex - xSize, ey + xSize)
          ctx.stroke()
          return
        }

        if (eyeParams.isHappy) {
          // Happy curved eyes for eating
          ctx.strokeStyle = colors.eye
          ctx.lineWidth = W * 0.02
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.arc(ex, ey + eyeR * 0.2, eyeR * 0.8, Math.PI * 0.2, Math.PI * 0.8)
          ctx.stroke()
          return
        }

        if (eyeParams.isLine) {
          // Sleep zzz line
          ctx.strokeStyle = colors.eye
          ctx.lineWidth = W * 0.015
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(ex - eyeR * 0.9, ey)
          ctx.lineTo(ex + eyeR * 0.9, ey)
          ctx.stroke()
          return
        }

        if (eyeParams.isArc) {
          // Happy arc eyes (upward curve)
          ctx.strokeStyle = colors.eye
          ctx.lineWidth = W * 0.022
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.arc(ex, ey + eyeR * 0.3, eyeR * 0.9, Math.PI * 0.15, Math.PI * 0.85)
          ctx.stroke()
          return
        }

        if (eyeParams.isHeart) {
          // Heart eyes for love state
          drawHeart(ctx, ex, ey, eyeR * 1.8, '#e85a85')
          return
        }

        if (eyeParams.leftWink && isLeft) {
          // Wink (left eye closed)
          ctx.strokeStyle = colors.eye
          ctx.lineWidth = W * 0.018
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.arc(ex, ey, eyeR * 0.8, Math.PI * 0.2, Math.PI * 0.8)
          ctx.stroke()
          return
        }

        // Standard eye with glow
        const eyeGlow = ctx.createRadialGradient(ex, ey, 0, ex, ey, eyeR * 2.8)
        eyeGlow.addColorStop(0, 'rgba(155,123,234,0.25)')
        eyeGlow.addColorStop(1, 'rgba(155,123,234,0)')
        ctx.fillStyle = eyeGlow
        ctx.beginPath()
        ctx.arc(ex, ey, eyeR * 2.8, 0, Math.PI * 2)
        ctx.fill()

        // White of eye
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        const scaleY = eyeParams.scaleY || 1
        ctx.ellipse(ex, ey, eyeR * 1.15, eyeR * 1.15 * scaleY, 0, 0, Math.PI * 2)
        ctx.fill()

        // Iris
        const irisGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, eyeR * 0.85)
        irisGrad.addColorStop(0, '#7b5cc4')
        irisGrad.addColorStop(0.5, '#5c3a9e')
        irisGrad.addColorStop(1, colors.eye)
        ctx.fillStyle = irisGrad
        ctx.beginPath()
        ctx.ellipse(ex, ey, eyeR * 0.85, eyeR * 0.85 * scaleY, 0, 0, Math.PI * 2)
        ctx.fill()

        // Pupil
        const pupilScale = eyeParams.pupilScale || 0.45
        ctx.fillStyle = colors.pupil
        ctx.beginPath()
        ctx.arc(ex, ey, eyeR * pupilScale, 0, Math.PI * 2)
        ctx.fill()

        // Main catchlight
        ctx.fillStyle = 'rgba(255,255,255,0.95)'
        ctx.beginPath()
        ctx.arc(ex - eyeR * 0.25, ey - eyeR * 0.3, eyeR * 0.22, 0, Math.PI * 2)
        ctx.fill()

        // Secondary small catchlight
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.beginPath()
        ctx.arc(ex + eyeR * 0.15, ey + eyeR * 0.2, eyeR * 0.1, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw both eyes
      drawEye(cx - eyeGap, eyeY, true)
      drawEye(cx + eyeGap, eyeY, false)

      // === MOUTH ===
      const mouthY = oy + W * 0.08
      const drawMouth = () => {
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        switch (state) {
          case 'happy':
          case 'celebrating':
            // Big smile
            ctx.strokeStyle = colors.eye
            ctx.lineWidth = W * 0.018
            ctx.beginPath()
            ctx.arc(cx, mouthY - W * 0.03, W * 0.065, Math.PI * 0.15, Math.PI * 0.85)
            ctx.stroke()
            break
            
          case 'surprised':
            // O mouth
            ctx.fillStyle = colors.eye
            ctx.beginPath()
            ctx.ellipse(cx, mouthY + W * 0.01, W * 0.035, W * 0.045, 0, 0, Math.PI * 2)
            ctx.fill()
            break
            
          case 'speaking':
            // Animated speaking
            const mouthOpen = Math.abs(Math.sin(t * 0.2)) * W * 0.025 + W * 0.015
            ctx.fillStyle = colors.eye
            ctx.beginPath()
            ctx.ellipse(cx, mouthY, W * 0.04, mouthOpen, 0, 0, Math.PI * 2)
            ctx.fill()
            break
            
          case 'love':
            // Shy smile
            ctx.strokeStyle = '#c85a7a'
            ctx.lineWidth = W * 0.015
            ctx.beginPath()
            ctx.arc(cx, mouthY - W * 0.015, W * 0.045, Math.PI * 0.2, Math.PI * 0.8)
            ctx.stroke()
            // Blush
            ctx.fillStyle = 'rgba(255,150,180,0.35)'
            ctx.beginPath()
            ctx.ellipse(cx - W * 0.14, mouthY - W * 0.02, W * 0.04, W * 0.025, 0, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.ellipse(cx + W * 0.14, mouthY - W * 0.02, W * 0.04, W * 0.025, 0, 0, Math.PI * 2)
            ctx.fill()
            break
            
          case 'error':
            // Worried zigzag mouth
            ctx.strokeStyle = colors.eye
            ctx.lineWidth = W * 0.015
            ctx.beginPath()
            ctx.moveTo(cx - W * 0.06, mouthY)
            ctx.lineTo(cx - W * 0.025, mouthY - W * 0.015)
            ctx.lineTo(cx + W * 0.025, mouthY + W * 0.015)
            ctx.lineTo(cx + W * 0.06, mouthY)
            ctx.stroke()
            break
            
          case 'sleep':
            // Small peaceful smile
            ctx.strokeStyle = colors.eye
            ctx.lineWidth = W * 0.012
            ctx.beginPath()
            ctx.arc(cx, mouthY - W * 0.025, W * 0.035, Math.PI * 0.25, Math.PI * 0.75)
            ctx.stroke()
            break
            
          case 'wink':
            // Playful smirk
            ctx.strokeStyle = colors.eye
            ctx.lineWidth = W * 0.016
            ctx.beginPath()
            ctx.arc(cx + W * 0.02, mouthY - W * 0.02, W * 0.05, Math.PI * 0.1, Math.PI * 0.7)
            ctx.stroke()
            break

          case 'evil':
            // Evil grin
            ctx.strokeStyle = '#dc2626'
            ctx.lineWidth = W * 0.02
            ctx.beginPath()
            ctx.arc(cx, mouthY - W * 0.01, W * 0.07, Math.PI * 0.1, Math.PI * 0.9)
            ctx.stroke()
            // Fangs
            ctx.fillStyle = '#fff'
            ctx.beginPath()
            ctx.moveTo(cx - W * 0.04, mouthY - W * 0.02)
            ctx.lineTo(cx - W * 0.03, mouthY + W * 0.03)
            ctx.lineTo(cx - W * 0.02, mouthY - W * 0.02)
            ctx.fill()
            ctx.beginPath()
            ctx.moveTo(cx + W * 0.02, mouthY - W * 0.02)
            ctx.lineTo(cx + W * 0.03, mouthY + W * 0.03)
            ctx.lineTo(cx + W * 0.04, mouthY - W * 0.02)
            ctx.fill()
            break

          case 'eating': {
            // Chewing mouth (animated) — wider open when chewing
            const chew = Math.abs(Math.sin(t * 0.15)) * W * 0.022
            ctx.fillStyle = colors.eye
            ctx.beginPath()
            ctx.ellipse(cx, mouthY, W * 0.04, W * 0.018 + chew, 0, 0, Math.PI * 2)
            ctx.fill()
            // Short noodle strand dangling close to mouth (bowl held close)
            ctx.strokeStyle = '#f5deb3'
            ctx.lineWidth = W * 0.013
            ctx.lineCap = 'round'
            ctx.beginPath()
            ctx.moveTo(cx - W * 0.01, mouthY + W * 0.01)
            ctx.quadraticCurveTo(
              cx - W * 0.04, mouthY + W * 0.035,
              cx - W * 0.07, mouthY + W * 0.025 + Math.sin(t * 0.12) * W * 0.015
            )
            ctx.stroke()
            // Steam wisps near mouth
            for (let si = 0; si < 2; si++) {
              const sa = 0.18 + Math.sin(t * 0.07 + si * 1.5) * 0.08
              ctx.strokeStyle = `rgba(200,200,200,${sa})`
              ctx.lineWidth = W * 0.008
              ctx.beginPath()
              ctx.moveTo(cx - W * 0.06 + si * W * 0.06, mouthY - W * 0.02)
              ctx.quadraticCurveTo(
                cx - W * 0.06 + si * W * 0.06 + Math.sin(t * 0.1 + si) * W * 0.025,
                mouthY - W * 0.07,
                cx - W * 0.06 + si * W * 0.06 + Math.sin(t * 0.08 + si + 1) * W * 0.02,
                mouthY - W * 0.12
              )
              ctx.stroke()
            }
            break
          }

          case 'drinking': {
            const isDrinking = globalCycle < 120
            const isAhhh = globalCycle >= 120 && globalCycle < 180
            const isWiping = globalCycle >= 180

            if (isDrinking) {
              // Drinking mouth - small O tightly on spout
              ctx.fillStyle = colors.eye
              ctx.beginPath()
              ctx.ellipse(cx, mouthY, W * 0.02, W * 0.025, 0, 0, Math.PI * 2)
              ctx.fill()
            } else if (isAhhh) {
              // Ahhh mouth - big happy open smile
              ctx.fillStyle = colors.eye
              ctx.beginPath()
              ctx.arc(cx, mouthY - W * 0.01, W * 0.07, 0, Math.PI, false)
              ctx.fill()
              // Sparkles!
              const sparkPositions = [ { dx: -W * 0.18, dy: -W * 0.06 }, { dx: W * 0.18, dy: -W * 0.06 } ]
              sparkPositions.forEach((sp, i) => {
                const alpha = Math.max(0, 1 - (globalCycle - 120)/60)
                const sr = W * 0.025
                ctx.save()
                ctx.fillStyle = `rgba(216,180,254,${alpha})`
                ctx.translate(cx + sp.dx, mouthY + sp.dy)
                ctx.rotate(t * 0.05 + i)
                ctx.beginPath()
                for (let pi = 0; pi < 4; pi++) {
                  const a = (pi / 4) * Math.PI * 2; const a2 = ((pi + 0.5) / 4) * Math.PI * 2
                  ctx.lineTo(Math.cos(a) * sr, Math.sin(a) * sr)
                  ctx.lineTo(Math.cos(a2) * sr * 0.3, Math.sin(a2) * sr * 0.3)
                }
                ctx.fill()
                ctx.restore()
              })
            } else if (isWiping) {
              // Wiping milky mouth
              ctx.strokeStyle = colors.eye
              ctx.lineWidth = W * 0.016
              ctx.lineCap = 'round'
              ctx.beginPath()
              ctx.arc(cx, mouthY - W * 0.015, W * 0.045, Math.PI * 0.2, Math.PI * 0.8)
              ctx.stroke()

              // Milk mustache droplet gets wiped away
              const wipeProgress = (globalCycle - 180)/60
              if (wipeProgress < 0.6) {
                // Diminish opacity as hand passes it
                ctx.fillStyle = `rgba(255,255,255,${1 - wipeProgress * 1.5})`
                ctx.beginPath()
                ctx.ellipse(cx + W * 0.05, mouthY, W * 0.02, W * 0.012, 0, 0, Math.PI * 2)
                ctx.fill()
              }
                
              if (wipeProgress < 0.9) {
                // Larger sweeping hand
                const hx = cx + W * 0.18 - wipeProgress * W * 0.3
                const hy = mouthY + W * 0.05 - Math.sin(wipeProgress * Math.PI) * W * 0.06
                ctx.fillStyle = '#e9d5ff'
                ctx.beginPath()
                ctx.ellipse(hx, hy, W * 0.05, W * 0.06, Math.PI/6, 0, Math.PI * 2)
                ctx.fill()
                ctx.strokeStyle = '#c4b5fd'
                ctx.lineWidth = 2
                ctx.stroke()
              }
            }
            break
          }
            
          default:
            // Neutral soft smile
            ctx.strokeStyle = colors.eye
            ctx.lineWidth = W * 0.014
            ctx.beginPath()
            ctx.arc(cx, mouthY - W * 0.02, W * 0.04, Math.PI * 0.2, Math.PI * 0.8)
            ctx.stroke()
        }
      }
      
      drawMouth()

      // === FLOATING PARTICLES (Viral sparkle effect) ===
      if (state !== 'sleep' && W >= 48) {
        const particleCount = state === 'celebrating' ? 12 : state === 'happy' ? 8 : 6
        const particles = Array.from({ length: particleCount }, (_, i) => ({
          angle: (i / particleCount) * Math.PI * 2,
          dist: 0.38 + Math.sin(i * 1.7) * 0.08,
          size: 0.018 + Math.sin(i * 2.3) * 0.008,
          speed: 0.018 + (i % 3) * 0.008,
        }))

        particles.forEach((p, i) => {
          const a = t * p.speed * moodSpeed + p.angle
          const d = W * (p.dist + Math.sin(t * 0.025 + i) * 0.05)
          const px = cx + Math.cos(a) * d
          const py = oy + Math.sin(a * 0.7) * d * 0.5
          const pr = W * p.size * (state === 'celebrating' ? 1.3 : 1)
          
          const alpha = 0.3 + Math.sin(t * 0.04 + i * 0.8) * 0.25
          
          // Sparkle gradient
          const sparkle = ctx.createRadialGradient(px, py, 0, px, py, pr * 2)
          sparkle.addColorStop(0, `rgba(210,190,255,${alpha})`)
          sparkle.addColorStop(0.5, `rgba(180,160,240,${alpha * 0.5})`)
          sparkle.addColorStop(1, 'rgba(180,160,240,0)')
          
          ctx.fillStyle = sparkle
          ctx.beginPath()
          ctx.arc(px, py, pr * 2, 0, Math.PI * 2)
          ctx.fill()

          // Inner bright core
          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.8})`
          ctx.beginPath()
          ctx.arc(px, py, pr * 0.5, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      // === THINKING DOTS ===
      if (state === 'thinking') {
        const dotCount = 3
        Array.from({ length: dotCount }).forEach((_, i) => {
          const baseY = oy + W * 0.22
          const dotY = baseY + Math.sin(t * 0.12 + i * 1.2) * W * 0.03
          const dotX = cx + (i - 1) * W * 0.08
          const alpha = 0.5 + Math.sin(t * 0.12 + i * 1.2) * 0.4
          const dotR = W * 0.022 * (1 + Math.sin(t * 0.12 + i * 1.2) * 0.2)

          ctx.fillStyle = `rgba(155,123,234,${alpha})`
          ctx.beginPath()
          ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      // === SLEEP ZZZ ===
      if (state === 'sleep') {
        const zzzs = ['z', 'Z', 'Z']
        zzzs.forEach((z, i) => {
          const zx = cx + W * 0.22 + i * W * 0.08
          const zy = oy - W * 0.15 - i * W * 0.1 + Math.sin(t * 0.03 + i) * W * 0.02
          const alpha = 0.3 + i * 0.15
          const fontSize = (W * 0.08 + i * W * 0.025)
          
          ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`
          ctx.fillStyle = `rgba(130,110,200,${alpha})`
          ctx.textAlign = 'center'
          ctx.fillText(z, zx, zy)
        })
      }

      // === CELEBRATION CONFETTI ===
      if (state === 'celebrating') {
        const confettiColors = ['#ff6b8a', '#ffd166', '#06d6a0', '#118ab2', '#9b5de5']
        Array.from({ length: 8 }).forEach((_, i) => {
          const angle = (i / 8) * Math.PI * 2 + t * 0.02
          const dist = W * (0.5 + Math.sin(t * 0.05 + i) * 0.1)
          const px = cx + Math.cos(angle) * dist
          const py = oy + Math.sin(angle) * dist * 0.6 - Math.abs(Math.sin(t * 0.04 + i)) * W * 0.15
          
          ctx.fillStyle = confettiColors[i % confettiColors.length]
          ctx.save()
          ctx.translate(px, py)
          ctx.rotate(t * 0.05 + i)
          ctx.fillRect(-W * 0.015, -W * 0.025, W * 0.03, W * 0.05)
          ctx.restore()
        })
      }

      frameRef.current++
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [size, state, mood, getColors])

  // Heart drawing helper
  const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    ctx.fillStyle = color
    ctx.beginPath()
    const s = size / 2
    ctx.moveTo(x, y + s * 0.3)
    ctx.bezierCurveTo(x, y - s * 0.1, x - s * 0.5, y - s * 0.4, x - s * 0.5, y - s * 0.1)
    ctx.bezierCurveTo(x - s * 0.5, y + s * 0.15, x, y + s * 0.45, x, y + s * 0.6)
    ctx.bezierCurveTo(x, y + s * 0.45, x + s * 0.5, y + s * 0.15, x + s * 0.5, y - s * 0.1)
    ctx.bezierCurveTo(x + s * 0.5, y - s * 0.4, x, y - s * 0.1, x, y + s * 0.3)
    ctx.fill()
  }

  const handleMouseEnter = () => {
    if (interactive) hoverRef.current = true
  }

  const handleMouseLeave = () => {
    hoverRef.current = false
  }

  const handleClick = () => {
    if (interactive) {
      clickAnimRef.current = 15
    }
    onClick?.()
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={cn(
        'zero-mascot-enter transition-transform duration-200',
        interactive && 'cursor-pointer',
        className
      )}
      style={{ imageRendering: 'auto' }}
      aria-label="Zero AI mascot"
      role={interactive ? 'button' : 'img'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    />
  )
}
