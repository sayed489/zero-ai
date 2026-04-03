'use client'

import { useEffect, useRef } from 'react'

interface MilkBoxProps {
  size?: number
  animated?: boolean
}

export function MilkBox({ size = 80, animated = true }: MilkBoxProps) {
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

    let animationId: number

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // Use global performance.now() to sync with ZeroMascot
      const t = performance.now() / 16.66
      const cycle = Math.floor(t) % 240

      const isDrinking = cycle < 120
      const isWiping = cycle > 180

      // Lift animation
      let liftY = 0
      let tilt = 0
      const maxLift = -size * 0.4
      if (isDrinking) {
        if (cycle < 20) liftY = maxLift * (cycle / 20)
        else if (cycle > 100) liftY = maxLift * ((120 - cycle) / 20)
        else {
          liftY = maxLift
          tilt = -0.3 + Math.sin(t * 0.1) * 0.05
        }
      }

      ctx.save()
      const cx = W / 2
      // Maintain distance to bottom so position on page doesn't shift
      const cy = H - size * 0.77 
      ctx.translate(cx, cy + liftY)
      ctx.rotate(tilt)

      // ── Core measurements for 3D isometric look ──
      const bw = size * 0.9    
      const bh = size * 1.056  
      const sd = size * 0.4    

      // Draw shadow (translate back down to the floor)
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.beginPath()
      // Shadow doesn't perfectly follow tilt/lift, counter rotate/translate
      ctx.save()
      ctx.rotate(-tilt)
      ctx.ellipse(0, bh / 2 + 5 - liftY, bw, 8, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // 1. Right Side Face (Darker Blue)
      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.moveTo(bw / 2, -bh / 2)
      ctx.lineTo(bw / 2 + sd, -bh / 2 - sd * 0.5)
      ctx.lineTo(bw / 2 + sd, bh / 2 - sd * 0.5)
      ctx.lineTo(bw / 2, bh / 2)
      ctx.fill()
      ctx.strokeStyle = '#2563eb'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // 2. Front Face (Light Blue)
      ctx.fillStyle = '#60a5fa'
      ctx.beginPath()
      ctx.moveTo(-bw / 2, -bh / 2)
      ctx.lineTo(bw / 2, -bh / 2)
      ctx.lineTo(bw / 2, bh / 2)
      ctx.lineTo(-bw / 2, bh / 2)
      ctx.fill()
      ctx.stroke()

      // 3. Top Roof - Front Triangle (White)
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.moveTo(-bw / 2, -bh / 2)
      ctx.lineTo(0, -bh / 2 - bw * 0.5)
      ctx.lineTo(bw / 2, -bh / 2)
      ctx.fill()
      ctx.strokeStyle = '#e2e8f0'
      ctx.stroke()

      // 4. Top Roof - Side Slant (Light Gray)
      ctx.fillStyle = '#f1f5f9'
      ctx.beginPath()
      ctx.moveTo(bw / 2, -bh / 2)
      ctx.lineTo(0, -bh / 2 - bw * 0.5)
      ctx.lineTo(sd, -bh / 2 - bw * 0.5 - sd * 0.5)
      ctx.lineTo(bw / 2 + sd, -bh / 2 - sd * 0.5)
      ctx.fill()
      ctx.stroke()

      // 5. Top Ridge / Spout (White)
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.moveTo(0, -bh / 2 - bw * 0.5)
      ctx.lineTo(sd, -bh / 2 - bw * 0.5 - sd * 0.5)
      ctx.lineTo(sd, -bh / 2 - bw * 0.5 - sd * 0.5 - 10)
      ctx.lineTo(0, -bh / 2 - bw * 0.5 - 10)
      ctx.fill()
      ctx.stroke()

      // "MILK" text on front face
      ctx.font = `900 ${size * 0.24}px Impact, system-ui, sans-serif`
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'

      // slight curve/warp to text
      ctx.save()
      ctx.translate(0, -bh * 0.1)
      ctx.fillText('MILK', 0, 0)
      // Small bottom squares
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(-bw * 0.35, bh * 0.2, size * 0.3, size * 0.36)
      ctx.restore()

      // ── Arm (smooth connected cloud arm) ──
      const hx = bw / 2 - 10
      const hy = bh / 2 - 5
      // Compute attachment to right side of Mascot (tucked closely inward).
      // Since we are inside translate/rotate, we counterbalance the lift to keep arm anchored exactly to body
      const absBodyAttachX = cx + size * 1.2
      const absBodyAttachY = cy - size * 0.1
      // Rotate and translate logic inverted so arm base point is fixed to canvas
      const sT = Math.sin(-tilt); const cT = Math.cos(-tilt);
      const shiftX = absBodyAttachX - cx
      const shiftY = absBodyAttachY - (cy + liftY)
      const attachX = shiftX * cT - shiftY * sT
      const attachY = shiftX * sT + shiftY * cT

      const armBounce = isDrinking && cycle >= 20 && cycle <= 100 ? Math.sin(t * 0.5) * 3 : 0

      // "C" on vertical axis (sleeping) -> Pronounced downward U-bend for elbow
      const cpX = attachX + size * 0.1 // Push elbow slightly outwards for puffiness
      const cpY = Math.max(attachY, hy) + size * 0.8 // Curve downward towards body

      ctx.strokeStyle = '#e9d5ff'
      ctx.lineWidth = 14
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(attachX, attachY)
      // Dynamic bouncing arm
      ctx.quadraticCurveTo(cpX, cpY + armBounce, hx, hy)
      ctx.stroke()

      ctx.strokeStyle = '#f3e8ff'
      ctx.lineWidth = 10
      ctx.beginPath()
      ctx.moveTo(attachX, attachY)
      ctx.quadraticCurveTo(cpX, cpY + armBounce, hx, hy)
      ctx.stroke()

      // ── Hand holding milk box (made smaller) ──
      ctx.fillStyle = '#e9d5ff'
      ctx.beginPath()
      ctx.ellipse(bw / 2 - 10, bh / 2 - 5, 10, 15, Math.PI / 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#c4b5fd'
      ctx.lineWidth = 1.5
      ctx.stroke()
      // Thumb (made smaller)
      ctx.beginPath()
      ctx.ellipse(bw / 2 - 18, bh / 2 - 15, 4, 8, Math.PI / 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()

      // Milk drops when drinking
      if (isDrinking && cycle > 20 && cycle < 100 && animated) {
        const dropProgress = (t * 2) % 40
        ctx.fillStyle = 'rgba(255,255,255,0.8)'
        ctx.beginPath()
        ctx.ellipse(cx - 5, cy + liftY - bh / 2 - bw * 0.5 + dropProgress, 3, 5, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animationId)
  }, [size, animated])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size * 2, height: size * 2 }}
      className="drop-shadow-xl saturate-150"
    />
  )
}
