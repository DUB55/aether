import React from 'react'

interface AetherLogoProps {
  size?: number
  className?: string
  showText?: boolean
  isLoading?: boolean
}

export function AetherLogo({ size = 32, className = '', showText = true, isLoading = false }: AetherLogoProps) {
  // Use the production URL for desktop app compatibility
  const logoSrc = "https://aether-dub5.vercel.app/logo.png"
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Image */}
      <div className="relative">
        <img
          src={logoSrc}
          alt="Aether Logo"
          width={size}
          height={size}
          className={`flex-shrink-0 ${isLoading ? 'animate-pulse' : ''}`}
          style={{ width: size, height: size }}
          onError={(e) => {
            // Fallback to a text-based logo if image fails to load
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const parent = target.parentElement
            if (parent && !parent.querySelector('.fallback-logo')) {
              const fallback = document.createElement('div')
              fallback.className = 'fallback-logo flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold'
              fallback.style.width = `${size}px`
              fallback.style.height = `${size}px`
              fallback.style.fontSize = `${size * 0.4}px`
              fallback.textContent = 'A'
              parent.insertBefore(fallback, target.nextSibling)
            }
          }}
        />
        
        {/* Loading White Glow Animation */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-full animate-pulse">
              <div className="absolute inset-0 bg-white/20 blur-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-white opacity-75" />
                <div className="absolute inset-0 bg-white/30 blur-2xl">
                  <div className="w-16 h-16 bg-white rounded-full shadow-lg shadow-white/50 animate-spin" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span className="text-lg font-bold tracking-tight text-[var(--t)]">
          Aether
        </span>
      )}
    </div>
  )
}
