import React from 'react'

interface AetherLogoProps {
  size?: number
  className?: string
  showText?: boolean
}

export function AetherLogo({ size = 32, className = '', showText = true }: AetherLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Image */}
      <img
        src="/logo.png"
        alt="Aether Logo"
        width={size}
        height={size}
        className="flex-shrink-0"
        style={{ width: size, height: size }}
      />
      
      {/* Logo Text */}
      {showText && (
        <span className="text-lg font-bold tracking-tight text-[var(--t)]">
          Aether
        </span>
      )}
    </div>
  )
}
