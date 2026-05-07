import React from 'react';
import { PageLayout } from '@/components/PageLayout';

export default function License() {
  return (
    <PageLayout title="License">
      <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-8 space-y-6">
        <section>
          <h3 className="text-lg font-semibold text-slate-200 mb-3">MIT License</h3>
          <p className="text-slate-400 mb-3">
            Copyright (c) 2026 DUB5
          </p>
          <p className="text-slate-400">
            Permission is hereby granted, free of charge, to any person obtaining a copy
            of this software and associated documentation files (the "Software"), to deal
            in the Software without restriction, including without limitation the rights
            to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
            copies of the Software, and to permit persons to whom the Software is
            furnished to do so, subject to the following conditions:
          </p>
        </section>

        <section>
          <p className="text-slate-400">
            The above copyright notice and this permission notice shall be included in all
            copies or substantial portions of the Software.
          </p>
        </section>

        <section>
          <p className="text-slate-400">
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
            IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
            AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
            LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
            OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
            SOFTWARE.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-slate-200 mb-3">Third-Party Licenses</h3>
          <p className="text-slate-400">
            Aether uses various open-source libraries and tools. All third-party licenses
            are available in our{' '}
            <a href="https://github.com/DUB55/aether" className="text-[#6b7ce5] hover:underline" target="_blank" rel="noopener noreferrer">
              GitHub repository
            </a>.
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
