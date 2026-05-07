import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Book, FileCode, Lightbulb, MessageCircle } from 'lucide-react';

export default function Documentation() {
  const sections = [
    {
      title: 'Getting Started',
      icon: Book,
      items: ['Quick Start Guide', 'Installation', 'Your First Project', 'Key Concepts'],
    },
    {
      title: 'API Reference',
      icon: FileCode,
      items: ['REST API', 'WebSocket API', 'Authentication', 'Rate Limits'],
    },
    {
      title: 'Guides',
      icon: Lightbulb,
      items: ['Best Practices', 'Deployment', 'Integrations', 'Troubleshooting'],
    },
    {
      title: 'Support',
      icon: MessageCircle,
      items: ['FAQ', 'Contact Support', 'Community Forum', 'Status Page'],
    },
  ];

  return (
    <PageLayout
      title="Documentation"
      description="Everything you need to know about building with Aether."
    >
      <div className="grid md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <div key={section.title} className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#5063F0]/15 flex items-center justify-center">
                <section.icon className="w-5 h-5 text-[#6b7ce5]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200">{section.title}</h3>
            </div>
            <ul className="space-y-2">
              {section.items.map((item) => (
                <li key={item} className="text-slate-400 hover:text-[#6b7ce5] cursor-pointer transition-colors">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
