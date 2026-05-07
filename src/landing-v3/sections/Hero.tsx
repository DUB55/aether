'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Plus, X, Paperclip, Palette, Database, Plug } from 'lucide-react';
import { GlowArc } from '../components/GlowArc';
import { TemplatePill } from '../components/TemplatePill';

interface HeroProps {
  onStartProject?: (prompt: string, attachments?: File[], designSystem?: string) => void;
}

export function Hero({ onStartProject }: HeroProps) {
  const [input, setInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showDesignPanel, setShowDesignPanel] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templates = [
    'chrome extension',
    'landing page',
    'invoice generator',
    'todo app',
    'dashboard',
    'portfolio',
  ];

  const designSystems = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean, minimalist design with subtle gradients and rounded corners',
      preview: 'bg-gradient-to-br from-blue-500 to-purple-600'
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Professional dark theme with high contrast and subtle shadows',
      preview: 'bg-gray-900'
    },
    {
      id: 'vibrant',
      name: 'Vibrant',
      description: 'Bold colors and energetic design with strong visual impact',
      preview: 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Ultra-clean design with lots of white space and simple typography',
      preview: 'bg-white border-2 border-gray-200'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && onStartProject) {
      const attachments = attachedFile ? [attachedFile] : undefined;
      onStartProject(input.trim(), attachments, selectedDesign || undefined);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      setShowMenu(false);
    }
  };

  const handleDesignSelect = (designId: string) => {
    setSelectedDesign(designId);
    setShowMenu(false);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 overflow-hidden bg-white dark:bg-black">
      {/* Glowing arc */}
      <GlowArc />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full bg-blue-500/10 border border-blue-500/20"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm text-blue-600 dark:text-blue-400">Aether v2.0 is now live</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-4"
        >
          What will you build today?
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-xl mx-auto"
        >
          Your new app is being written, run, and in Prod.
        </motion.p>

        {/* Input container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-100 dark:bg-[#111111] border border-gray-300 dark:border-[#222222] focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="what do you want to build?"
                className="flex-1 px-4 py-3 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none text-base"
              />
              <div className="flex items-center gap-2">
                {attachedFile && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm">
                    <Paperclip className="w-4 h-4" />
                    <span className="truncate max-w-[100px]">{attachedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {selectedDesign && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm">
                    <Palette className="w-4 h-4" />
                    <span>{designSystems.find(d => d.id === selectedDesign)?.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedDesign(null)}
                      className="hover:text-purple-800 dark:hover:text-purple-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-200 dark:bg-[#222] hover:bg-gray-300 dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                  </button>

                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl shadow-xl z-50 overflow-hidden"
                      >
                        <div className="p-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] text-left transition-colors cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <Paperclip className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">Attach</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Upload a file</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowMenu(false);
                              setShowDesignPanel(true);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] text-left transition-colors cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                              <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">Design</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Choose a theme</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            disabled
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] text-left transition-colors cursor-pointer opacity-50"
                          >
                            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <Plug className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">Connectors</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Coming soon</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            disabled
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] text-left transition-colors cursor-pointer opacity-50"
                          >
                            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                              <Database className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">Databases</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Coming soon</div>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors cursor-pointer"
                >
                  Build
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />
          </form>
        </motion.div>

        {/* Design Panel Modal */}
        <AnimatePresence>
          {showDesignPanel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDesignPanel(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#333]">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Choose Design System</h2>
                  <button
                    onClick={() => setShowDesignPanel(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {designSystems.map((design) => (
                      <button
                        key={design.id}
                        type="button"
                        onClick={() => handleDesignSelect(design.id)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          selectedDesign === design.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-[#333] hover:border-gray-300 dark:hover:border-[#444]'
                        }`}
                      >
                        <div className="h-20 rounded-lg mb-3 {design.preview}" />
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{design.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{design.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-[#333]">
                  <button
                    onClick={() => setShowDesignPanel(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-[#333] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowDesignPanel(false);
                    }}
                    disabled={!selectedDesign}
                    className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Template pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {templates.map((template, index) => (
            <TemplatePill
              key={template}
              label={template}
              delay={0.4 + index * 0.05}
              onClick={() => setInput(`Build a ${template}`)}
            />
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-gray-300 dark:border-[#333] flex items-start justify-center p-2"
        >
          <motion.div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}
