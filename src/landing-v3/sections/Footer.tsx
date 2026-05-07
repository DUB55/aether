'use client';

import { AetherLogo } from '@/components/aether-logo';
import { Github, Twitter, MessageCircle } from 'lucide-react';

export function Footer() {
  const footerLinks = {
    product: {
      title: 'Product',
      links: [
        { label: 'Editor', href: '/editor-page' },
        { label: 'Templates', href: '/templates' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Changelog', href: '/changelog' },
      ],
    },
    resources: {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '/documentation' },
        { label: 'API Reference', href: '/api-reference' },
        { label: 'Guides', href: '/guides' },
        { label: 'Blog', href: '/blog' },
      ],
    },
    company: {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press', href: '/press' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    legal: {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '/privacy-policy' },
        { label: 'Terms', href: '/terms-of-service' },
        { label: 'Cookie Policy', href: '/cookie-policy' },
        { label: 'License', href: '/license' },
      ],
    },
  };

  const handleNavigation = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    window.history.pushState({}, '', href);
    window.dispatchEvent(new Event('routechange'));
  };

  return (
    <footer className="py-12 px-4 bg-gray-100 dark:bg-[#050505] border-t border-gray-200 dark:border-[#222]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Logo */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" onClick={(e) => handleNavigation(e, '/')} className="flex items-center gap-2 mb-4 cursor-pointer">
              <AetherLogo className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Aether</span>
            </a>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Build apps by asking AI.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => handleNavigation(e, link.href)}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-gray-200 dark:border-[#222]">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-0">
            © {new Date().getFullYear()} DUB5. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <a
              href="https://discord.gg/aether"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#111] transition-colors"
              aria-label="Discord"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/DUB55/aether"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#111] transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com/aether"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#111] transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
