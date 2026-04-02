'use client'

import { useState, useEffect } from 'react'
import { Download, Maximize2, Sparkles, X } from 'lucide-react'
import { ZeroMascot } from '@/components/mascot/zero-mascot'
import { cn } from '@/lib/utils'

interface ImageCardProps {
  imageUrl: string
  prompt?: string
}

export function ImageCard({ imageUrl, prompt }: ImageCardProps) {
  const [loading, setLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [progress, setProgress] = useState(0)

  // Simulate 3-5 second generation time
  useEffect(() => {
    setLoading(true)
    setProgress(0)
    setImageLoaded(false)
    
    const duration = 3000 + Math.random() * 2000
    const interval = 50
    const steps = duration / interval
    let step = 0
    
    const progressInterval = setInterval(() => {
      step++
      const rawProgress = step / steps
      const easedProgress = 1 - Math.pow(1 - rawProgress, 3)
      setProgress(Math.min(easedProgress * 100, 99))
      
      if (step >= steps) {
        clearInterval(progressInterval)
        setLoading(false)
        setProgress(100)
      }
    }, interval)
    
    return () => clearInterval(progressInterval)
  }, [imageUrl])

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `zero-ai-${Date.now()}.jpg`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <>
      <div className="mt-4 w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-br from-bg-1 to-bg-2 shadow-xl ring-1 ring-border/50">
        {/* Premium header with Zero mascot */}
        <div className="relative overflow-hidden bg-gradient-to-r from-zero-500/10 via-zero-400/5 to-zero-500/10 px-4 py-3">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Zero mascot as branding */}
              <div className="relative">
                <ZeroMascot size={28} state={loading ? 'thinking' : 'happy'} />
                {loading && (
                  <div className="absolute -inset-1 rounded-full bg-zero-400/20 animate-ping" style={{ animationDuration: '1.5s' }} />
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-text-1">Zero AI</span>
                  <Sparkles className="h-3 w-3 text-zero-400" />
                </div>
                <span className="text-[10px] text-text-3">
                  {loading ? 'Creating your image...' : 'Image ready'}
                </span>
              </div>
            </div>
            {!loading && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFullscreen(true)}
                  className="rounded-lg p-1.5 text-text-3 transition-all hover:bg-white/10 hover:text-text-1 hover:scale-105"
                  title="Fullscreen"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDownload}
                  className="rounded-lg p-1.5 text-text-3 transition-all hover:bg-white/10 hover:text-text-1 hover:scale-105"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          
          {/* Progress bar */}
          {loading && (
            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-zero-500 via-zero-400 to-zero-300 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1.5 text-center text-xs text-text-3">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}
        </div>

        {/* Image container */}
        <div className="relative aspect-square bg-bg-0">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4">
              <div className="relative">
                <ZeroMascot size={56} state="thinking" />
                <div className="absolute -inset-4 rounded-full bg-zero-400/10 animate-pulse" />
              </div>
              <p className="text-sm text-text-2">Crafting your masterpiece...</p>
              {prompt && (
                <p className="text-center text-xs text-text-3 line-clamp-2 max-w-48 italic">
                  &quot;{prompt.slice(0, 60)}...&quot;
                </p>
              )}
            </div>
          ) : (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-bg-1">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-zero-400 border-t-transparent" />
                </div>
              )}
              <img
                src={imageUrl}
                alt={prompt || 'Generated image'}
                className={cn(
                  'h-full w-full object-cover transition-all duration-500',
                  imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                )}
                onLoad={() => setImageLoaded(true)}
              />
              {/* Zero watermark */}
              {imageLoaded && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-1 backdrop-blur-sm">
                  <ZeroMascot size={14} state="idle" />
                  <span className="text-[9px] font-medium text-white/90">Zero AI</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => setFullscreen(false)}
        >
          <button
            onClick={() => setFullscreen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-all hover:bg-white/20 hover:scale-105"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
            className="absolute right-16 top-4 rounded-full bg-white/10 p-2 text-white transition-all hover:bg-white/20 hover:scale-105"
          >
            <Download className="h-5 w-5" />
          </button>
          <div className="relative">
            <img
              src={imageUrl}
              alt={prompt || 'Generated image'}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            {/* Zero branding on fullscreen */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
              <ZeroMascot size={18} state="idle" />
              <span className="text-xs font-medium text-white">Zero AI</span>
            </div>
          </div>
          {prompt && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-md rounded-full bg-black/60 px-5 py-2 backdrop-blur-sm">
              <p className="text-center text-sm text-white/80 line-clamp-1">{prompt}</p>
            </div>
          )}
        </div>
      )}
    </>
  )
}
