'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TemplatePill } from '../components/TemplatePill';

interface FinalCTAProps {
  onStartProject?: (prompt: string, attachments?: File[], designSystem?: string) => void;
}

export function FinalCTA({ onStartProject }: FinalCTAProps) {
  const [input, setInput] = useState('');

  const templates = [
    'e-commerce store',
    'blog platform',
    'portfolio site',
    'SaaS dashboard',
    'mobile app',
    'API service',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && onStartProject) {
      onStartProject(input.trim());
    }
  };

  return (
    <section id="cta" className="py-24 px-4 bg-gray-50 dark:bg-black">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Ready to build something amazing?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-gray-500 dark:text-gray-400 mb-12"
        >
          Go from idea to production in minutes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-[#111111] border border-gray-300 dark:border-[#222222] focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all shadow-lg">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="what do you want to build?"
                className="flex-1 px-4 py-3 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none text-base"
              />
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors cursor-pointer"
              >
                Build
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {templates.map((template, index) => (
            <TemplatePill
              key={template}
              label={template}
              delay={0.3 + index * 0.05}
              onClick={() => setInput(`Build a ${template}`)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
