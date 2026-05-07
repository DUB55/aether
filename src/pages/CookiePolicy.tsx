import React from 'react';
import { PageLayout } from '@/components/PageLayout';

export default function CookiePolicy() {
  return (
    <PageLayout title="Cookie Policy">
      <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-8 space-y-6">
        <section>
          <h3 className="text-lg font-semibold text-slate-200 mb-3">What are Cookies?</h3>
          <p className="text-slate-400">
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
            They are widely used to make websites work more efficiently and provide information to the website owners.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-slate-200 mb-3">How We Use Cookies</h3>
          <p className="text-slate-400 mb-3">We use cookies for the following purposes:</p>
          <ul className="list-disc list-inside text-slate-400 space-y-1">
            <li>Essential cookies: Required for the website to function properly</li>
            <li>Preference cookies: Remember your settings and preferences</li>
            <li>Analytics cookies: Help us understand how visitors interact with our website</li>
            <li>Marketing cookies: Used to deliver relevant advertisements</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-slate-200 mb-3">Managing Cookies</h3>
          <p className="text-slate-400">
            Most web browsers allow you to control cookies through their settings. You can usually find these settings 
            in the "Options" or "Preferences" menu of your browser. Please note that disabling certain cookies may 
            affect the functionality of this website.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-slate-200 mb-3">Contact Us</h3>
          <p className="text-slate-400">
            If you have any questions about our use of cookies, please contact us at{' '}
            <a href="mailto:privacy@aether.dev" className="text-[#6b7ce5] hover:underline">privacy@aether.dev</a>
          </p>
        </section>

        <p className="text-slate-500 text-sm">Last updated: May 5, 2026</p>
      </div>
    </PageLayout>
  );
}
