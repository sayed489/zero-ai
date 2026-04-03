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

    const W = size * 4
    const H = size * 4
    canvas.width = W
    canvas.height = H

    let frame = 0
    let animationId: number

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const t = frame * 0.03

      const cx = W / 2
      // Maintain distance to bottom so position on page doesn't shift
      const cy = H - size * 0.96 
      const bowlWidth = size * 1.8
      const bowlHeight = size * 0.8

      // Premium Steam Wisps
      if (animated) {
        for (let i = 0; i < 5; i++) {
          const phase = (t * 0.02 + i * 0.2) % 1
          const steamAlpha = Math.sin(phase * Math.PI) * 0.45
          const steamX = cx - bowlWidth * 0.25 + i * bowlWidth * 0.12
          const steamY = cy - bowlHeight * 0.5 - phase * 45
          
          ctx.strokeStyle = `rgba(255,255,255,${steamAlpha})`
          ctx.lineWidth = 5 + Math.sin(phase * Math.PI) * 4
          ctx.lineCap = 'round'
          
          ctx.beginPath()
          ctx.moveTo(steamX, steamY + 20)
          const s1 = Math.sin(t * 1.5 + i) * 12
          const s2 = Math.sin(t * 1.0 + i * 2) * 14
          ctx.bezierCurveTo(
            steamX + s1, steamY + 10,
            steamX - s2, steamY,
            steamX + s1 * 0.5, steamY - 15
          )
          ctx.stroke()
        }
      }

      // Left arm (thick connected cloud arm)
      const lx = cx - bowlWidth / 2 + 2
      const ly = cy + bowlHeight * 0.42

      // Exact mascot left shoulder connection (tucked inward closer to bowl)
      const attachLX = cx - size * 1.3
      const attachLY = cy - size * 0.1
      const armBounceLeft = animated ? Math.sin(t * 0.5) * 2 : 0

      // "C" on vertical axis (sleeping) -> Pronounced downward U-bend for left elbow
      const cpLX = attachLX - size * 0.1 // Curve outwards slightly for puffiness
      const cpLY = Math.max(attachLY, ly) + size * 0.8 // Sag downward

      ctx.strokeStyle = '#e9d5ff'
      ctx.lineWidth = 15
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(attachLX, attachLY)
      ctx.quadraticCurveTo(cpLX, cpLY + armBounceLeft, lx, ly)
      ctx.stroke()
      
      // highlight inner arm
      ctx.strokeStyle = '#f3e8ff'
      ctx.lineWidth = 9
      ctx.beginPath()
      ctx.moveTo(attachLX, attachLY)
      ctx.quadraticCurveTo(cpLX, cpLY + armBounceLeft, lx, ly)
      ctx.stroke()

      // Left hand — held close to bowl bottom (made smaller)
      ctx.fillStyle = '#e9d5ff'  
      ctx.beginPath()
      ctx.ellipse(lx, ly, 8, 12, -Math.PI / 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#c4b5fd'
      ctx.lineWidth = 1
      ctx.stroke()
      // Left thumb wrapping (made smaller)
      ctx.beginPath()
      ctx.ellipse(lx + 5, ly - 3, 3.5, 7, Math.PI / 4, 0, Math.PI * 2)
      ctx.fill()

      // Right arm (thick connected cloud arm)
      const handWaveY = animated ? Math.sin(t * 2) * 4 : 0
      const rx = cx + 22
      const ry = cy - bowlHeight * 0.85 + handWaveY

      // Exact mascot right shoulder connection (tucked inward closer to bowl)
      const attachRX = cx + size * 1.3
      const attachRY = cy - size * 0.1
      const armBounceRight = animated ? Math.sin(t * 0.5 + 1) * 2 : 0

      // "C" on vertical axis (sleeping) -> Pronounced downward U-bend for right elbow
      const cpRX = attachRX + size * 0.1 // Pushed slightly outward for puffiness
      const cpRY = Math.max(attachRY, ry) + size * 0.8 // U bend downwards

      ctx.strokeStyle = '#e9d5ff'
      ctx.lineWidth = 14
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(attachRX, attachRY)
      ctx.quadraticCurveTo(cpRX, cpRY + armBounceRight, rx - 2, ry)
      ctx.stroke()

      // highlight inner arm
      ctx.strokeStyle = '#f3e8ff'
      ctx.lineWidth = 8
      ctx.beginPath()
      ctx.moveTo(attachRX, attachRY)
      ctx.quadraticCurveTo(cpRX, cpRY + armBounceRight, rx - 2, ry)
      ctx.stroke()

      // Right hand holding chopsticks — closer/tighter arc (made smaller)
      ctx.fillStyle = '#e9d5ff'
      ctx.beginPath()
      ctx.ellipse(rx, ry, 9, 9, 0, 0, Math.PI * 2)
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

      // Noodles being lifted — juicy premium continuous flow exactly to the mouth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const noodleWave = animated ? Math.sin(t * 2) * 4 : 0
      const startY = cy - bowlHeight * 0.28
      // Fix cropping: map exact mouth position dynamically instead of hardcoded 32
      const mouthYLocal = cy - size * 0.31 
      const noodleLen = startY - mouthYLocal // Distance from bowl to mouth

      // Draw shadow behind lifted noodles first for 3D depth
      ctx.strokeStyle = 'rgba(205, 133, 63, 0.35)' // warm broth shadow
      ctx.lineWidth = 5
      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        const startX = cx - 6 + i * 3
        ctx.moveTo(startX, startY)
        for (let y = 0; y <= noodleLen; y += 4) {
          const amplitude = (1 - (y / noodleLen)) * (5 + noodleWave)
          const waveX = Math.sin((y / 10) + t * 2.5 + i * 1.2) * amplitude
          ctx.lineTo(startX + waveX, startY - y + 1) // slightly offset shadow
        }
        ctx.stroke()
      }

      // Draw vivid premium foreground noodles
      ctx.strokeStyle = '#FDECA6' // brighter rich pale-gold
      ctx.lineWidth = 3.5
      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        const startX = cx - 6 + i * 3
        ctx.moveTo(startX, startY)
        for (let y = 0; y <= noodleLen; y += 4) {
          const amplitude = (1 - (y / noodleLen)) * (5 + noodleWave)
          const waveX = Math.sin((y / 10) + t * 2.5 + i * 1.2) * amplitude
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
      style={{ width: size * 2, height: size * 2 }}
      className="drop-shadow-lg scale-[1.02]"
    />
  )
}
