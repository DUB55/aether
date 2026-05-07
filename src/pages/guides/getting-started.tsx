import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { ArrowLeft, Rocket, CheckCircle2, ArrowRight } from 'lucide-react';

export default function GettingStarted() {
  return (
    <PageLayout
      title="Getting Started"
      description="Learn the basics of Aether and create your first project in minutes."
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
            <Rocket className="w-5 h-5 text-[#6b7ce5]" />
          </div>
          <span className="text-xs text-slate-500">5 min read</span>
        </div>

        <h1 className="text-4xl font-bold text-slate-200 mb-6">Getting Started with Aether</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-slate-300 mb-6">
            Welcome to Aether, the AI-powered development platform that transforms how you build applications. This guide will walk you through setting up your account, creating your first project, and understanding the core features that make Aether powerful.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Step 1: Create Your Account</h2>
          <p className="text-slate-300 mb-4">
            Getting started with Aether is simple. Visit our website and click "Get Started for Free." You can sign up using your email, Google account, or GitHub account. The signup process takes less than a minute, and you'll have immediate access to all core features.
          </p>
          <p className="text-slate-300 mb-4">
            After signing up, you'll be taken to your dashboard where you can manage projects, access templates, and configure your preferences. Take a moment to explore the interface and familiarize yourself with the layout.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Step 2: Create Your First Project</h2>
          <p className="text-slate-300 mb-4">
            Creating a project in Aether is as simple as describing what you want to build. Click the "New Project" button on your dashboard and enter a natural language description of your application. For example: "Build a modern e-commerce dashboard with product listings, shopping cart, and checkout."
          </p>
          <p className="text-slate-300 mb-4">
            Aether's AI will analyze your request and generate a complete project structure with all necessary files. This typically takes 10-30 seconds depending on the complexity of your request. You'll see real-time progress in the terminal panel.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Step 3: Explore the Editor Interface</h2>
          <p className="text-slate-300 mb-4">
            The Aether editor is designed for maximum productivity. Here's a quick overview of the main components:
          </p>
          <ul className="list-disc pl-6 text-slate-300 mb-4 space-y-2">
            <li><strong>File Explorer:</strong> Browse and manage your project files on the left panel</li>
            <li><strong>Code Editor:</strong> The main editing area with syntax highlighting and AI suggestions</li>
            <li><strong>Preview Panel:</strong> See your changes in real-time with instant preview</li>
            <li><strong>Chat Interface:</strong> Communicate with the AI to make changes and ask questions</li>
            <li><strong>Terminal:</strong> Run commands and see build output</li>
          </ul>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Step 4: Make Your First Edit</h2>
          <p className="text-slate-300 mb-4">
            Try making a simple change to see Aether in action. Click on any file in the file explorer to open it in the editor. Then, use the chat interface to request a change. For example: "Change the primary color to blue" or "Add a contact form to the homepage."
          </p>
          <p className="text-slate-300 mb-4">
            The AI will understand your request, make the necessary code changes, and update the preview automatically. You can iterate quickly, making multiple changes in succession without manual coding.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Step 5: Use Templates</h2>
          <p className="text-slate-300 mb-4">
            Aether includes a library of professionally designed templates to help you start faster. Click the "Templates" button to browse available templates for common use cases like landing pages, dashboards, e-commerce sites, and more.
          </p>
          <p className="text-slate-300 mb-4">
            Templates are fully customizable. Select a template, and then use the chat interface to customize it to match your needs. This approach combines the speed of templates with the flexibility of AI-powered customization.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Step 6: Save and Share</h2>
          <p className="text-slate-300 mb-4">
            Your projects are automatically saved to the cloud. You can access them from any device by logging into your account. To share your project with others, click the "Share" button and generate a shareable link.
          </p>
          <p className="text-slate-300 mb-4">
            Shared projects can be viewed in read-only mode, making it easy to showcase your work or collaborate with team members. For full collaboration features, consider upgrading to a team plan.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Step 7: Deploy Your Application</h2>
          <p className="text-slate-300 mb-4">
            When you're ready to deploy, Aether makes it simple. Click the "Deploy" button to launch your application. You can deploy to Aether's hosting platform or export your code to deploy elsewhere.
          </p>
          <p className="text-slate-300 mb-4">
            The deployment process is automated and includes build optimization, asset optimization, and SSL certificate setup. Your application will be live in minutes.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Next Steps</h2>
          <p className="text-slate-300 mb-4">
            Now that you've created your first project, explore our other guides to learn about best practices, security, and performance optimization. Join our community to connect with other developers and get help when you need it.
          </p>

          <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6 mt-8">
            <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#6b7ce5]" />
              You're ready to build!
            </h3>
            <p className="text-slate-300 mb-4">
              You've completed the getting started guide. You now have the foundation to build amazing applications with Aether. Remember, the AI is here to help—don't hesitate to ask questions or request changes in natural language.
            </p>
            <button
              onClick={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new Event('routechange'));
              }}
              className="flex items-center gap-2 text-[#6b7ce5] hover:text-[#5063F0] transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
