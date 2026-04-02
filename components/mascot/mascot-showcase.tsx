'use client'

import { useState } from 'react'
import { ZeroMascot, type MascotState, type MascotMood } from './zero-mascot'
import { cn } from '@/lib/utils'

const states: MascotState[] = [
  'idle',
  'thinking',
  'happy',
  'speaking',
  'wink',
  'love',
  'surprised',
  'sleep',
  'celebrating',
  'error',
]

const moods: MascotMood[] = ['chill', 'energetic', 'sleepy', 'excited']

interface MascotShowcaseProps {
  className?: string
}

export function MascotShowcase({ className }: MascotShowcaseProps) {
  const [selectedState, setSelectedState] = useState<MascotState>('idle')
  const [selectedMood, setSelectedMood] = useState<MascotMood>('chill')

  return (
    <div className={cn('flex flex-col items-center gap-8 p-8', className)}>
      {/* Large featured mascot */}
      <div className="relative">
        <div className="absolute -inset-8 rounded-full bg-gradient-to-br from-zero-400/20 to-zero-600/10 blur-2xl" />
        <ZeroMascot 
          size={160} 
          state={selectedState} 
          mood={selectedMood}
          interactive
        />
      </div>

      {/* State selector */}
      <div className="flex flex-col items-center gap-3">
        <span className="text-text-2 text-sm font-medium">Expression</span>
        <div className="flex flex-wrap justify-center gap-2">
          {states.map((state) => (
            <button
              key={state}
              onClick={() => setSelectedState(state)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                'border border-stroke-1',
                selectedState === state
                  ? 'bg-zero-500 text-white border-zero-500'
                  : 'bg-bg-2 text-text-2 hover:bg-bg-3 hover:border-zero-300'
              )}
            >
              {state}
            </button>
          ))}
        </div>
      </div>

      {/* Mood selector */}
      <div className="flex flex-col items-center gap-3">
        <span className="text-text-2 text-sm font-medium">Mood</span>
        <div className="flex gap-2">
          {moods.map((mood) => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                'border border-stroke-1',
                selectedMood === mood
                  ? 'bg-zero-500 text-white border-zero-500'
                  : 'bg-bg-2 text-text-2 hover:bg-bg-3 hover:border-zero-300'
              )}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of all states */}
      <div className="mt-8">
        <h3 className="text-text-1 font-semibold mb-4 text-center">All Expressions</h3>
        <div className="grid grid-cols-5 gap-6">
          {states.map((state) => (
            <div key={state} className="flex flex-col items-center gap-2">
              <ZeroMascot 
                size={56} 
                state={state}
                mood={selectedMood}
                interactive
                onClick={() => setSelectedState(state)}
              />
              <span className="text-text-3 text-xs capitalize">{state}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
