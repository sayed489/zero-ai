'use client'

import { useState } from 'react'
import { Download, Maximize2, X, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageGenerationProps {
  prompt: string
  imageUrl?: string
  isGenerating?: boolean
  onRegenerate?: () => void
}

export function ImageGeneration({
  prompt,
  imageUrl,
  isGenerating = false,
  onRegenerate,
}: ImageGenerationProps) {
  const [fullscreen, setFullscreen] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleDownload = async () => {
    if (!imageUrl) return

    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `zero-ai-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  if (isGenerating) {
    return (
      <div className="my-4 overflow-hidden rounded-2xl border border-border bg-bg-1">
        <div className="flex items-center gap-2 border-b border-border bg-bg-2 px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-sm font-medium text-text-1">Generating image...</span>
        </div>
        <div className="flex aspect-square max-h-96 items-center justify-center bg-bg-0">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-zero-300" />
            <p className="max-w-xs text-center text-sm text-text-2">{prompt}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="my-4 overflow-hidden rounded-2xl border border-border bg-bg-1">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-bg-2 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-text-1">Generated Image</span>
          </div>
          <div className="flex items-center gap-2">
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-text-2 transition-colors hover:bg-bg-3 hover:text-text-1"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </button>
            )}
            <button
              onClick={() => setFullscreen(true)}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-text-2 transition-colors hover:bg-bg-3 hover:text-text-1"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Fullscreen
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-text-2 transition-colors hover:bg-bg-3 hover:text-text-1"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          </div>
        </div>

        {/* Prompt */}
        <div className="border-b border-border bg-bg-1 px-4 py-3">
          <p className="text-sm text-text-2 italic">{'"'}{prompt}{'"'}</p>
        </div>

        {/* Image */}
        <div className="relative bg-bg-0">
          {imageError ? (
            <div className="flex aspect-square max-h-96 items-center justify-center">
              <p className="text-text-3">Failed to load image</p>
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={prompt}
              className="aspect-square max-h-96 w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex aspect-square max-h-96 items-center justify-center">
              <p className="text-text-3">No image available</p>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setFullscreen(false)}
        >
          <button
            onClick={() => setFullscreen(false)}
            className="absolute right-4 top-4 rounded-lg p-2 text-white hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={imageUrl}
            alt={prompt}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
