'use client'

import { useState, useEffect } from 'react'
import { ZeroMascot, type MascotState } from './zero-mascot'
import { cn } from '@/lib/utils'

interface HeroMascotProps {
  className?: string
  tagline?: string
  size?: number
}

export function HeroMascot({ 
  className,
  tagline = "Hey, I'm Zero!",
  size = 200
}: HeroMascotProps) {
  const [state, setState] = useState<MascotState>('idle')
  const [hasAnimated, setHasAnimated] = useState(false)

  // Entrance animation sequence
  useEffect(() => {
    if (hasAnimated) return
    
    const sequence: { state: MascotState; delay: number }[] = [
      { state: 'surprised', delay: 500 },
      { state: 'happy', delay: 1200 },
      { state: 'wink', delay: 2000 },
      { state: 'idle', delay: 2800 },
    ]

    sequence.forEach(({ state, delay }) => {
      setTimeout(() => setState(state), delay)
    })

    setHasAnimated(true)
  }, [hasAnimated])

  // Periodic expression changes
  useEffect(() => {
    const interval = setInterval(() => {
      const expressions: MascotState[] = ['idle', 'happy', 'wink', 'love', 'idle']
      const randomState = expressions[Math.floor(Math.random() * expressions.length)]
      setState(randomState)
      
      // Return to idle after a moment
      setTimeout(() => setState('idle'), 1500)
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={cn('relative flex flex-col items-center gap-6', className)}>
      {/* Animated background rings */}
      <div className="absolute inset-0 pointer-events-none">
        {[1, 2, 3].map((ring) => (
          <div
            key={ring}
            className={cn(
              'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
              'rounded-full border border-zero-400/20',
              'animate-ping-slow'
            )}
            style={{
              width: size * (1 + ring * 0.35),
              height: size * (1 + ring * 0.35),
              animationDelay: `${ring * 0.4}s`,
              animationDuration: '3s',
            }}
          />
        ))}
      </div>

      {/* Gradient glow */}
      <div 
        className="absolute rounded-full bg-gradient-to-br from-zero-400/30 via-zero-500/20 to-zero-600/10 blur-3xl"
        style={{
          width: size * 1.5,
          height: size * 1.5,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Mascot */}
      <div className="relative">
        <ZeroMascot 
          size={size}
          state={state}
          mood="excited"
          interactive
          onClick={() => {
            setState('celebrating')
            setTimeout(() => setState('happy'), 2000)
          }}
        />
      </div>

      {/* Tagline */}
      {tagline && (
        <div className="relative">
          <p className="text-2xl md:text-3xl font-bold text-text-1 text-balance text-center">
            {tagline}
          </p>
          <p className="text-text-2 text-center mt-2">
            Your AI-powered creative companion
          </p>
        </div>
      )}
    </div>
  )
}
