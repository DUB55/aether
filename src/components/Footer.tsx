import React from 'react';
import { Rocket, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="max-w-6xl w-full px-6 py-24 border-t border-[var(--bdr)] dark:border-white/5 mt-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
        <div className="col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <Rocket className="w-8 h-8 text-primary" />
            <span className="text-2xl font-black tracking-tighter">AETHER</span>
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
        <p className="text-sm font-bold text-[var(--t3)]">© 2026 DUB5. All rights reserved.</p>
        <div className="flex items-center gap-8 text-sm font-bold text-[var(--t3)]">
          <a href="https://twitter.com/aether" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--t)] transition-colors">Twitter</a>
          <a href="https://discord.gg/aether" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--t)] transition-colors">Discord</a>
          <a href="https://linkedin.com/company/aether" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--t)] transition-colors">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
