'use client';

import { motion } from 'framer-motion';
import { Sparkles, Code2, Play, Terminal, Zap, Shield, Database, Globe } from 'lucide-react';
import { BentoCard } from '../components/BentoCard';

export function Features() {
  return (
    <section id="features" className="py-24 px-4 bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Empowering projects & builders with
            <br />
            the most powerful coding agents
          </h2>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* AI Chat Interface */}
          <BentoCard size="large" className="md:col-span-2">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">AI-Powered Development</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Natural language to production code</p>
                </div>
              </div>
              
              {/* Chat mockup */}
              <div className="flex-1 bg-gray-100 dark:bg-[#050505] rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-500">A</span>
                  </div>
                  <div className="bg-white dark:bg-[#111] rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-400 max-w-[80%]">
                    I'll create a modern landing page with hero section, features grid, and contact form. Using React + Tailwind.
                  </div>
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-blue-500 rounded-lg px-3 py-2 text-sm text-white max-w-[80%]">
                    Build a SaaS landing page with pricing and testimonials
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#333] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs">You</span>
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Real-time Preview */}
          <BentoCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Play className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Live Preview</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">See changes instantly</p>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-[#050505] rounded-xl p-3 aspect-video flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-[#111] rounded-lg shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <Globe className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <span className="text-xs text-gray-500">Live Preview</span>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Code Generation */}
          <BentoCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Smart Code</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Best practices built-in</p>
              </div>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 font-mono text-xs text-gray-300 overflow-hidden">
              <div className="flex gap-2 mb-2">
                <span className="text-blue-400">import</span>
                <span className="text-yellow-300">{'{ useState }'}</span>
                <span className="text-blue-400">from</span>
                <span className="text-green-400">'react'</span>
              </div>
              <div className="text-gray-500">// AI-generated React component</div>
            </div>
          </BentoCard>

          {/* One-Click Deploy */}
          <BentoCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">One-Click Deploy</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Go live in seconds</p>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-[#050505] rounded-xl p-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Production Ready
              </div>
              <div className="text-xs text-gray-500">Deployed to global CDN</div>
            </div>
          </BentoCard>

          {/* Database + Auth */}
          <BentoCard size="large" className="md:col-span-2">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <Database className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Firebase Integration</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Database & Auth ready</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {['Firestore Database', 'Authentication', 'Security Rules', 'Real-time Sync'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Zap className="w-4 h-4 text-cyan-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 bg-gray-100 dark:bg-[#050505] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Secure by Default</span>
                </div>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-between py-1 border-b border-gray-200 dark:border-[#222]">
                    <span>Auth Type</span>
                    <span className="text-green-500">Google OAuth</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-gray-200 dark:border-[#222]">
                    <span>Database</span>
                    <span className="text-blue-500">Firestore</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Security</span>
                    <span className="text-purple-500">Auto Rules</span>
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
