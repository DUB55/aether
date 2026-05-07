import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Calendar, ArrowRight } from 'lucide-react';

export default function Blog() {
  const posts = [
    {
      title: 'Introducing Aether v2.0',
      excerpt: 'The next generation of AI-powered development with enhanced features and improved performance.',
      date: 'May 5, 2026',
      category: 'Product',
    },
    {
      title: 'How We Built a Production-Ready AI Coder',
      excerpt: 'A deep dive into the architecture and technology behind Aether.',
      date: 'April 28, 2026',
      category: 'Engineering',
    },
    {
      title: 'The Future of Software Development',
      excerpt: 'How AI is transforming the way we build applications.',
      date: 'April 15, 2026',
      category: 'Thoughts',
    },
    {
      title: 'Customer Spotlight: How Teams Use Aether',
      excerpt: 'Real stories from teams building with Aether.',
      date: 'April 8, 2026',
      category: 'Customers',
    },
  ];

  return (
    <PageLayout
      title="Blog"
      description="Latest news, updates, and insights from the Aether team."
    >
      <div className="space-y-6">
        {posts.map((post, index) => (
          <div
            key={index}
            className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6 hover:border-[#5063F0]/30 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 rounded-full bg-[#5063F0]/10 text-[#6b7ce5] text-xs">
                {post.category}
              </span>
              <div className="flex items-center gap-1 text-slate-500 text-sm">
                <Calendar className="w-3 h-3" />
                {post.date}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-slate-200 mb-2 group-hover:text-[#6b7ce5] transition-colors">
              {post.title}
            </h3>
            <p className="text-slate-400 mb-4">{post.excerpt}</p>
            <div className="flex items-center gap-1 text-[#6b7ce5] text-sm">
              Read more
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
