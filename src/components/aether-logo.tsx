import React from 'react'

interface AetherLogoProps {
  size?: number
  className?: string
  showText?: boolean
}

export function AetherLogo({ size = 32, className = '', showText = true }: AetherLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Modern Geometric 'A' - Neutral & Clean */}
        <path
          d="M50 15L20 85H35L50 45L65 85H80L50 15Z"
          fill="currentColor"
          className="text-[var(--t)]"
        />
        
        {/* Subtle crossbar accent */}
        <rect
          x="42"
          y="65"
          width="16"
          height="4"
          fill="currentColor"
          className="text-[var(--t)]"
        />
      </svg>
      
      {/* Logo Text */}
      {showText && (
        <span className="text-lg font-bold tracking-tight text-[var(--t)]">
          Aether
        </span>
      )}
    </div>
  )
}
