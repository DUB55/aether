'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Zap, Shield, Server, Cpu, Lock } from 'lucide-react';
import { BentoCard } from '../components/BentoCard';

export function ScaleFeatures() {
  return (
    <section className="py-24 px-4 bg-gray-50 dark:bg-black">
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
            Everything you need to scale.
            <br />
            Built in.
          </h2>
        </motion.div>

        {/* Three cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Infrastructure */}
          <BentoCard>
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Server className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Infinitely scalable infrastructure</h3>
                </div>
              </div>

              {/* Graph visualization */}
              <div className="flex-1 bg-gray-100 dark:bg-[#050505] rounded-xl p-4 flex items-end justify-between gap-1">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((height, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-blue-500/20 to-blue-500/60"
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">Auto-scaling</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">Global CDN</span>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Performance */}
          <BentoCard>
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Lightning fast performance</h3>
                </div>
              </div>

              {/* Performance badge */}
              <div className="flex-1 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="relative"
                >
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 dark:text-white">100</div>
                      <div className="text-xs text-green-500">Performance</div>
                    </div>
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-green-500/30"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </div>

              <div className="mt-4 text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Lighthouse score</span>
              </div>
            </div>
          </BentoCard>

          {/* Security */}
          <BentoCard>
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Next-level security</h3>
                </div>
              </div>

              {/* Security features */}
              <div className="flex-1 bg-gray-100 dark:bg-[#050505] rounded-xl p-4">
                <div className="space-y-3">
                  {[
                    { icon: Lock, label: 'Auto-generated security rules', color: 'text-green-500' },
                    { icon: Shield, label: 'Firebase Authentication', color: 'text-blue-500' },
                    { icon: Server, label: 'Encrypted data transfer', color: 'text-purple-500' },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${color}`} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-gray-600 dark:text-gray-400">SOC 2 Compliant</span>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
