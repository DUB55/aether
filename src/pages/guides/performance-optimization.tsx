import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { ArrowLeft, Zap, Gauge, Clock, CheckCircle2 } from 'lucide-react';

export default function PerformanceOptimization() {
  return (
    <PageLayout
      title="Performance Optimization"
      description="Optimize your applications for speed and efficiency."
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
            <Zap className="w-5 h-5 text-[#6b7ce5]" />
          </div>
          <span className="text-xs text-slate-500">7 min read</span>
        </div>

        <h1 className="text-4xl font-bold text-slate-200 mb-6">Performance Optimization Guide</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-slate-300 mb-6">
            Performance is critical for user experience and business success. This guide covers strategies and techniques to optimize your applications built with Aether, from initial setup to advanced optimization techniques.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Measuring Performance</h2>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-[#6b7ce5]" />
            Built-in Performance Tools
          </h3>
          <p className="text-slate-300 mb-4">
            Aether includes built-in performance profiling tools. Access them from the terminal panel by running the performance analysis command. These tools identify bottlenecks, memory leaks, and slow rendering components.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#6b7ce5]" />
            Key Metrics to Track
          </h3>
          <p className="text-slate-300 mb-4">
            Monitor these key performance metrics:
          </p>
          <ul className="list-disc pl-6 text-slate-300 mb-4 space-y-2">
            <li><strong>First Contentful Paint (FCP):</strong> Time to first visual content</li>
            <li><strong>Largest Contentful Paint (LCP):</strong> Time to main content load</li>
            <li><strong>Time to Interactive (TTI):</strong> Time when page becomes interactive</li>
            <li><strong>Cumulative Layout Shift (CLS):</strong> Visual stability during load</li>
            <li><strong>First Input Delay (FID):</strong> Responsiveness to user input</li>
          </ul>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Code Optimization</h2>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#6b7ce5]" />
            Code Splitting
          </h3>
          <p className="text-slate-300 mb-4">
            Split your code into smaller chunks that load on demand. Ask Aether to "implement code splitting for this route" or "lazy load this component." This reduces initial bundle size and improves load times.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#6b7ce5]" />
            Tree Shaking
          </h3>
          <p className="text-slate-300 mb-4">
            Remove unused code from your bundles. Aether automatically optimizes imports, but you can request "optimize this file to remove unused imports" for additional cleanup.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#6b7ce5]" />
            Memoization
          </h3>
          <p className="text-slate-300 mb-4">
            Use memoization to avoid expensive recalculations. Request "add memoization to this component" to implement React.memo, useMemo, or useCallback where appropriate.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Asset Optimization</h2>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-[#6b7ce5]" />
            Image Optimization
          </h3>
          <p className="text-slate-300 mb-4">
            Optimize images for web by compressing them and using modern formats like WebP. Aether can automatically optimize images when you add them. Request "optimize all images in this project" for comprehensive optimization.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-[#6b7ce5]" />
            Lazy Loading
          </h3>
          <p className="text-slate-300 mb-4">
            Implement lazy loading for images and components that are below the fold. Ask Aether to "add lazy loading to images on this page" to defer loading until needed.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-[#6b7ce5]" />
            CDN Integration
          </h3>
          <p className="text-slate-300 mb-4">
            Serve static assets through a CDN for faster delivery globally. Aether's deployment automatically includes CDN integration. Configure custom CDN endpoints in your project settings if needed.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">React-Specific Optimizations</h2>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#6b7ce5]" />
            Virtual Scrolling
          </h3>
          <p className="text-slate-300 mb-4">
            For long lists, use virtual scrolling to render only visible items. Request "implement virtual scrolling for this list" to add efficient rendering for large datasets.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#6b7ce5]" />
            Avoid Unnecessary Re-renders
          </h3>
          <p className="text-slate-300 mb-4">
            Identify and fix components that re-render unnecessarily. Aether's performance profiler highlights these issues. Request "optimize this component to prevent unnecessary re-renders" for fixes.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#6b7ce5]" />
            Use Keys Properly
          </h3>
          <p className="text-slate-300 mb-4">
            Ensure lists use stable, unique keys for efficient reconciliation. Aether automatically handles this in generated code, but manually added code should follow best practices.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">API and Data Optimization</h2>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#6b7ce5]" />
            Caching Strategies
          </h3>
          <p className="text-slate-300 mb-4">
            Implement caching for API responses to reduce server load. Request "add caching to this API call" to implement appropriate caching strategies with cache invalidation.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#6b7ce5]" />
            Debouncing and Throttling
          </h3>
          <p className="text-slate-300 mb-4">
            Use debouncing for search inputs and throttling for scroll events. Request "add debouncing to this search input" to implement these performance patterns.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#6b7ce5]" />
            Pagination and Infinite Scroll
          </h3>
          <p className="text-slate-300 mb-4">
            For large datasets, implement pagination or infinite scroll instead of loading all data at once. Request "add pagination to this list" for efficient data loading.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Deployment Optimization</h2>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-[#6b7ce5]" />
            Build Optimization
          </h3>
          <p className="text-slate-300 mb-4">
            Aether automatically optimizes builds with minification, compression, and tree shaking. The production build is significantly smaller and faster than development builds.
          </p>

          <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-[#6b7ce5]" />
            Server-Side Rendering
          </h3>
          <p className="text-slate-300 mb-4">
            For SEO-critical pages, consider server-side rendering. Request "add SSR to this page" to implement server-side rendering with appropriate hydration.
          </p>

          <h2 className="text-2xl font-semibold text-slate-200 mt-8 mb-4">Monitoring and Continuous Optimization</h2>
          <p className="text-slate-300 mb-4">
            Performance optimization is an ongoing process. Set up monitoring to track performance metrics over time. Aether provides integration with popular monitoring tools. Regularly review performance reports and address regressions.
          </p>

          <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6 mt-8">
            <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#6b7ce5]" />
              Performance Checklist
            </h3>
            <ul className="list-disc pl-6 text-slate-300 space-y-2">
              <li>Bundle size is optimized with code splitting</li>
              <li>Images are compressed and in modern formats</li>
              <li>Lazy loading is implemented for off-screen content</li>
              <li>Components are memoized where appropriate</li>
              <li>API calls are cached and debounced</li>
              <li>Virtual scrolling is used for long lists</li>
              <li>Performance metrics are monitored</li>
              <li>Build is optimized for production</li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
