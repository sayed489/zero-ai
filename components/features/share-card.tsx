'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Download, Copy, Check } from 'lucide-react'
import { truncate } from '@/lib/utils'

interface ShareCardProps {
  content: string
  onClose: () => void
}

export function ShareCard({ content, onClose }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const W = 600
    const H = 400
    canvas.width = W
    canvas.height = H

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, W, H)
    gradient.addColorStop(0, '#1a1a1e')
    gradient.addColorStop(1, '#0e0e10')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, W, H)

    // Violet glow
    const glowGradient = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.6)
    glowGradient.addColorStop(0, 'rgba(196,168,240,0.15)')
    glowGradient.addColorStop(1, 'rgba(196,168,240,0)')
    ctx.fillStyle = glowGradient
    ctx.fillRect(0, 0, W, H)

    // Draw mascot placeholder (simplified cloud)
    ctx.fillStyle = 'rgba(215,198,254,0.9)'
    ctx.beginPath()
    ctx.arc(50, 50, 20, 0, Math.PI * 2)
    ctx.fill()

    // Draw eyes
    ctx.fillStyle = 'rgba(88,62,150,0.9)'
    ctx.beginPath()
    ctx.arc(45, 48, 3, 0, Math.PI * 2)
    ctx.arc(55, 48, 3, 0, Math.PI * 2)
    ctx.fill()

    // Brand name
    ctx.fillStyle = '#eeecf5'
    ctx.font = '500 18px Geist, sans-serif'
    ctx.fillText('Zero AI', 80, 55)

    // Content
    const displayContent = truncate(content, 200)
    ctx.fillStyle = '#eeecf5'
    ctx.font = '400 16px Geist, sans-serif'
    
    // Word wrap
    const words = displayContent.split(' ')
    let line = ''
    let y = 120
    const maxWidth = W - 80
    const lineHeight = 26

    for (const word of words) {
      const testLine = line + word + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line.trim(), 40, y)
        line = word + ' '
        y += lineHeight
        if (y > H - 80) break
      } else {
        line = testLine
      }
    }
    if (y <= H - 80) {
      ctx.fillText(line.trim(), 40, y)
    }

    // Domain
    ctx.fillStyle = '#8884a0'
    ctx.font = '400 14px Geist, sans-serif'
    ctx.fillText('zero-ai.tech', W - 100, H - 30)

    // Border
    ctx.strokeStyle = 'rgba(196,168,240,0.3)'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, W, H)
  }, [content])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'zero-ai-share.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleCopy = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png')
      })
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy image:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-bg-1 p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-text-1">Share this response</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-2 hover:bg-bg-2 hover:text-text-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Canvas preview */}
        <div className="mb-4 overflow-hidden rounded-xl border border-border">
          <canvas ref={canvasRef} className="w-full" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-2 transition-colors hover:bg-bg-2 hover:text-text-1"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy to clipboard
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-lg bg-zero-300 px-4 py-2 text-sm font-medium text-bg-0 transition-colors hover:bg-zero-400"
          >
            <Download className="h-4 w-4" />
            Download PNG
          </button>
        </div>
      </div>
    </div>
  )
}
