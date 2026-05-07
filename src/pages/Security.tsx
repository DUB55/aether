import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Shield, Lock, Server, Eye } from 'lucide-react';

export default function Security() {
  return (
    <PageLayout
      title="Security"
      description="Your security is our top priority. Learn how we protect your data."
    >
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-[#6b7ce5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Data Encryption</h3>
          <p className="text-slate-400">All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Your code and data are always protected.</p>
        </div>

        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-[#6b7ce5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Automatic Security Rules</h3>
          <p className="text-slate-400">Aether generates Firebase security rules automatically to protect your application's data.</p>
        </div>

        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
            <Server className="w-6 h-6 text-[#6b7ce5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Secure Infrastructure</h3>
          <p className="text-slate-400">Our infrastructure runs on enterprise-grade cloud providers with SOC 2 compliance and regular security audits.</p>
        </div>

        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
            <Eye className="w-6 h-6 text-[#6b7ce5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Privacy First</h3>
          <p className="text-slate-400">We don't train our AI models on your proprietary code. Your intellectual property remains yours.</p>
        </div>
      </div>

      <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-8">
        <h3 className="text-xl font-semibold text-slate-200 mb-4">Security Practices</h3>
        <div className="space-y-4 text-slate-400">
          <div className="flex items-start gap-3">
            <span className="text-[#6b7ce5] mt-1">•</span>
            <p>Regular third-party security audits and penetration testing</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#6b7ce5] mt-1">•</span>
            <p>Bug bounty program to incentivize responsible disclosure</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#6b7ce5] mt-1">•</span>
            <p>Automated vulnerability scanning and dependency updates</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#6b7ce5] mt-1">•</span>
            <p>Role-based access control (RBAC) for team management</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#6b7ce5] mt-1">•</span>
            <p>Two-factor authentication (2FA) support</p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-3">Report a Security Issue</h3>
        <p className="text-slate-400 mb-4">
          If you discover a security vulnerability, please report it to us at{' '}
          <a href="mailto:security@aether.dev" className="text-[#6b7ce5] hover:underline">security@aether.dev</a>.
          We take all reports seriously and will respond within 24 hours.
        </p>
      </div>
    </PageLayout>
  );
}
