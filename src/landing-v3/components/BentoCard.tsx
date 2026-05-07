'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  gradientBorder?: boolean;
  hover?: boolean;
}

export function BentoCard({ 
  children, 
  className = '', 
  size = 'medium',
  gradientBorder = true,
  hover = true 
}: BentoCardProps) {
  const sizeClasses = {
    small: '',
    medium: '',
    large: 'md:col-span-2',
    full: 'md:col-span-3',
  };

  return (
    <motion.div
      className={`
        relative rounded-2xl overflow-hidden
        ${sizeClasses[size]}
        ${className}
      `}
      whileHover={hover ? { y: -4, transition: { duration: 0.3 } } : undefined}
    >
      {/* Gradient border effect */}
      {gradientBorder && (
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 100%)',
            padding: '1px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />
      )}
      
      {/* Card background */}
      <div className="relative h-full rounded-2xl bg-[#0a0a0a] dark:bg-[#0a0a0a] bg-white border border-[#e5e5e5] dark:border-[#222222] p-6">
        {children}
      </div>
    </motion.div>
  );
}
