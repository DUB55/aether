"use client"

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

// Deep navy design system colors - dark blue as primary accent
const DESIGN_SYSTEM = {
  navy950: '#02040a',
  navy900: '#0a0f1a',
  navy800: '#0f172a',
  navy700: '#1e293b',
  // Dark blue accents (not neon cyan)
  blue400: '#6b7ce5',
  blue500: '#5063F0',
  blue600: '#4765EE',
  // Prism edge highlights - used sparingly
  amber: '#fbbf24',
  emerald: '#34d399',
}

export function LandingBackground() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  if (prefersReducedMotion) {
    return null
  }

  return (
    <>
      {/* V3-style glowing arc */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[600px] pointer-events-none z-10">
        {/* Primary blue glow */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center top, rgba(59, 130, 246, 0.35) 0%, rgba(59, 130, 246, 0.15) 25%, rgba(59, 130, 246, 0.05) 45%, transparent 70%)',
          }}
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Secondary inner glow */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[300px]"
          style={{
            background: 'radial-gradient(ellipse at center top, rgba(59, 130, 246, 0.5) 0%, rgba(107, 124, 229, 0.2) 30%, transparent 60%)',
            filter: 'blur(40px)',
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
      
      {/* Deep navy base */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(180deg, ${DESIGN_SYSTEM.navy950} 0%, ${DESIGN_SYSTEM.navy900} 50%, ${DESIGN_SYSTEM.navy950} 100%)`
        }}
      />
    </>
  )
}
