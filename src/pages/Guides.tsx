import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { BookOpen, Rocket, Shield, Zap } from 'lucide-react';

export default function Guides() {
  const guides = [
    {
      title: 'Getting Started',
      icon: Rocket,
      description: 'Learn the basics of Aether and create your first project in minutes.',
      readTime: '5 min read',
    },
    {
      title: 'Best Practices',
      icon: BookOpen,
      description: 'Tips and tricks for getting the most out of AI-powered development.',
      readTime: '10 min read',
    },
    {
      title: 'Security Guide',
      icon: Shield,
      description: 'How to build secure applications with automatic security rule generation.',
      readTime: '8 min read',
    },
    {
      title: 'Performance Optimization',
      icon: Zap,
      description: 'Optimize your applications for speed and efficiency.',
      readTime: '7 min read',
    },
  ];

  return (
    <PageLayout
      title="Guides"
      description="Step-by-step guides to help you build better applications."
    >
      <div className="grid md:grid-cols-2 gap-6">
        {guides.map((guide) => (
          <div
            key={guide.title}
            className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6 hover:border-[#5063F0]/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#5063F0]/15 flex items-center justify-center">
                <guide.icon className="w-5 h-5 text-[#6b7ce5]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200">{guide.title}</h3>
            </div>
            <p className="text-slate-400 mb-3">{guide.description}</p>
            <span className="text-xs text-slate-500">{guide.readTime}</span>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
