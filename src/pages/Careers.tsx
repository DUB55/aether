import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { MapPin, Briefcase, Clock, ArrowRight } from 'lucide-react';

export default function Careers() {
  const positions = [
    {
      title: 'Senior Full-Stack Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
    },
    {
      title: 'AI/ML Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
    },
    {
      title: 'Developer Relations',
      department: 'Growth',
      location: 'Remote',
      type: 'Full-time',
    },
  ];

  return (
    <PageLayout
      title="Careers"
      description="Join us in building the future of software development."
    >
      <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-8 mb-8">
        <h3 className="text-xl font-semibold text-slate-200 mb-4">Why Aether?</h3>
        <ul className="space-y-3 text-slate-400">
          <li>• Work on cutting-edge AI technology</li>
          <li>• Fully remote team with flexible hours</li>
          <li>• Competitive salary and equity</li>
          <li>• Unlimited PTO</li>
          <li>• Latest equipment and tools</li>
          <li>• Learning and development budget</li>
        </ul>
      </div>

      <h3 className="text-xl font-semibold text-slate-200 mb-4">Open Positions</h3>
      <div className="space-y-4">
        {positions.map((position) => (
          <div
            key={position.title}
            className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6 hover:border-[#5063F0]/30 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-200 mb-2">{position.title}</h4>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                  <span className="px-2 py-1 rounded bg-[#5063F0]/10 text-[#6b7ce5]">
                    {position.department}
                  </span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {position.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {position.type}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-[#6b7ce5] group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
