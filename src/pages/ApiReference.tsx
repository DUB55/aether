import React from 'react';
import { PageLayout } from '@/components/PageLayout';

export default function ApiReference() {
  return (
    <PageLayout
      title="API Reference"
      description="Complete API documentation for integrating with Aether."
    >
      <div className="space-y-8">
        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Authentication</h3>
          <p className="text-slate-400 mb-4">All API requests require authentication using your API key in the Authorization header.</p>
          <pre className="bg-[#02040a] rounded-lg p-4 text-sm text-slate-300 font-mono overflow-x-auto">
{`Authorization: Bearer YOUR_API_KEY`}
          </pre>
        </div>

        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Base URL</h3>
          <p className="text-slate-400 mb-4">All API requests should be made to:</p>
          <pre className="bg-[#02040a] rounded-lg p-4 text-sm text-slate-300 font-mono overflow-x-auto">
{`https://api.aether.dev/v1`}
          </pre>
        </div>

        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Endpoints</h3>
          <div className="space-y-4">
            <div className="border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-mono">POST</span>
                <code className="text-slate-300 font-mono">/projects</code>
              </div>
              <p className="text-slate-400 text-sm">Create a new project</p>
            </div>

            <div className="border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-mono">GET</span>
                <code className="text-slate-300 font-mono">/projects/:id</code>
              </div>
              <p className="text-slate-400 text-sm">Get project details</p>
            </div>

            <div className="border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs font-mono">PUT</span>
                <code className="text-slate-300 font-mono">/projects/:id</code>
              </div>
              <p className="text-slate-400 text-sm">Update a project</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-mono">DELETE</span>
                <code className="text-slate-300 font-mono">/projects/:id</code>
              </div>
              <p className="text-slate-400 text-sm">Delete a project</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
