import React from 'react';
import { AetherLogo } from '@/components/aether-logo';

export default function PrivacyPolicy() {
  const handleBackToHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('routechange'));
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--t)]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[var(--bg3)] flex items-center justify-center">
              <AetherLogo size={40} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-4xl font-bold">Privacy Policy</h1>
              <p className="text-[var(--t3)] text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <button
            onClick={handleBackToHome}
            className="px-6 py-3 bg-[var(--bg3)] hover:bg-[var(--bg2)] rounded-xl font-semibold transition-colors"
          >
            Back to Home
          </button>
        </div>

        {/* Content */}
        <div className="space-y-8 text-[var(--t2)]">
          <section>
            <p className="leading-relaxed">
              Aether ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our AI development platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--t)] mb-4">Information We Collect</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-[var(--t)]">Account Information</h3>
                <p>When you create an account, we collect your name, email address, and profile picture from your Google account.</p>
              </div>
              <div>
                <h3 className="font-medium text-[var(--t)]">Project Data</h3>
                <p>Your code files, project configurations, and development history are stored securely in our database.</p>
              </div>
              <div>
                <h3 className="font-medium text-[var(--t)]">Usage Data</h3>
                <p>We collect information about how you use Aether to improve our services, including feature usage and performance metrics.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--t)] mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Provide and maintain the Aether platform</li>
              <li>Authenticate users and manage accounts</li>
              <li>Store and sync your projects across devices</li>
              <li>Improve our AI models and features</li>
              <li>Provide customer support</li>
              <li>Ensure platform security and prevent abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--t)] mb-4">Data Security</h2>
            <p className="leading-relaxed">
              We implement industry-standard security measures including encryption, secure authentication, and regular security audits to protect your data. Your code is stored in secure Firebase databases with encrypted transmission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--t)] mb-4">Third-Party Services</h2>
            <p className="leading-relaxed">
              Aether integrates with Google Firebase for authentication and data storage, and various AI providers for code generation. These services have their own privacy policies and handle data according to their terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--t)] mb-4">Your Rights</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Access and export your data at any time</li>
              <li>Delete your account and all associated data</li>
              <li>Request a copy of your personal information</li>
              <li>Opt-out of non-essential data collection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--t)] mb-4">Contact Us</h2>
            <p className="leading-relaxed">
              If you have questions about this Privacy Policy or our data practices, please contact us at privacy@aether.dev
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
