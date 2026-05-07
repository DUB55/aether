import React, { useState } from 'react';
import { Heart, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { AetherLogo } from './aether-logo';
import { toast } from 'sonner';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [consent, setConsent] = useState(false);

  const handleSubscribe = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!consent) {
      toast.error('Please confirm you consent to receive emails');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(data.message);
        setSubscribed(true);
        setEmail('');
      } else {
        toast.error(data.message || 'Failed to subscribe');
      }
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const footerLinks = {
    product: {
      title: 'Product',
      links: [
        { label: 'Editor', href: '/editor-page' },
        { label: 'Templates', href: '/templates' },
        { label: 'Community', href: '/community' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Changelog', href: '/changelog' },
      ]
    },
    resources: {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '/documentation' },
        { label: 'API Reference', href: '/api-reference' },
        { label: 'Guides', href: '/guides' },
        { label: 'Blog', href: '/blog' },
        { label: 'Support', href: '/support' },
      ]
    },
    company: {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press', href: '/press' },
        { label: 'Partners', href: '/partners' },
        { label: 'Contact', href: '/contact' },
      ]
    },
    legal: {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms of Service', href: '/terms-of-service' },
        { label: 'Cookie Policy', href: '/cookie-policy' },
        { label: 'License', href: '/license' },
        { label: 'Security', href: '/security' },
      ]
    }
  };

  const handleNavigation = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    window.history.pushState({}, '', href);
    window.dispatchEvent(new Event('routechange'));
  };

  return (
    <footer className="w-full px-6 pt-24 pb-8 mt-auto border-t border-white/[0.06] bg-[#02040a]">
      <div className="max-w-7xl mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12 mb-16">
          {/* Brand column */}
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <AetherLogo size={40} showText={false} />
              <span className="text-2xl font-black tracking-tighter text-slate-100">Aether</span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
              An autonomous platform for building production-ready software. Transform your ideas into reality.
            </p>
            
            {/* Built with passion */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Built with</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span>by DUB5</span>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">{footerLinks.product.title}</h4>
            <ul className="space-y-3">
              {footerLinks.product.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavigation(e, link.href)}
                    className="text-sm text-slate-500 hover:text-[#6b7ce5] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-white/40">{footerLinks.resources.title}</h4>
            <ul className="space-y-3">
              {footerLinks.resources.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavigation(e, link.href)}
                    className="text-sm text-slate-500 hover:text-[#6b7ce5] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-white/40">{footerLinks.company.title}</h4>
            <ul className="space-y-3">
              {footerLinks.company.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavigation(e, link.href)}
                    className="text-sm text-slate-500 hover:text-[#6b7ce5] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-white/40">{footerLinks.legal.title}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavigation(e, link.href)}
                    className="text-sm text-slate-500 hover:text-[#6b7ce5] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        
        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span> {currentYear} DUB5. All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <a href="/privacy-policy" onClick={(e) => handleNavigation(e, '/privacy-policy')} className="text-slate-500 hover:text-[#6b7ce5] transition-colors">
              Privacy
            </a>
            <a href="/terms-of-service" onClick={(e) => handleNavigation(e, '/terms-of-service')} className="text-slate-500 hover:text-[#6b7ce5] transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
