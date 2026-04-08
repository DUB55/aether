import React from 'react'
import { Cpu, Zap, MousePointer2, Code2, Layers, Shield } from 'lucide-react'

interface IconSystemProps {
  type: 'cpu' | 'zap' | 'mouse-pointer' | 'code' | 'layers' | 'shield'
  size?: number
  className?: string
  variant?: 'default' | 'minimal'
}

export function IconSystem({ 
  type, 
  size = 24, 
  className = '', 
  variant = 'default' 
}: IconSystemProps) {

  const iconComponents = {
    cpu: Cpu,
    zap: Zap,
    'mouse-pointer': MousePointer2,
    code: Code2,
    layers: Layers,
    shield: Shield
  }

  const renderIcon = () => {
    const baseClasses = "flex items-center justify-center transition-all duration-200"
    const IconComponent = iconComponents[type]
    
    switch (variant) {
      case 'minimal':
        return (
          <div className={`${baseClasses} ${className}`} style={{ width: size, height: size }}>
            <IconComponent size={size * 0.6} />
          </div>
        )
      
      default:
        return (
          <div className={`${baseClasses} ${className}`} style={{ width: size, height: size }}>
            <IconComponent size={size * 0.8} className="opacity-90 hover:opacity-100 transition-opacity" />
          </div>
        )
    }
  }

  return renderIcon()
}
