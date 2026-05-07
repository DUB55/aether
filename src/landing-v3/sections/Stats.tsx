'use client';

import { motion } from 'framer-motion';
import { Command, Layers, Palette } from 'lucide-react';
import { BentoCard } from '../components/BentoCard';

export function Stats() {
  return (
    <section className="py-24 px-4 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left - Stats Card */}
          <BentoCard>
            <div className="flex flex-col h-full">
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-7xl md:text-8xl font-bold text-gray-900 dark:text-white mb-2"
                >
                  98%
                </motion.div>
                <p className="text-gray-500 dark:text-gray-400">Build without friction</p>
              </div>
              
              <div className="flex-1 bg-gray-100 dark:bg-[#050505] rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Command className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Command Palette</span>
                </div>
                <div className="space-y-2">
                  {['Create new project', 'Add component', 'Deploy app', 'Run dev server'].map((cmd, i) => (
                    <div 
                      key={cmd}
                      className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-[#111] text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span className="text-xs text-gray-400">⌘{i + 1}</span>
                      {cmd}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Right - Design System Card */}
          <BentoCard>
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Built with your design system</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Consistent, beautiful UI components</p>
              </div>

              {/* Component preview */}
              <div className="flex-1 bg-gray-100 dark:bg-[#050505] rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222]">
                    <div className="w-full h-2 rounded bg-blue-500/20 mb-2" />
                    <div className="w-2/3 h-2 rounded bg-gray-200 dark:bg-[#333]" />
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222]">
                    <div className="w-full h-2 rounded bg-green-500/20 mb-2" />
                    <div className="w-2/3 h-2 rounded bg-gray-200 dark:bg-[#333]" />
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222]">
                    <div className="w-full h-2 rounded bg-purple-500/20 mb-2" />
                    <div className="w-2/3 h-2 rounded bg-gray-200 dark:bg-[#333]" />
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222]">
                    <div className="w-full h-2 rounded bg-orange-500/20 mb-2" />
                    <div className="w-2/3 h-2 rounded bg-gray-200 dark:bg-[#333]" />
                  </div>
                </div>
              </div>

              <div className="text-center py-4">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-6xl font-bold text-gray-900 dark:text-white mb-2"
                >
                  1000x
                </motion.div>
                <p className="text-gray-500 dark:text-gray-400">Faster iteration speed</p>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
