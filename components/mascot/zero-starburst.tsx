'use client'

import { cn } from '@/lib/utils'

interface ZeroStarburstProps {
  size?: number
  className?: string
  animate?: boolean
  variant?: 'default' | 'thinking' | 'speaking'
}

export function ZeroStarburst({ 
  size = 32, 
  className,
  animate = true,
  variant = 'default'
}: ZeroStarburstProps) {
  const rays = 12
  const innerRadius = size * 0.25
  const outerRadius = size * 0.5
  const center = size / 2

  // Generate starburst points
  const points = []
  for (let i = 0; i < rays; i++) {
    const angle = (i * 2 * Math.PI) / rays - Math.PI / 2
    const nextAngle = ((i + 0.5) * 2 * Math.PI) / rays - Math.PI / 2
    
    // Outer point
    const outerX = center + Math.cos(angle) * outerRadius
    const outerY = center + Math.sin(angle) * outerRadius
    
    // Inner point
    const innerX = center + Math.cos(nextAngle) * innerRadius
    const innerY = center + Math.sin(nextAngle) * innerRadius
    
    points.push(`${outerX},${outerY}`)
    points.push(`${innerX},${innerY}`)
  }

  return (
    <div 
      className={cn(
        'relative flex items-center justify-center',
        animate && variant === 'default' && 'zero-pulse',
        animate && variant === 'thinking' && 'zero-spin-slow',
        animate && variant === 'speaking' && 'zero-pulse',
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon
          points={points.join(' ')}
          fill="var(--zero-300)"
          className={cn(
            'transition-all duration-300',
            variant === 'thinking' && 'opacity-80'
          )}
        />
      </svg>
      
      {/* Glow effect */}
      <div 
        className={cn(
          'absolute inset-0 rounded-full blur-md opacity-30',
          variant === 'speaking' && 'opacity-50'
        )}
        style={{ 
          background: 'var(--zero-300)',
          transform: 'scale(0.8)'
        }}
      />
    </div>
  )
}

// Inline SVG version for faster loading
export function ZeroStarburstIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('text-zero-300', className)}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L14.09 8.26L20 6L16.18 10.91L22 12L16.18 13.09L20 18L14.09 15.74L12 22L9.91 15.74L4 18L7.82 13.09L2 12L7.82 10.91L4 6L9.91 8.26L12 2Z" />
    </svg>
  )
}
