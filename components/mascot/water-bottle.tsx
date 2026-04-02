'use client'

import { useEffect, useRef } from 'react'

interface WaterBottleProps {
  size?: number
  animated?: boolean
}

export function WaterBottle({ size = 80, animated = true }: WaterBottleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = size * 2
    const H = size * 2.5
    canvas.width = W
    canvas.height = H

    let frame = 0
    let animationId: number

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const t = frame * 0.05

      const cx = W / 2
      const bottleWidth = W * 0.5
      const bottleHeight = H * 0.7
      const capHeight = H * 0.15
      const neckWidth = bottleWidth * 0.4

      // Glow effect
      const glow = ctx.createRadialGradient(cx, H * 0.5, 0, cx, H * 0.5, bottleWidth)
      glow.addColorStop(0, 'rgba(96,165,250,0.3)')
      glow.addColorStop(1, 'rgba(96,165,250,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.ellipse(cx, H * 0.55, bottleWidth * 1.2, bottleHeight * 0.7, 0, 0, Math.PI * 2)
      ctx.fill()

      // Cap
      const capGrad = ctx.createLinearGradient(cx - neckWidth/2, H * 0.08, cx + neckWidth/2, H * 0.08)
      capGrad.addColorStop(0, '#3b82f6')
      capGrad.addColorStop(0.5, '#60a5fa')
      capGrad.addColorStop(1, '#2563eb')
      ctx.fillStyle = capGrad
      ctx.beginPath()
      ctx.roundRect(cx - neckWidth/2, H * 0.05, neckWidth, capHeight, [6, 6, 0, 0])
      ctx.fill()

      // Neck
      ctx.fillStyle = 'rgba(147,197,253,0.9)'
      ctx.beginPath()
      ctx.roundRect(cx - neckWidth/2, H * 0.18, neckWidth, H * 0.08, 2)
      ctx.fill()

      // Bottle body
      const bodyGrad = ctx.createLinearGradient(cx - bottleWidth/2, H * 0.25, cx + bottleWidth/2, H * 0.25)
      bodyGrad.addColorStop(0, 'rgba(147,197,253,0.85)')
      bodyGrad.addColorStop(0.3, 'rgba(191,219,254,0.9)')
      bodyGrad.addColorStop(0.7, 'rgba(147,197,253,0.85)')
      bodyGrad.addColorStop(1, 'rgba(96,165,250,0.8)')
      ctx.fillStyle = bodyGrad

      ctx.beginPath()
      ctx.moveTo(cx - neckWidth/2, H * 0.26)
      ctx.lineTo(cx - bottleWidth/2, H * 0.35)
      ctx.lineTo(cx - bottleWidth/2, H * 0.9)
      ctx.quadraticCurveTo(cx - bottleWidth/2, H * 0.95, cx - bottleWidth/2 + 10, H * 0.95)
      ctx.lineTo(cx + bottleWidth/2 - 10, H * 0.95)
      ctx.quadraticCurveTo(cx + bottleWidth/2, H * 0.95, cx + bottleWidth/2, H * 0.9)
      ctx.lineTo(cx + bottleWidth/2, H * 0.35)
      ctx.lineTo(cx + neckWidth/2, H * 0.26)
      ctx.closePath()
      ctx.fill()

      // Water inside with wave animation
      if (animated) {
        const waterLevel = H * 0.4
        const waveHeight = 4
        
        ctx.fillStyle = 'rgba(59,130,246,0.6)'
        ctx.beginPath()
        ctx.moveTo(cx - bottleWidth/2 + 5, H * 0.9)
        
        // Wave at top
        for (let x = cx - bottleWidth/2 + 5; x <= cx + bottleWidth/2 - 5; x += 2) {
          const wave = Math.sin((x / 15) + t) * waveHeight
          ctx.lineTo(x, waterLevel + wave)
        }
        
        ctx.lineTo(cx + bottleWidth/2 - 5, H * 0.9)
        ctx.closePath()
        ctx.fill()

        // Bubbles
        for (let i = 0; i < 3; i++) {
          const bubbleX = cx + Math.sin(t + i * 2) * (bottleWidth * 0.2)
          const bubbleY = H * 0.5 + ((t * 20 + i * 40) % (H * 0.4))
          const bubbleR = 3 + Math.sin(t + i) * 1
          
          ctx.fillStyle = 'rgba(255,255,255,0.6)'
          ctx.beginPath()
          ctx.arc(bubbleX, bubbleY, bubbleR, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Hand holding the bottle
      ctx.fillStyle = '#FFCDB2' // Skin tone
      ctx.beginPath()
      ctx.ellipse(cx - bottleWidth/2, H * 0.65, 12, 18, -Math.PI / 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#E5989B'
      ctx.lineWidth = 1
      ctx.stroke()
      // Thumb wrapping front
      ctx.beginPath()
      ctx.ellipse(cx - bottleWidth/2 + 10, H * 0.55, 6, 14, Math.PI / 4, 0, Math.PI * 2)
      ctx.fill()

      // Highlight reflection
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.beginPath()
      ctx.ellipse(cx - bottleWidth * 0.25, H * 0.5, 4, 30, -0.2, 0, Math.PI * 2)
      ctx.fill()

      // Label
      ctx.fillStyle = 'rgba(59,130,246,0.3)'
      ctx.beginPath()
      ctx.roundRect(cx - bottleWidth/2 + 8, H * 0.55, bottleWidth - 16, H * 0.2, 4)
      ctx.fill()

      // Water drops falling (when drinking)
      if (animated) {
        const dropY = (t * 30) % (H * 0.3)
        ctx.fillStyle = 'rgba(96,165,250,0.7)'
        ctx.beginPath()
        ctx.ellipse(cx + bottleWidth * 0.3, H * 0.2 + dropY, 3, 5, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      frame++
      animationId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animationId)
  }, [size, animated])

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width: size, height: size * 1.25 }}
      className="drop-shadow-lg"
    />
  )
}
