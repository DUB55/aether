import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { ArrowLeft, Shield, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SecurityGuide() {
  return (
    <PageLayout
      title="Security Guide"
      description="How to build secure applications with automatic security rule generation."
    >
      <div className="max-w-4xl">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Guides
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#5063F0]/15 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#6b7ce5]" />
          </div>
          <span className="text-xs text-slate-500">8 min read</span>
        </div>

        <h1 className="text-4xl font-bold text-slate-200 mb-6">Security Guide</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-slate-300 mb-6">
            Security is paramount in modern application development. Aether includes intelligent security features that help you build secure applications by default. This guide covers security best practices and how to leverage Aether's security capabilities.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Built-in Security Features</h2>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#6b7ce5]" />
            Automatic Security Rule Generation
          </h3>
          <p className="text-slate-300 mb-4">
            Aether automatically generates security rules for your application based on its functionality. When you create features that handle user input, authentication, or data storage, Aether suggests appropriate security measures including input validation, output encoding, and access controls.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#6b7ce5]" />
            Dependency Vulnerability Scanning
          </h3>
          <p className="text-slate-300 mb-4">
            Every time you add dependencies to your project, Aether automatically scans them for known security vulnerabilities. You'll receive alerts if any packages have security issues, along with recommendations for fixes or alternatives.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#6b7ce5]" />
            Secure Authentication Templates
          </h3>
          <p className="text-slate-300 mb-4">
            Aether's authentication templates implement industry-standard security practices including password hashing, session management, and protection against common attacks like CSRF and XSS. When you request authentication features, you get secure implementations by default.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Common Security Vulnerabilities</h2>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#6b7ce5]" />
            Cross-Site Scripting (XSS)
          </h3>
          <p className="text-slate-300 mb-4">
            XSS attacks occur when untrusted data is included in web pages without proper validation or encoding. Aether automatically implements output encoding and content security policies to prevent XSS. When handling user input, ask the AI to "sanitize this input to prevent XSS attacks."
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#6b7ce5]" />
            SQL Injection
          </h3>
          <p className="text-slate-300 mb-4">
            SQL injection happens when user input is directly concatenated into SQL queries. Aether uses parameterized queries by default and will suggest secure database access patterns. Always use the AI's recommended database access methods rather than writing raw SQL.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#6b7ce5]" />
            Authentication and Authorization
          </h3>
          <p className="text-slate-300 mb-4">
            Implement proper authentication and authorization for protected resources. Aether can generate secure login systems, role-based access control, and API authentication. Use the AI to "add authentication to this endpoint with role-based access control."
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Data Protection</h2>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#6b7ce5]" />
            Encryption at Rest
          </h3>
          <p className="text-slate-300 mb-4">
            For sensitive data, implement encryption at rest. Aether can help you integrate encryption libraries and implement proper key management. Request "add encryption for sensitive user data" to get secure implementations.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#6b7ce5]" />
            Secure Data Transmission
          </h3>
          <p className="text-slate-300 mb-4">
            Always use HTTPS for data transmission. Aether automatically configures SSL certificates when deploying and enforces secure communication. Never disable security headers or use insecure protocols.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#6b7ce5]" />
            Data Minimization
          </h3>
          <p className="text-slate-300 mb-4">
            Collect and store only the data you need. Aether can help you design data schemas that minimize data collection. Ask the AI to "optimize this schema to collect only necessary user data."
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Security Best Practices</h2>
          <ul className="list-disc pl-6 text-slate-300 mb-4 space-y-2">
            <li>Keep all dependencies updated to patch known vulnerabilities</li>
            <li>Implement proper error handling that doesn't leak sensitive information</li>
            <li>Use environment variables for sensitive configuration (API keys, secrets)</li>
            <li>Implement rate limiting to prevent abuse</li>
            <li>Regularly audit your code for security issues</li>
            <li>Use Aether's security scanning features before deployment</li>
            <li>Implement proper logging and monitoring for security events</li>
          </ul>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Requesting Security Features</h2>
          <p className="text-slate-300 mb-4">
            When working with Aether, you can explicitly request security features:
          </p>
          <ul className="list-disc pl-6 text-slate-300 mb-4 space-y-2">
            <li>"Add input validation to this form to prevent XSS"</li>
            <li>"Implement rate limiting on this API endpoint"</li>
            <li>"Add CSRF protection to this form"</li>
            <li>"Secure this API endpoint with authentication"</li>
            <li>"Add security headers to prevent clickjacking"</li>
            <li>"Implement secure session management"</li>
          </ul>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Compliance and Regulations</h2>
          <p className="text-slate-300 mb-4">
            If your application needs to comply with regulations like GDPR, HIPAA, or PCI-DSS, inform the AI about these requirements. Aether can help implement features like data deletion requests, consent management, and audit logging to support compliance.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Security Testing</h2>
          <p className="text-slate-300 mb-4">
            Regular security testing is essential. Aether can help generate security test cases and implement security-focused testing. Request "add security tests for this authentication system" to get comprehensive test coverage.
          </p>

          <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6 mt-8">
            <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#6b7ce5]" />
              Security Checklist
            </h3>
            <ul className="list-disc pl-6 text-slate-300 space-y-2">
              <li>All user input is validated and sanitized</li>
              <li>Authentication and authorization are properly implemented</li>
              <li>Sensitive data is encrypted at rest and in transit</li>
              <li>Dependencies are regularly updated and scanned</li>
              <li>Security headers are configured</li>
              <li>Error messages don't leak sensitive information</li>
              <li>Rate limiting is implemented on public endpoints</li>
              <li>Logging and monitoring are in place</li>
              <li>Regular security audits are performed</li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
