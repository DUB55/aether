'use client';

import { motion } from 'framer-motion';
import { Rocket, Users, Lightbulb, PenTool, Code2, BarChart3, Check, Link2, GitBranch, Cloud, Database, Shield } from 'lucide-react';
import { BentoCard } from '../components/BentoCard';

export function Superpowers() {
  const roles = [
    {
      title: 'Founder',
      icon: Rocket,
      description: 'Full startup stack in minutes',
      features: ['MVP in hours', 'Auto-scaling infra', 'Built-in auth & DB'],
      color: 'blue',
      size: 'large',
    },
    {
      title: 'Product Manager',
      icon: Lightbulb,
      description: 'Ship features faster',
      features: ['Rapid prototyping', 'A/B testing ready', 'Analytics built-in'],
      color: 'green',
      size: 'small',
    },
    {
      title: 'Designer',
      icon: PenTool,
      description: 'Design to code instantly',
      features: ['Pixel perfect', 'Tailwind CSS', 'Component library'],
      color: 'purple',
      size: 'small',
    },
  ];

  const integrations = [
    { icon: GitBranch, name: 'Git Integration' },
    { icon: Cloud, name: 'Cloud Deploy' },
    { icon: Database, name: 'Database' },
    { icon: Shield, name: 'Security' },
    { icon: Link2, name: 'APIs' },
    { icon: BarChart3, name: 'Analytics' },
  ];

  return (
    <section className="py-24 px-4 bg-white dark:bg-black">
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
            Whatever your role
            <br />
            Aether gives you superpowers
          </h2>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Founder - Large card */}
          <BentoCard size="large" className="md:row-span-2">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Founder</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{roles[0].description}</p>
                </div>
              </div>

              <div className="flex-1 bg-gray-100 dark:bg-[#050505] rounded-xl p-4 mb-4">
                {/* Startup stack visualization */}
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-medium text-gray-900 dark:text-white">Landing Page</span>
                    </div>
                    <div className="text-xs text-gray-500">Hero + Features + Pricing</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="font-medium text-gray-900 dark:text-white">Authentication</span>
                    </div>
                    <div className="text-xs text-gray-500">Google OAuth ready</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="font-medium text-gray-900 dark:text-white">Database</span>
                    </div>
                    <div className="text-xs text-gray-500">Firestore + Security rules</div>
                  </div>
                </div>
              </div>

              <ul className="space-y-2">
                {roles[0].features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-blue-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </BentoCard>

          {/* Product Manager */}
          <BentoCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Product Manager</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ship features faster</p>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-[#050505] rounded-xl p-3 mb-4">
              <div className="flex items-end gap-1 h-16">
                {[30, 50, 40, 70, 60, 90, 80].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-green-500/30"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <ul className="space-y-1">
              {roles[1].features.map((feature) => (
                <li key={feature} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </BentoCard>

          {/* Designer */}
          <BentoCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <PenTool className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Designer</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Design to code instantly</p>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-[#050505] rounded-xl p-3 mb-4 grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-white dark:bg-[#111] flex items-center justify-center">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20" />
              </div>
              <div className="p-2 rounded bg-white dark:bg-[#111] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-blue-500/20" />
              </div>
              <div className="p-2 rounded bg-white dark:bg-[#111] flex items-center justify-center">
                <div className="w-8 h-4 rounded bg-green-500/20" />
              </div>
              <div className="p-2 rounded bg-white dark:bg-[#111] flex items-center justify-center">
                <div className="w-4 h-8 rounded bg-orange-500/20" />
              </div>
            </div>
            <ul className="space-y-1">
              {roles[2].features.map((feature) => (
                <li key={feature} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Check className="w-3 h-3 text-purple-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </BentoCard>

          {/* Developer */}
          <BentoCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Developer</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ship faster with AI</p>
              </div>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 font-mono text-xs text-gray-300">
              <div className="text-green-400">$ aether generate</div>
              <div className="text-gray-500 mt-1">{'>'} Building...</div>
              <div className="text-blue-400 mt-1">{'>'} Done! 2.3s</div>
            </div>
          </BentoCard>

          {/* Easy Integrations */}
          <BentoCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Easy Integrations</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Connect your stack</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {integrations.map(({ icon: Icon, name }) => (
                <div key={name} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-100 dark:bg-[#050505]">
                  <Icon className="w-5 h-5 text-cyan-500" />
                  <span className="text-[10px] text-gray-500 text-center">{name}</span>
                </div>
              ))}
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
