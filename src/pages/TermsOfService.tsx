import React from 'react';
import { AetherLogo } from '@/components/aether-logo';
import { Footer } from '@/components/Footer';

export default function TermsOfService() {
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
              <h1 className="text-4xl font-bold">Terms of Service</h1>
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
              Welcome to Aether. These Terms of Service ("Terms") govern your use of our AI-powered development platform. By using Aether, you agree to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--t)] mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing or using Aether, you accept and agree to be bound by these Terms. If you do not agree to these Terms, you may not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--t)] mb-4">2. Description of Service</h2>
            <p className="leading-relaxed">
              Aether is an AI-powered development platform that provides code generation, project management, and collaboration tools. We offer various AI models and features to help developers build applications efficiently.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--t)] mb-4">3. User Accounts</h2>
            <div className="space-y-3">
              <p>To use Aether, you must:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Be at least 13 years of age</li>
                <li>Provide accurate information during registration</li>
                <li>Maintain the security of your account credentials</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--t)] mb-4">4. Acceptable Use</h2>
            <p className="leading-relaxed mb-3">You agree not to use Aether to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Generate malicious, harmful, or illegal code</li>
              <li>Violate intellectual property rights</li>
              <li>Engage in fraudulent or deceptive activities</li>
              <li>Spam or harass other users</li>
              <li>Attempt to compromise our systems or security</li>
              <li>Reverse engineer or attempt to extract our AI models</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--t)] mb-4">5. Intellectual Property</h2>
            <div className="space-y-3">
              <p><strong>Your Content:</strong> You retain ownership of all code and projects you create using Aether.</p>
              <p><strong>Service Rights:</strong> We retain all rights to the Aether platform, including AI models, user interface, and underlying technology.</p>
              <p><strong>License:</strong> By using Aether, you grant us a limited license to store, process, and display your content solely to provide the service.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--t)] mb-4">6. Privacy and Data</h2>
            <p className="leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--t)] mb-4">7. Service Availability</h2>
            <p className="leading-relaxed">
              We strive to maintain high service availability but cannot guarantee uninterrupted access. We may update, modify, or discontinue features at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--t)] mb-4">8. Limitation of Liability</h2>
            <p className="leading-relaxed">
              Aether is provided "as is" without warranties. We are not liable for any damages arising from your use of our service, including but not limited to lost data or business interruption.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--t)] mb-4">9. Termination</h2>
            <p className="leading-relaxed">
              We may terminate or suspend your account for violations of these Terms or at our discretion. You may also delete your account at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--t)] mb-4">10. Changes to Terms</h2>
            <p className="leading-relaxed">
              We may update these Terms periodically. Changes will be effective immediately upon posting. Your continued use of Aether constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--t)] mb-4">11. Contact Information</h2>
            <p className="leading-relaxed">
              If you have questions about these Terms, please contact us at legal@aether.dev
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
