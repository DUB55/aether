import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Calendar, ArrowLeft, Share2 } from 'lucide-react';

export default function IntroducingAetherV2() {
  return (
    <PageLayout
      title="Introducing Aether v2.0"
      description="The next generation of AI-powered development with enhanced features and improved performance."
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
            Product
          </span>
          <div className="flex items-center gap-1 text-slate-500 text-sm">
            <Calendar className="w-3 h-3" />
            May 5, 2026
          </div>
        </div>

        <h1 className="text-4xl font-bold text-slate-200 mb-6">Introducing Aether v2.0</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-slate-300 mb-6">
            We're thrilled to announce the release of Aether v2.0, a major milestone in our journey to revolutionize software development through artificial intelligence. This release represents months of dedicated work, incorporating feedback from thousands of developers and leveraging cutting-edge AI advancements.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">What's New in v2.0</h2>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Enhanced AI Capabilities</h3>
          <p className="text-slate-300 mb-4">
            Aether v2.0 introduces our most advanced AI model yet, with improved context understanding, better code generation accuracy, and enhanced multi-file project awareness. The AI can now understand complex project structures, maintain consistency across files, and generate production-ready code with fewer iterations.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Real-time Collaboration</h3>
          <p className="text-slate-300 mb-4">
            Team development has never been easier. Our new real-time collaboration features allow multiple developers to work on the same project simultaneously, with AI assistance that understands the collective context. Changes sync instantly, and the AI adapts to the evolving codebase in real-time.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Advanced Debugging</h3>
          <p className="text-slate-300 mb-4">
            Our intelligent debugging system has been completely overhauled. Aether v2.0 can now identify bugs before they happen, suggest fixes with explanations, and even automatically run tests to verify solutions. The new visual debugger provides unprecedented insight into code execution.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Performance Improvements</h3>
          <p className="text-slate-300 mb-4">
            We've optimized every aspect of the platform. The editor is now 3x faster, AI responses are 50% quicker, and memory usage has been reduced by 40%. These improvements mean you can work on larger projects without any performance degradation.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Enterprise Features</h2>
          <p className="text-slate-300 mb-4">
            For our enterprise customers, v2.0 introduces advanced security features, custom AI model training on your codebase, and seamless integration with existing CI/CD pipelines. The new team management dashboard provides comprehensive oversight of all development activities.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Getting Started</h2>
          <p className="text-slate-300 mb-4">
            Existing users will be automatically upgraded to v2.0. New users can start immediately with all features available. We've updated our documentation with comprehensive guides for all new features, and our support team is ready to help with any questions.
          </p>

          <p className="text-slate-300 mb-4">
            This is just the beginning. We have an exciting roadmap ahead, with even more powerful features planned for the coming months. Thank you to our incredible community for your feedback and support in making Aether v2.0 possible.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
