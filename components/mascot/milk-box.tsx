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

    const W = size * 2
    const H = size * 2.2
    canvas.width = W
    canvas.height = H

    let animationId: number

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // Use global performance.now() to sync with ZeroMascot
      const t = performance.now() / 16.66

      // 4000ms cycle = 240 frames at 60fps. (sync exact same math in zero-mascot)
      const cycle = Math.floor(t) % 240

      // Phase 1 (0-120): Drinking (Box UP)
      // Phase 2 (120-180): Ahhh (Box DOWN)
      // Phase 3 (180-240): Wiping (Box DOWN)

      const isDrinking = cycle < 120
      const isWiping = cycle > 180

      // Lift animation
      let liftY = 0
      let tilt = 0
      if (isDrinking) {
        // smooth lift and hold
        if (cycle < 20) liftY = -25 * (cycle / 20)
        else if (cycle > 100) liftY = -25 * ((120 - cycle) / 20)
        else {
          liftY = -25
          tilt = -0.3 + Math.sin(t * 0.1) * 0.05 // gently tilt while drinking
        }
      }

      ctx.save()
      const cx = W / 2
      const cy = H * 0.65
      ctx.translate(cx, cy + liftY)
      ctx.rotate(tilt)

      // ── Core measurements for 3D isometric look ──
      const bw = W * 0.45    // front width
      const bh = H * 0.48    // body height
      const sd = W * 0.2     // side depth

      // Draw shadow
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.beginPath()
      ctx.ellipse(0, bh / 2 + 5, bw, 8, 0, 0, Math.PI * 2)
      ctx.fill()

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
      ctx.font = `900 ${W * 0.12}px Impact, system-ui, sans-serif`
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'

      // slight curve/warp to text
      ctx.save()
      ctx.translate(0, -bh * 0.1)
      ctx.fillText('MILK', 0, 0)
      // Small bottom squares (nutrition box representation)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(-bw * 0.35, bh * 0.2, W * 0.15, W * 0.18)
      ctx.restore()

      // ── Arm (string connection) ──
      ctx.strokeStyle = '#c4b5fd'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(bw / 2 - 10, bh / 2 - 5)
      // Curve sideways and up exactly into the puffy sides of the cloud
      // Needs to compensate for the rotation/translation. Exact calculated offset is (48, 2.7).
      ctx.quadraticCurveTo(bw / 2 + 10, -10, 48, 2.7)
      ctx.stroke()

      // ── Hand holding milk box ──
      ctx.fillStyle = '#e9d5ff'
      ctx.beginPath()
      ctx.ellipse(bw / 2 - 10, bh / 2 - 5, 14, 20, Math.PI / 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#c4b5fd'
      ctx.lineWidth = 1.5
      ctx.stroke()
      // Thumb
      ctx.beginPath()
      ctx.ellipse(bw / 2 - 18, bh / 2 - 15, 6, 12, Math.PI / 3, 0, Math.PI * 2)
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
      style={{ width: size, height: size * 1.1 }}
      className="drop-shadow-xl saturate-150"
    />
  )
}
