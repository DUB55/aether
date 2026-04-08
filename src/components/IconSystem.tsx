import React from 'react'

interface IconSystemProps {
  type: 'cpu' | 'zap' | 'mouse-pointer' | 'code' | 'layers' | 'shield'
  size?: number
  className?: string
  variant?: 'default' | 'minimal' | 'emoji'
}

export function IconSystem({ 
  type, 
  size = 24, 
  className = '', 
  variant = 'default' 
}: IconSystemProps) {

  const renderIcon = () => {
    const baseClasses = "flex items-center justify-center transition-all duration-200"
    
    switch (variant) {
      case 'minimal':
        return (
          <div className={`${baseClasses} ${className}`} style={{ width: size, height: size }}>
            <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {type === 'cpu' && <rect x="4" y="4" width="16" height="16" rx="2" />}
              {type === 'zap' && <polygon points="13 2 3 14 22 12 23 8 22 9 2 16 4" />}
              {type === 'mouse-pointer' && <path d="M3 3l7.07 7.07" />}
              {type === 'code' && <polyline points="16 18 22 12 2 7 7" />}
              {type === 'layers' && <polygon points="12 2 2 22 9 16 22 16 12 2" />}
              {type === 'shield' && <path d="M12 22s8-9 9-9 0" />}
            </svg>
          </div>
        )
      
      case 'emoji':
        const emojis = {
          cpu: '⚙️',
          zap: '⚡',
          mousePointer: '👆',
          code: '💻',
          layers: '📚',
          shield: '🛡️'
        }
        return (
          <div className={`${baseClasses} ${className}`} style={{ width: size, height: size, fontSize: size * 0.5 }}>
            {emojis[type]}
          </div>
        )
      
      default:
        return (
          <div className={`${baseClasses} ${className}`} style={{ width: size, height: size }}>
            <img
              src={`/icons/${type}.svg`}
              alt={`${type} icon`}
              width={size * 0.8}
              height={size * 0.8}
              className="opacity-90 hover:opacity-100 transition-opacity"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const fallback = document.createElement('div')
                fallback.className = baseClasses
                fallback.style.width = `${size}px`
                fallback.style.height = `${size}px`
                fallback.style.fontSize = `${size * 0.4}px`
                fallback.textContent = emojis[type] || '?'
                fallback.style.color = 'currentColor'
                target.parentNode?.replaceChild(fallback, target)
              }}
            />
          </div>
        )
    }
  }

  return renderIcon()
}
