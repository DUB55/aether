import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Calendar, ArrowLeft, Building2, Users, Zap } from 'lucide-react';

export default function CustomerSpotlight() {
  return (
    <PageLayout
      title="Customer Spotlight: How Teams Use Aether"
      description="Real stories from teams building with Aether."
    >
      <div className="max-w-4xl">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-1 rounded-full bg-[#5063F0]/10 text-[#6b7ce5] text-xs">
            Customers
          </span>
          <div className="flex items-center gap-1 text-slate-500 text-sm">
            <Calendar className="w-3 h-3" />
            April 8, 2026
          </div>
        </div>

        <h1 className="text-4xl font-bold text-slate-200 mb-6">Customer Spotlight: How Teams Use Aether</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-slate-300 mb-6">
            Every day, thousands of developers and teams use Aether to build amazing software. In this post, we're sharing stories from some of our most innovative users, highlighting how they're leveraging AI to transform their development workflows.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">TechFlow: Scaling from Startup to Enterprise</h2>
          <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-[#6b7ce5]" />
              <span className="font-semibold text-slate-200">TechFlow</span>
              <span className="text-slate-500 text-sm">• B2B SaaS Platform</span>
            </div>
            <p className="text-slate-300 mb-4">
              "We started using Aether when we were just 5 developers. Now we're a team of 50, and Aether has scaled with us every step of the way. The AI's understanding of our complex architecture has been incredible—it suggests code that fits perfectly with our existing patterns."
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                50 developers
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                3x faster development
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">DataForge: Accelerating Data Science Workflows</h2>
          <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-[#6b7ce5]" />
              <span className="font-semibold text-slate-200">DataForge</span>
              <span className="text-slate-500 text-sm">• Data Analytics Platform</span>
            </div>
            <p className="text-slate-300 mb-4">
              "As a data science team, we spend a lot of time on data processing pipelines. Aether has been a game-changer for us. The AI understands our data transformation logic and can generate complex pipeline code in minutes. What used to take our senior engineers hours now takes minutes."
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                15 data scientists
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                5x faster pipeline development
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">GreenEnergy: Building Sustainable Tech</h2>
          <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-[#6b7ce5]" />
              <span className="font-semibold text-slate-200">GreenEnergy</span>
              <span className="text-slate-500 text-sm">• Renewable Energy Management</span>
            </div>
            <p className="text-slate-300 mb-4">
              "We're a mission-driven company building tools for the renewable energy sector. Aether helps us move faster without sacrificing code quality. The AI's ability to understand our domain-specific requirements has been impressive. It's like having a senior engineer who knows our entire codebase."
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                25 engineers
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                40% reduction in bugs
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">StartupX: From Idea to MVP in Weeks</h2>
          <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-[#6b7ce5]" />
              <span className="font-semibold text-slate-200">StartupX</span>
              <span className="text-slate-500 text-sm">• Consumer App</span>
            </div>
            <p className="text-slate-300 mb-4">
              "As a small team with limited resources, we needed to move fast. Aether allowed our two founders to build a production-ready MVP in just 6 weeks. The AI handled the boilerplate and suggested implementations we wouldn't have thought of. We secured our Series A based on that prototype."
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                2 founders
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                6 weeks to MVP
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Common Themes</h2>
          <p className="text-slate-300 mb-4">
            Across all these stories, several themes emerge. Teams value Aether's ability to understand their specific codebase, the consistency it brings to code style, and the way it accelerates both routine tasks and complex problem-solving. Most importantly, they see Aether as a partner that augments their capabilities rather than replacing them.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Join the Community</h2>
          <p className="text-slate-300 mb-4">
            These are just a few examples of how teams are using Aether. Every team has unique needs and workflows, and we're constantly learning from our users. If you're using Aether and have a story to share, we'd love to hear from you. Join our community Slack or reach out directly—your insights help us build better tools for everyone.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
