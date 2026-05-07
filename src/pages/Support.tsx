import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Mail, MessageCircle, HelpCircle, FileQuestion } from 'lucide-react';

export default function Support() {
  return (
    <PageLayout
      title="Support"
      description="We're here to help. Get in touch with our team."
    >
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-[#6b7ce5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Email Support</h3>
          <p className="text-slate-400 mb-4">Get help via email. We typically respond within 24 hours.</p>
          <a href="mailto:support@aether.dev" className="text-[#6b7ce5] hover:underline">
            support@aether.dev
          </a>
        </div>

        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
            <MessageCircle className="w-6 h-6 text-[#6b7ce5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Community</h3>
          <p className="text-slate-400 mb-4">Join our community forum to connect with other developers.</p>
          <button className="text-[#6b7ce5] hover:underline">
            Visit Community
          </button>
        </div>

        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
            <HelpCircle className="w-6 h-6 text-[#6b7ce5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">FAQ</h3>
          <p className="text-slate-400 mb-4">Find answers to commonly asked questions.</p>
          <button className="text-[#6b7ce5] hover:underline">
            View FAQ
          </button>
        </div>

        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
            <FileQuestion className="w-6 h-6 text-[#6b7ce5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Documentation</h3>
          <p className="text-slate-400 mb-4">Browse our comprehensive documentation.</p>
          <button className="text-[#6b7ce5] hover:underline">
            Read Docs
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
