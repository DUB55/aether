import React, { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { MapPin, Briefcase, Clock, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

export default function Careers() {
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);

  const positions = [
    {
      title: 'Senior Full-Stack Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'We are looking for an experienced full-stack engineer to help build and scale our AI-powered development platform. You will work on complex technical challenges across our entire stack.',
      responsibilities: [
        'Design and implement scalable web applications using React, Node.js, and modern frameworks',
        'Collaborate with AI/ML engineers to integrate AI capabilities into the editor',
        'Build and maintain APIs that power real-time collaboration features',
        'Optimize application performance and ensure excellent user experience',
        'Mentor junior engineers and contribute to technical architecture decisions',
        'Participate in code reviews and maintain high code quality standards'
      ],
      requirements: [
        '5+ years of experience in full-stack development',
        'Strong proficiency in React, TypeScript, and Node.js',
        'Experience with real-time applications and WebSocket protocols',
        'Knowledge of cloud services (AWS, GCP, or Azure)',
        'Excellent problem-solving and communication skills',
        'Experience with AI/ML integration is a plus'
      ],
      benefits: [
        'Competitive salary ($150k-$200k based on experience)',
        'Equity package',
        'Fully remote with flexible hours',
        'Unlimited PTO',
        '$5,000 annual learning and development budget',
        'Latest MacBook Pro and equipment',
        'Health, dental, and vision insurance'
      ]
    },
    {
      title: 'AI/ML Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Join our AI team to build the next generation of code understanding and generation models. You will work on cutting-edge ML research and apply it to real-world developer tools.',
      responsibilities: [
        'Develop and train transformer-based models for code understanding',
        'Design and implement fine-tuning pipelines for domain-specific tasks',
        'Optimize models for inference latency and memory efficiency',
        'Research and implement state-of-the-art techniques in code generation',
        'Collaborate with product team to translate research into features',
        'Build evaluation frameworks to measure model performance'
      ],
      requirements: [
        'PhD or Masters in Computer Science, ML, or related field',
        '3+ years of experience in ML/AI research or development',
        'Strong proficiency in Python and PyTorch/TensorFlow',
        'Experience with transformer architectures and LLMs',
        'Published research in top ML conferences is a plus',
        'Understanding of software development practices'
      ],
      benefits: [
        'Competitive salary ($180k-$250k based on experience)',
        'Generous equity package',
        'Fully remote with flexible hours',
        'Unlimited PTO',
        '$10,000 annual learning and conference budget',
        'Access to latest GPU computing resources',
        'Health, dental, and vision insurance'
      ]
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      description: 'We are seeking a talented product designer to shape the future of AI-powered development tools. You will work closely with engineering and product to create intuitive and powerful user experiences.',
      responsibilities: [
        'Lead design initiatives across web and mobile platforms',
        'Create wireframes, prototypes, and high-fidelity designs',
        'Conduct user research and usability testing',
        'Develop and maintain design system components',
        'Collaborate with engineers to ensure design implementation',
        'Present design decisions to stakeholders and gather feedback'
      ],
      requirements: [
        '5+ years of product design experience',
        'Strong portfolio showcasing UX/UI design work',
        'Proficiency in Figma and design tools',
        'Experience with design systems and component libraries',
        'Excellent communication and collaboration skills',
        'Understanding of technical constraints and possibilities'
      ],
      benefits: [
        'Competitive salary ($130k-$170k based on experience)',
        'Equity package',
        'Fully remote with flexible hours',
        'Unlimited PTO',
        '$3,000 annual learning and design tool budget',
        'Latest design equipment and software',
        'Health, dental, and vision insurance'
      ]
    },
    {
      title: 'Developer Relations',
      department: 'Growth',
      location: 'Remote',
      type: 'Full-time',
      description: 'We are looking for a developer advocate to build and nurture our developer community. You will be the bridge between our engineering team and the developers who use Aether.',
      responsibilities: [
        'Create technical content including tutorials, blog posts, and documentation',
        'Engage with the community through social media, forums, and events',
        'Gather feedback from developers and share with product team',
        'Build example applications and demos showcasing Aether capabilities',
        'Speak at conferences and meetups about Aether and AI development',
        'Support developers through Discord, GitHub, and other channels'
      ],
      requirements: [
        '3+ years of experience in developer relations or technical evangelism',
        'Strong technical background in software development',
        'Excellent public speaking and writing skills',
        'Experience creating technical content and documentation',
        'Active participant in developer communities',
        'Passion for developer tools and AI technology'
      ],
      benefits: [
        'Competitive salary ($120k-$160k based on experience)',
        'Equity package',
        'Fully remote with flexible hours',
        'Unlimited PTO',
        '$5,000 annual conference and content creation budget',
        'Latest equipment and tools',
        'Health, dental, and vision insurance'
      ]
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
            className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] overflow-hidden hover:border-[#5063F0]/30 transition-colors"
          >
            <div
              className="p-6 cursor-pointer group"
              onClick={() => setExpandedPosition(expandedPosition === position.title ? null : position.title)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
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
                {expandedPosition === position.title ? (
                  <ChevronUp className="w-5 h-5 text-[#6b7ce5] ml-4 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500 group-hover:text-[#6b7ce5] ml-4 flex-shrink-0" />
                )}
              </div>
            </div>

            {expandedPosition === position.title && (
              <div className="px-6 pb-6 border-t border-white/[0.06] pt-6">
                <p className="text-slate-300 mb-6">{position.description}</p>

                <div className="space-y-6">
                  <div>
                    <h5 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#6b7ce5]" />
                      Responsibilities
                    </h5>
                    <ul className="space-y-2 text-slate-400">
                      {position.responsibilities.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-[#6b7ce5] mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#6b7ce5]" />
                      Requirements
                    </h5>
                    <ul className="space-y-2 text-slate-400">
                      {position.requirements.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-[#6b7ce5] mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-[#6b7ce5]" />
                      Benefits
                    </h5>
                    <ul className="space-y-2 text-slate-400">
                      {position.benefits.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-[#6b7ce5] mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  className="mt-6 px-6 py-2 bg-[#5063F0] hover:bg-[#6b7ce5] text-white rounded-lg transition-colors text-sm font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open('mailto:careers@aether.ai?subject=Application for ' + encodeURIComponent(position.title), '_blank');
                  }}
                >
                  Apply Now
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
