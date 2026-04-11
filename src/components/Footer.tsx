import React from 'react';
import { Heart } from 'lucide-react';
import { AetherLogo } from './aether-logo';

export function Footer() {
  return (
    <footer className="max-w-6xl w-full px-6 pt-24 pb-8 border-t border-[var(--bdr)] dark:border-white/5 mt-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
        <div className="col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <AetherLogo size={32} showText={false} />
            <span className="text-2xl font-black tracking-tighter">Aether</span>
          </div>
          <p className="text-[var(--t2)] max-w-xs">An autonomous platform for building production-ready software.</p>
          <div className="flex items-center gap-4">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <span className="text-sm font-bold text-[var(--t3)]">Built with passion by DUB5.</span>
          </div>
        </div>
        <div className="space-y-6">
          <h4 className="font-black uppercase tracking-widest text-xs text-[var(--t3)]">Product</h4>
          <ul className="space-y-4 text-sm font-bold text-[var(--t2)]">
            <li><a href="/projects" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/projects'); window.dispatchEvent(new Event('routechange')) }} className="hover:text-primary transition-colors cursor-pointer">All Projects</a></li>
            <li><a href="/templates" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/templates'); window.dispatchEvent(new Event('routechange')) }} className="hover:text-primary transition-colors cursor-pointer">Templates</a></li>
            <li><a href="/community" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/community'); window.dispatchEvent(new Event('routechange')) }} className="hover:text-primary transition-colors cursor-pointer">Community</a></li>
            <li><a href="/pricing" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/pricing'); window.dispatchEvent(new Event('routechange')) }} className="hover:text-primary transition-colors cursor-pointer">Pricing</a></li>
          </ul>
        </div>
        <div className="space-y-6">
          <h4 className="font-black uppercase tracking-widest text-xs text-[var(--t3)]">Resources</h4>
          <ul className="space-y-4 text-sm font-bold text-[var(--t2)]">
            <li><a href="/docs" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/docs'); window.dispatchEvent(new Event('routechange')) }} className="hover:text-primary transition-colors cursor-pointer">Documentation</a></li>
            <li><a href="/changelog" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/changelog'); window.dispatchEvent(new Event('routechange')) }} className="hover:text-primary transition-colors cursor-pointer">Changelog</a></li>
            <li><a href="https://github.com/DUB55/aether" target="_blank" className="hover:text-primary transition-colors cursor-pointer">GitHub</a></li>
            <li><a href="/privacy-policy" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/privacy-policy'); window.dispatchEvent(new Event('routechange')) }} className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</a></li>
            <li><a href="/terms-of-service" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/terms-of-service'); window.dispatchEvent(new Event('routechange')) }} className="hover:text-primary transition-colors cursor-pointer">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-24 pt-12 border-t border-[var(--bdr)] dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold text-[var(--t3)]">© 2026 DUB5. All rights reserved.</p>
          </div>
      </div>
    </footer>
  );
}
