'use client';

import { motion } from 'framer-motion';

interface TemplatePillProps {
  label: string;
  onClick?: () => void;
  delay?: number;
}

export function TemplatePill({ label, onClick, delay = 0 }: TemplatePillProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="
        px-4 py-2 rounded-full text-sm
        bg-[#111111] dark:bg-[#111111] bg-gray-100
        border border-[#222222] dark:border-[#222222] border-gray-300
        text-gray-500 dark:text-gray-500 text-gray-600
        hover:border-blue-500/50 hover:text-gray-700 dark:hover:text-gray-300
        transition-all duration-200
        cursor-pointer
      "
    >
      {label}
    </motion.button>
  );
}
