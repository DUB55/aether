"use client"

import { useEffect, useState } from 'react'

export function AuroraOrbs() {
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
      {/* Orb 1: Figure-8 pattern from upper-left toward center - 28s loop */}
      <div 
        className="aurora-orb orb-1"
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, rgba(99, 102, 241, 0) 70%)',
          filter: 'blur(120px)',
          mixBlendMode: 'screen',
          borderRadius: '50%',
          pointerEvents: 'none',
          willChange: 'transform',
          animation: 'figure8 28s ease-in-out infinite',
          transform: 'translate3d(-200px, -200px, 0)'
        }}
      />

      {/* Orb 2: Diagonal movement with scale pulse - 34s loop */}
      <div 
        className="aurora-orb orb-2"
        style={{
          position: 'fixed',
          top: '0',
          right: '0',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(168, 85, 247, 0) 70%)',
          filter: 'blur(120px)',
          mixBlendMode: 'screen',
          borderRadius: '50%',
          pointerEvents: 'none',
          willChange: 'transform',
          animation: 'diagonalPulse 34s ease-in-out infinite',
          transform: 'translate3d(200px, -100px, 0)'
        }}
      />

      {/* Orb 3: Wide arc across lower portion - 40s loop */}
      <div 
        className="aurora-orb orb-3"
        style={{
          position: 'fixed',
          bottom: '0',
          left: '50%',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, rgba(236, 72, 153, 0) 70%)',
          filter: 'blur(120px)',
          mixBlendMode: 'screen',
          borderRadius: '50%',
          pointerEvents: 'none',
          willChange: 'transform',
          animation: 'wideArc 40s ease-in-out infinite',
          transform: 'translate3d(-50%, 200px, 0)'
        }}
      />

      {/* Grain overlay to prevent color banding */}
      <div
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          pointerEvents: 'none',
          opacity: '0.035',
          zIndex: 1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          mixBlendMode: 'overlay'
        }}
      />

      <style>{`
        @keyframes figure8 {
          0% {
            transform: translate3d(-200px, -200px, 0);
          }
          25% {
            transform: translate3d(100px, -100px, 0);
          }
          50% {
            transform: translate3d(200px, 100px, 0);
          }
          75% {
            transform: translate3d(0px, 50px, 0);
          }
          100% {
            transform: translate3d(-200px, -200px, 0);
          }
        }

        @keyframes diagonalPulse {
          0% {
            transform: translate3d(200px, -100px, 0) scale(0.9);
          }
          25% {
            transform: translate3d(100px, 50px, 0) scale(1.0);
          }
          50% {
            transform: translate3d(-100px, 150px, 0) scale(1.1);
          }
          75% {
            transform: translate3d(50px, 100px, 0) scale(1.0);
          }
          100% {
            transform: translate3d(200px, -100px, 0) scale(0.9);
          }
        }

        @keyframes wideArc {
          0% {
            transform: translate3d(-400px, 200px, 0);
          }
          25% {
            transform: translate3d(-200px, 250px, 0);
          }
          50% {
            transform: translate3d(0px, 200px, 0);
          }
          75% {
            transform: translate3d(200px, 250px, 0);
          }
          100% {
            transform: translate3d(400px, 200px, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .aurora-orb {
            animation: none !important;
          }
        }
      `}</style>
    </>
  )
}
