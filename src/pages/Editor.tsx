import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Code2, Sparkles, Zap, Layers } from 'lucide-react';

export default function Editor() {
  return (
    <PageLayout
      title="Editor"
      description="A powerful AI-driven code editor for building production-ready applications."
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <Code2 className="w-8 h-8 text-[#6b7ce5] mb-4" />
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Multi-File Editing</h3>
          <p className="text-slate-400">Edit multiple files simultaneously with AI assistance. The AI understands your entire project structure.</p>
        </div>

        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <Sparkles className="w-8 h-8 text-[#6b7ce5] mb-4" />
          <h3 className="text-lg font-semibold text-slate-200 mb-2">AI-Powered</h3>
          <p className="text-slate-400">Get intelligent code suggestions, auto-completion, and refactoring recommendations powered by advanced AI models.</p>
        </div>

        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <Zap className="w-8 h-8 text-[#6b7ce5] mb-4" />
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Instant Preview</h3>
          <p className="text-slate-400">See your changes in real-time with WebContainer technology. No local setup required.</p>
        </div>

        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <Layers className="w-8 h-8 text-[#6b7ce5] mb-4" />
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Project Management</h3>
          <p className="text-slate-400">Organize your projects, track versions, and collaborate with team members seamlessly.</p>
        </div>
      </div>
    </PageLayout>
  );
}
