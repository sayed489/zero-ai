'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export type MascotState = 
  | 'idle' 
  | 'thinking' 
  | 'happy' 
  | 'sleepy' 
  | 'eating'
  | 'drinking'
  | 'raining'
  | 'thundering'
  | 'excited'
  | 'evil'
  | 'generating'

interface ZeroMascotProps {
  size?: number
  state?: MascotState
  mood?: 'chill' | 'energetic' | 'sleepy' | 'excited'
  interactive?: boolean
  evilMode?: boolean
  className?: string
  onClick?: () => void
}

export function ZeroMascot({
  size = 80,
  state = 'idle',
  mood = 'chill',
  interactive = true,
  evilMode = false,
  className = '',
  onClick,
}: ZeroMascotProps) {
  const [autoState, setAutoState] = useState<MascotState>(state)
  const [isWaking, setIsWaking] = useState(false)

  useEffect(() => {
    setAutoState(state)
  }, [state])

  // Get CSS animation classes based on state
  const getAnimationClass = () => {
    if (evilMode) return 'animate-pulse'
    
    switch (autoState) {
      case 'idle':
        return 'animate-bob'
      case 'thinking':
        return 'animate-pulse'
      case 'happy':
        return 'animate-bounce'
      case 'excited':
        return 'animate-bounce'
      case 'generating':
        return 'animate-pulse'
      default:
        return 'animate-bob'
    }
  }

  const renderCloud = () => {
    const cloudColor = evilMode ? '#1a0a2e' : '#c4b5fd'
    const eyeColor = evilMode ? '#dc2626' : '#4c3080'
    
    return (
      <svg
        viewBox="0 0 120 100"
        width={size}
        height={size}
        className={cn(getAnimationClass(), className)}
        onClick={onClick}
        style={{
          cursor: interactive ? 'pointer' : 'default',
          filter: evilMode ? 'drop-shadow(0 0 6px rgba(220, 38, 38, 0.5))' : undefined,
          imageRendering: 'crisp-edges'
        }}
      >
        {/* Cloud body - 3 bumps top, rounded bottom */}
        <defs>
          <style>{`
            @keyframes bob {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-6px); }
            }
            @keyframes blink {
              0%, 90%, 100% { transform: scaleY(1); }
              95% { transform: scaleY(0.1); }
            }
            @keyframes thinking {
              0%, 100% { transform: translateX(0px); }
              33% { transform: translateX(-4px); }
              66% { transform: translateX(4px); }
            }
            @keyframes pulse-soft {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.03); }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px); opacity: 1; }
              100% { transform: translateY(-30px); opacity: 0; }
            }
            @keyframes float-heart {
              0% { transform: translateY(0px) translateX(0px); opacity: 1; }
              100% { transform: translateY(-40px) translateX(var(--tx)); opacity: 0; }
            }
            @keyframes falling-drops {
              0% { transform: translateY(0px); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(40px); opacity: 0; }
            }
            @keyframes lightning-flash {
              0%, 100% { opacity: 0; }
              50% { opacity: 1; }
            }
            @keyframes spin-ring {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </defs>

        {/* Main cloud shape */}
        <path
          d="M 20 50 Q 15 40 25 35 Q 20 25 35 20 Q 40 10 55 15 Q 65 5 75 15 Q 85 8 95 20 Q 100 25 105 35 Q 115 40 110 50 Q 115 65 100 75 L 20 75 Q 5 65 20 50 Z"
          fill={cloudColor}
          stroke={evilMode ? '#dc2626' : '#a78bfa'}
          strokeWidth={evilMode ? 1.5 : 0.5}
          opacity={evilMode ? 0.95 : 1}
        />

        {/* Eyes container */}
        <g className={autoState === 'thinking' ? 'animate-thinking' : autoState === 'sleepy' ? 'scale-y-40' : ''}>
          {/* Left eye */}
          <circle cx="40" cy="40" r="6" fill="white" opacity="0.8" />
          <circle cx="40" cy="40" r="4" fill={eyeColor} />
          <circle cx="41" cy="38" r="1.5" fill="white" />

          {/* Right eye */}
          <circle cx="70" cy="40" r="6" fill="white" opacity="0.8" />
          <circle cx="70" cy="40" r="4" fill={eyeColor} />
          <circle cx="71" cy="38" r="1.5" fill="white" />

          {/* Auto blink every 4s */}
          <style>{`@keyframes auto-blink { 0%, 88% { transform: scaleY(1); } 94% { transform: scaleY(0.05); } 100% { transform: scaleY(1); } }`}</style>
        </g>

        {/* Mood ring - 8px dot on top-right */}
        <circle cx="100" cy="28" r="4" fill="#c4b5fd" opacity="0.7">
          <animate attributeName="r" values="4;5;4" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Blush circles (happy state) */}
        {(autoState === 'happy' || autoState === 'excited') && (
          <>
            <circle cx="25" cy="55" r="5" fill="#ffb3c6" opacity="0.6" />
            <circle cx="95" cy="55" r="5" fill="#ffb3c6" opacity="0.6" />
          </>
        )}

        {/* Hearts (happy state) */}
        {autoState === 'happy' && (
          <>
            <text x="35" y="20" fontSize="12" fill="#ff6b9d" opacity="0">
              ♥
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="1.6s"
                repeatCount="indefinite"
                begin="0s"
              />
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 0 -30"
                dur="1.6s"
                repeatCount="indefinite"
                begin="0s"
              />
            </text>
            <text x="75" y="20" fontSize="12" fill="#ff6b9d" opacity="0">
              ♥
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="1.6s"
                repeatCount="indefinite"
                begin="0.4s"
              />
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 0 -30"
                dur="1.6s"
                repeatCount="indefinite"
                begin="0.4s"
              />
            </text>
          </>
        )}

        {/* Rain drops (raining state) */}
        {autoState === 'raining' && (
          <>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <circle
                key={`drop-${i}`}
                cx={30 + i * 10}
                cy="85"
                r="1.5"
                fill="#60a5fa"
                opacity="0"
              >
                <animate
                  attributeName="cy"
                  from="85"
                  to="60"
                  dur={`${1.5 + i * 0.2}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.2}s`}
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur={`${1.5 + i * 0.2}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.2}s`}
                />
              </circle>
            ))}
          </>
        )}

        {/* Lightning bolt (thundering state) */}
        {autoState === 'thundering' && (
          <path
            d="M 60 20 L 55 35 L 62 35 L 50 55"
            stroke="#fbbf24"
            strokeWidth="2"
            fill="none"
            opacity="0"
          >
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="0.4s"
              repeatCount="indefinite"
              begin="0s"
            />
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="0.4s"
              repeatCount="indefinite"
              begin="0.6s"
            />
          </path>
        )}

        {/* Orbiting dots (generating state) */}
        {autoState === 'generating' && (
          <g>
            <circle cx="60" cy="20" r="2" fill="#c4b5fd" opacity="0.6">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 60 50; 360 60 50"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="85" cy="32" r="2" fill="#c4b5fd" opacity="0.6">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 60 50; 360 60 50"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="95" cy="60" r="2" fill="#c4b5fd" opacity="0.6">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 60 50; 360 60 50"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="85" cy="85" r="2" fill="#c4b5fd" opacity="0.6">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 60 50; 360 60 50"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="60" cy="95" r="2" fill="#c4b5fd" opacity="0.6">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 60 50; 360 60 50"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="35" cy="85" r="2" fill="#c4b5fd" opacity="0.6">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 60 50; 360 60 50"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="25" cy="60" r="2" fill="#c4b5fd" opacity="0.6">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 60 50; 360 60 50"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="35" cy="32" r="2" fill="#c4b5fd" opacity="0.6">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 60 50; 360 60 50"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        )}

        {/* Evil horns (evil mode) */}
        {evilMode && (
          <>
            <path
              d="M 35 18 L 32 8 L 38 15"
              fill="#dc2626"
              opacity="0.8"
            />
            <path
              d="M 85 18 L 88 8 L 82 15"
              fill="#dc2626"
              opacity="0.8"
            />
          </>
        )}

        {/* Water bottle on side */}
        <rect x="100" y="50" width="6" height="12" rx="1" fill="#bfdbfe" opacity="0.7" />
        <rect x="101" y="52" width="4" height="8" fill="#60a5fa" opacity="0.6" />
        <text x="102" y="56" fontSize="3" fill="#1e40af" fontWeight="bold">
          Z
        </text>
      </svg>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center transition-all duration-300',
        interactive && 'hover:scale-110',
        evilMode && 'opacity-90'
      )}
      style={{
        width: size,
        height: size,
      }}
    >
      {renderCloud()}
    </div>
  )
}
