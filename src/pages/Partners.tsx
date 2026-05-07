import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Handshake, Zap, Globe, Code2 } from 'lucide-react';

export default function Partners() {
  return (
    <PageLayout
      title="Partners"
      description="Partner with Aether to build the future of software development."
    >
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
            <Handshake className="w-6 h-6 text-[#6b7ce5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Technology Partners</h3>
          <p className="text-slate-400">Integrate your technology with Aether and reach thousands of developers.</p>
        </div>

        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-[#6b7ce5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Solution Partners</h3>
          <p className="text-slate-400">Build and sell solutions powered by Aether to your customers.</p>
        </div>

        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
            <Globe className="w-6 h-6 text-[#6b7ce5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Cloud Partners</h3>
          <p className="text-slate-400">Deploy Aether on your cloud infrastructure for enterprise customers.</p>
        </div>

        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
            <Code2 className="w-6 h-6 text-[#6b7ce5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Developer Partners</h3>
          <p className="text-slate-400">Create templates and extensions for the Aether marketplace.</p>
        </div>
      </div>

      <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-8 text-center">
        <h3 className="text-xl font-semibold text-slate-200 mb-4">Become a Partner</h3>
        <p className="text-slate-400 mb-6 max-w-lg mx-auto">
          Interested in partnering with Aether? Reach out to our partnership team to discuss opportunities.
        </p>
        <a 
          href="mailto:partners@aether.dev" 
          className="inline-flex px-6 py-3 rounded-lg bg-[#5063F0] text-white font-semibold hover:bg-[#4765EE] transition-colors"
        >
          Contact Partnership Team
        </a>
      </div>
    </PageLayout>
  );
}
