'use client'

import { useEffect, useRef } from 'react'

interface RamenBowlProps {
  size?: number
  animated?: boolean
}

export function RamenBowl({ size = 100, animated = true }: RamenBowlProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = size * 2
    const H = size * 2
    canvas.width = W
    canvas.height = H

    let frame = 0
    let animationId: number

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const t = frame * 0.03

      const cx = W / 2
      // Bowl held higher/closer — move cy up and inward
      const cy = H * 0.52
      const bowlWidth = W * 0.72
      const bowlHeight = H * 0.32

      // Steam wisps — wavy curling steam
      if (animated) {
        for (let i = 0; i < 4; i++) {
          const steamPhase = (t * 18 + i * 22) % 50
          const steamAlpha = Math.max(0, 0.35 - steamPhase / 100)
          const steamX = cx - bowlWidth * 0.18 + i * bowlWidth * 0.12
          const steamY = cy - bowlHeight * 0.85 - steamPhase
          const sway = Math.sin(t * 1.8 + i * 1.4) * 6
          ctx.strokeStyle = `rgba(210,210,210,${steamAlpha})`
          ctx.lineWidth = 3 + Math.sin(t + i) * 1
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(steamX, steamY + steamPhase)
          ctx.quadraticCurveTo(steamX + sway, steamY + steamPhase * 0.5, steamX - sway * 0.5, steamY)
          ctx.stroke()
        }
      }

      // Left arm (string connection)
      const lx = cx - bowlWidth / 2 + 2
      const ly = cy + bowlHeight * 0.42
      ctx.strokeStyle = '#c4b5fd'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(lx, ly)
      // curve sideways and up exactly into the left body edge coordinate (-4, 38)
      ctx.quadraticCurveTo(lx - 5, ly - 5, -4, 38)
      ctx.stroke()

      // Left hand — held close to bowl bottom
      ctx.fillStyle = '#e9d5ff'  // pale purple chibi hand
      ctx.beginPath()
      ctx.ellipse(lx, ly, 11, 16, -Math.PI / 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#c4b5fd'
      ctx.lineWidth = 1
      ctx.stroke()
      // Left thumb wrapping
      ctx.beginPath()
      ctx.ellipse(lx + 7, ly - 5, 5, 10, Math.PI / 4, 0, Math.PI * 2)
      ctx.fill()

      // Right arm (string connection)
      const handWaveY = animated ? Math.sin(t * 2) * 4 : 0
      const rx = cx + 22
      const ry = cy - bowlHeight * 0.85 + handWaveY

      ctx.strokeStyle = '#c4b5fd'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(rx, ry)
      // curve sideways and up exactly into the right body edge coordinate (W+4=92, 38)
      ctx.quadraticCurveTo(rx + 5, ry - 5, 92, 38)
      ctx.stroke()

      // Right hand holding chopsticks — closer/tighter arc
      ctx.fillStyle = '#e9d5ff'
      ctx.beginPath()
      ctx.ellipse(rx, ry, 12, 12, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#c4b5fd'
      ctx.lineWidth = 1
      ctx.stroke()

      // Chopsticks — angled almost straight down (close to mouth)
      ctx.strokeStyle = '#8B4513'
      ctx.lineWidth = 4
      ctx.lineCap = 'round'

      // Left chopstick
      ctx.beginPath()
      ctx.moveTo(cx + 17, cy - bowlHeight * 0.78 + handWaveY)
      ctx.lineTo(cx - 3, cy - bowlHeight * 0.28)
      ctx.stroke()

      // Right chopstick
      ctx.beginPath()
      ctx.moveTo(cx + 27, cy - bowlHeight * 0.88 + handWaveY)
      ctx.lineTo(cx + 7, cy - bowlHeight * 0.28)
      ctx.stroke()

      // Noodles being lifted — continuous exactly to the mouth
      ctx.strokeStyle = '#F5DEB3'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'

      const noodleWave = animated ? Math.sin(t * 2) * 3 : 0
      const startY = cy - bowlHeight * 0.28

      // Calculate exact mouth position relative to this canvas.
      // Top of canvas is roughly Y=44 in parent, mascot mouth is Y=76 in parent.
      // This means mouth is EXACTLY at Y=32 in this local canvas.
      const mouthYLocal = 32
      const noodleLen = startY - mouthYLocal // Distance from bowl to mouth

      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        const startX = cx - 6 + i * 3
        ctx.moveTo(startX, startY)

        for (let y = 0; y <= noodleLen; y += 4) {
          // decrease wave amplitude as it gets closer to mouth
          const amplitude = (1 - (y / noodleLen)) * (4 + noodleWave)
          const waveX = Math.sin((y / 8) + t * 3 + i) * amplitude
          ctx.lineTo(startX + waveX, startY - y)
        }
        ctx.stroke()
      }

      // Bowl - outer rim
      const rimGrad = ctx.createLinearGradient(cx - bowlWidth / 2, cy, cx + bowlWidth / 2, cy)
      rimGrad.addColorStop(0, '#87CEEB')
      rimGrad.addColorStop(0.5, '#B0E0E6')
      rimGrad.addColorStop(1, '#87CEEB')
      ctx.fillStyle = rimGrad
      ctx.beginPath()
      ctx.ellipse(cx, cy - bowlHeight * 0.15, bowlWidth / 2, bowlHeight * 0.25, 0, 0, Math.PI * 2)
      ctx.fill()

      // Bowl body
      const bowlGrad = ctx.createLinearGradient(cx, cy, cx, cy + bowlHeight)
      bowlGrad.addColorStop(0, '#87CEEB')
      bowlGrad.addColorStop(0.5, '#5F9EA0')
      bowlGrad.addColorStop(1, '#4682B4')
      ctx.fillStyle = bowlGrad
      ctx.beginPath()
      ctx.moveTo(cx - bowlWidth / 2, cy)
      ctx.quadraticCurveTo(cx - bowlWidth / 2 + 10, cy + bowlHeight, cx, cy + bowlHeight * 0.9)
      ctx.quadraticCurveTo(cx + bowlWidth / 2 - 10, cy + bowlHeight, cx + bowlWidth / 2, cy)
      ctx.closePath()
      ctx.fill()

      // Broth
      ctx.fillStyle = '#CD853F'
      ctx.globalAlpha = 0.8
      ctx.beginPath()
      ctx.ellipse(cx, cy, bowlWidth / 2 - 8, bowlHeight * 0.2, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      // Noodles in bowl
      ctx.strokeStyle = '#F5DEB3'
      ctx.lineWidth = 2
      for (let i = 0; i < 8; i++) {
        ctx.beginPath()
        const startX = cx - bowlWidth * 0.3 + i * 10
        ctx.moveTo(startX, cy - 5)
        for (let x = 0; x < 30; x += 3) {
          const waveY = Math.sin((x / 5) + i) * 3
          ctx.lineTo(startX + x, cy - 5 + waveY)
        }
        ctx.stroke()
      }

      // Egg (half)
      ctx.fillStyle = '#FFFACD'
      ctx.beginPath()
      ctx.ellipse(cx + bowlWidth * 0.2, cy - 5, 12, 8, 0.3, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#FFA500'
      ctx.beginPath()
      ctx.arc(cx + bowlWidth * 0.2 + 2, cy - 5, 5, 0, Math.PI * 2)
      ctx.fill()

      // Green onion
      ctx.fillStyle = '#228B22'
      ctx.beginPath()
      ctx.arc(cx - bowlWidth * 0.15, cy - 8, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx - bowlWidth * 0.22, cy - 3, 3, 0, Math.PI * 2)
      ctx.fill()

      // Naruto (fish cake)
      ctx.fillStyle = '#FFF0F5'
      ctx.beginPath()
      ctx.arc(cx - bowlWidth * 0.05, cy - 2, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#FF69B4'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(cx - bowlWidth * 0.05, cy - 2, 4, 0, Math.PI * 2)
      ctx.stroke()

      // Bowl pattern (decorative line)
      ctx.strokeStyle = '#4169E1'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx - bowlWidth / 2 + 15, cy + bowlHeight * 0.3)
      ctx.quadraticCurveTo(cx, cy + bowlHeight * 0.4, cx + bowlWidth / 2 - 15, cy + bowlHeight * 0.3)
      ctx.stroke()

      frame++
      animationId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animationId)
  }, [size, animated])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="drop-shadow-lg"
    />
  )
}
