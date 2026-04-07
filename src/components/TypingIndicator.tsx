import React from 'react';
import { motion } from 'motion/react';

interface TypingIndicatorProps {
  isVisible: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="flex items-center gap-1 px-2 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-slate-400 dark:bg-white/40 rounded-full"
          animate={{
            y: [0, -4, 0],
            opacity: [0.4, 1, 0.4],
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};
