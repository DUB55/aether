'use client';

import { motion } from 'framer-motion';

interface GlowArcProps {
  className?: string;
}

export function GlowArc({ className = '' }: GlowArcProps) {
  return (
    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[600px] pointer-events-none ${className}`}>
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

      {/* Light mode adjustments */}
      <div className="dark:hidden absolute inset-0 opacity-30" style={{
        background: 'radial-gradient(ellipse at center top, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.1) 25%, transparent 60%)',
      }} />
    </div>
  );
}
