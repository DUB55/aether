import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Download, FileText, Image } from 'lucide-react';

export default function Press() {
  return (
    <PageLayout
      title="Press"
      description="Media resources and press information about Aether."
    >
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-[#6b7ce5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Press Kit</h3>
          <p className="text-slate-400 mb-4">Download our press kit with company information and brand assets.</p>
          <button className="flex items-center gap-2 text-[#6b7ce5] hover:underline">
            <Download className="w-4 h-4" />
            Download (PDF)
          </button>
        </div>

        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
            <Image className="w-6 h-6 text-[#6b7ce5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Brand Assets</h3>
          <p className="text-slate-400 mb-4">Logos, screenshots, and other media assets for press use.</p>
          <button className="flex items-center gap-2 text-[#6b7ce5] hover:underline">
            <Download className="w-4 h-4" />
            Download Assets
          </button>
        </div>

        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-[#6b7ce5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Recent News</h3>
          <p className="text-slate-400 mb-4">View our latest press releases and media coverage.</p>
          <button className="text-[#6b7ce5] hover:underline">
            View Press Releases
          </button>
        </div>
      </div>

      <div className="mt-8 bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Media Contact</h3>
        <p className="text-slate-400">
          For press inquiries, please contact us at{' '}
          <a href="mailto:press@aether.dev" className="text-[#6b7ce5] hover:underline">
            press@aether.dev
          </a>
        </p>
      </div>
    </PageLayout>
  );
}
