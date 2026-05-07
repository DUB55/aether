import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Target, Users, Rocket, Heart } from 'lucide-react';

export default function About() {
  return (
    <PageLayout
      title="About Aether"
      description="Empowering developers to build the future."
    >
      <div className="space-y-8">
        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-8">
          <h3 className="text-2xl font-bold text-slate-200 mb-4">Our Mission</h3>
          <p className="text-slate-400 text-lg leading-relaxed">
            Aether was founded with a simple mission: to democratize software development. 
            We believe that anyone with an idea should be able to build it, regardless of 
            their technical background. By combining the power of AI with intuitive tools, 
            we're making production-ready software accessible to everyone.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
            <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-[#6b7ce5]" />
            </div>
            <h4 className="text-lg font-semibold text-slate-200 mb-2">Our Vision</h4>
            <p className="text-slate-400">A world where creating software is as natural as having a conversation.</p>
          </div>

          <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
            <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-[#6b7ce5]" />
            </div>
            <h4 className="text-lg font-semibold text-slate-200 mb-2">Our Team</h4>
            <p className="text-slate-400">A passionate group of engineers, designers, and dreamers building the future.</p>
          </div>

          <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
            <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
              <Rocket className="w-6 h-6 text-[#6b7ce5]" />
            </div>
            <h4 className="text-lg font-semibold text-slate-200 mb-2">Our Journey</h4>
            <p className="text-slate-400">From a simple idea to a platform used by thousands of developers worldwide.</p>
          </div>

          <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
            <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-[#6b7ce5]" />
            </div>
            <h4 className="text-lg font-semibold text-slate-200 mb-2">Built with Passion</h4>
            <p className="text-slate-400">Every line of code, every pixel, crafted with love by DUB5.</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
