import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { ArrowLeft, BookOpen, Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function BestPractices() {
  return (
    <PageLayout
      title="Best Practices"
      description="Tips and tricks for getting the most out of AI-powered development."
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
            <BookOpen className="w-5 h-5 text-[#6b7ce5]" />
          </div>
          <span className="text-xs text-slate-500">10 min read</span>
        </div>

        <h1 className="text-4xl font-bold text-slate-200 mb-6">Best Practices for AI-Powered Development</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-slate-300 mb-6">
            Developing with AI assistance requires a different mindset than traditional coding. This guide shares proven practices and techniques to maximize your productivity and code quality when working with Aether.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Communication with AI</h2>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#6b7ce5]" />
            Be Specific and Clear
          </h3>
          <p className="text-slate-300 mb-4">
            The quality of AI responses depends heavily on how you phrase your requests. Instead of vague instructions like "make it better," provide specific guidance: "Improve the loading performance by implementing lazy loading for images and adding a loading spinner."
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#6b7ce5]" />
            Provide Context
          </h3>
          <p className="text-slate-300 mb-4">
            Help the AI understand your project context. Reference specific files, components, or features when making requests. For example: "In the UserDashboard component, add a dark mode toggle that persists in localStorage."
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#6b7ce5]" />
            Break Down Complex Tasks
          </h3>
          <p className="text-slate-300 mb-4">
            Large, complex requests can overwhelm the AI. Break them into smaller, manageable steps. Instead of "build a complete e-commerce site," start with "create a product listing page," then "add a shopping cart," then "implement checkout."
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Code Review and Iteration</h2>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#6b7ce5]" />
            Review AI-Generated Code
          </h3>
          <p className="text-slate-300 mb-4">
            While Aether generates high-quality code, it's important to review the output. Check for logic errors, security issues, and adherence to your coding standards. Treat AI-generated code as a starting point that you refine and perfect.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#6b7ce5]" />
            Iterate Gradually
          </h3>
          <p className="text-slate-300 mb-4">
            Make incremental changes and test after each iteration. This approach makes it easier to identify issues and understand what's causing problems. If something breaks, you can quickly revert to the last working state.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#6b7ce5]" />
            Use Version Control
          </h3>
          <p className="text-slate-300 mb-4">
            Even with AI assistance, version control remains essential. Commit frequently with descriptive messages. Aether's snapshot feature can help, but traditional git workflows provide additional safety and collaboration benefits.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Project Organization</h2>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#6b7ce5]" />
            Maintain Clean Structure
          </h3>
          <p className="text-slate-300 mb-4">
            Keep your project organized with clear file and folder structures. Use descriptive names for files and components. A clean structure helps the AI understand your project and makes maintenance easier.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#6b7ce5]" />
            Document Your Code
          </h3>
          <p className="text-slate-300 mb-4">
            Add comments and documentation to help both humans and AI understand your code. Document component purposes, function signatures, and complex logic. Good documentation improves AI suggestions and makes onboarding easier.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Common Pitfalls to Avoid</h2>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#6b7ce5]" />
            Over-Reliance on AI
          </h3>
          <p className="text-slate-300 mb-4">
            While AI is powerful, it's not infallible. Don't blindly accept all suggestions. Use your judgment and expertise to evaluate recommendations. The best developers use AI as a tool, not a replacement for thinking.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#6b7ce5]" />
            Ignoring Fundamentals
          </h3>
          <p className="text-slate-300 mb-4">
            AI can help you write code faster, but it doesn't replace understanding fundamentals. Invest time in learning core concepts, algorithms, and design patterns. This knowledge will help you work more effectively with AI.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#6b7ce5]" />
            Skipping Testing
          </h3>
          <p className="text-slate-300 mb-4">
            Even with AI assistance, testing remains critical. Write tests for your code, especially for complex logic and user-facing features. Automated tests catch regressions and provide confidence when making changes.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Performance Tips</h2>
          <ul className="list-disc pl-6 text-slate-300 mb-4 space-y-2">
            <li>Use Aether's built-in performance profiling tools to identify bottlenecks</li>
            <li>Request optimized code explicitly: "optimize this function for performance"</li>
            <li>Leverage caching strategies suggested by the AI</li>
            <li>Minimize re-renders in React by following AI suggestions for memoization</li>
            <li>Use lazy loading for large components and routes</li>
          </ul>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Team Collaboration</h2>
          <p className="text-slate-300 mb-4">
            When working in teams, establish clear guidelines for AI usage. Decide when to use AI assistance, how to review AI-generated code, and how to document AI-assisted decisions. This consistency helps teams work effectively together.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Continuous Learning</h2>
          <p className="text-slate-300 mb-4">
            The field of AI-assisted development is evolving rapidly. Stay updated on new features and best practices by following our blog, participating in community discussions, and experimenting with new techniques. The most effective developers are continuous learners.
          </p>

          <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6 mt-8">
            <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#6b7ce5]" />
              Key Takeaways
            </h3>
            <ul className="list-disc pl-6 text-slate-300 space-y-2">
              <li>Communicate clearly and specifically with the AI</li>
              <li>Review and iterate on AI-generated code</li>
              <li>Maintain good coding practices and project organization</li>
              <li>Use AI as a tool to augment, not replace, your skills</li>
              <li>Test thoroughly and maintain version control</li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
