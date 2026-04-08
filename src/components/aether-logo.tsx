import React from 'react'

interface AetherLogoProps {
  size?: number
  className?: string
  showText?: boolean
}

export function AetherLogo({ size = 32, className = '', showText = true }: AetherLogoProps) {
  console.log('AetherLogo: Rendering with logo.png', { size, className, showText })
  
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
        onLoad={() => console.log('AetherLogo: logo.png loaded successfully')}
        onError={(e) => {
          console.error('AetherLogo: logo.png failed to load', e)
          console.log('AetherLogo: Current src', (e.target as HTMLImageElement).src)
        }}
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
