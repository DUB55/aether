import React, { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // Simulate form submission
    setSubmitted(true);
    toast.success('Message sent! We\'ll get back to you soon.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <PageLayout
      title="Contact Us"
      description="We'd love to hear from you. Get in touch with our team."
    >
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-[#6b7ce5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Email</h3>
          <p className="text-slate-400 mb-2">For general inquiries:</p>
          <a href="mailto:hello@aether.dev" className="text-[#6b7ce5] hover:underline">
            hello@aether.dev
          </a>
        </div>

        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
            <MessageSquare className="w-6 h-6 text-[#6b7ce5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Community</h3>
          <p className="text-slate-400 mb-2">Join our Discord:</p>
          <button className="text-[#6b7ce5] hover:underline">
            discord.gg/aether
          </button>
        </div>

        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <div className="w-12 h-12 rounded-xl bg-[#5063F0]/15 flex items-center justify-center mb-4">
            <Send className="w-6 h-6 text-[#6b7ce5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Support</h3>
          <p className="text-slate-400 mb-2">For technical help:</p>
          <a href="mailto:support@aether.dev" className="text-[#6b7ce5] hover:underline">
            support@aether.dev
          </a>
        </div>
      </div>

      <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-8">
        <h3 className="text-xl font-semibold text-slate-200 mb-6">Send us a message</h3>
        
        {submitted ? (
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h4 className="text-lg font-semibold text-slate-200 mb-2">Message Sent!</h4>
            <p className="text-slate-400 text-center">We'll get back to you as soon as possible.</p>
            <button 
              onClick={() => setSubmitted(false)}
              className="mt-6 px-6 py-2 rounded-lg bg-[#5063F0] text-white hover:bg-[#4765EE] transition-colors"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#02040a] border border-white/[0.06] text-slate-200 focus:outline-none focus:border-[#5063F0]/30"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#02040a] border border-white/[0.06] text-slate-200 focus:outline-none focus:border-[#5063F0]/30"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                className="w-full px-4 py-2.5 rounded-lg bg-[#02040a] border border-white/[0.06] text-slate-200 focus:outline-none focus:border-[#5063F0]/30"
                placeholder="How can we help you?"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-[#5063F0] text-white font-semibold hover:bg-[#4765EE] transition-colors"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </PageLayout>
  );
}
