import React, { useState, useEffect } from 'react';
import { Send, Users, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EmailForm {
  subject: string;
  html: string;
  text: string;
}

interface Subscriber {
  email: string;
  subscribed_at: string;
}

export function EmailAdmin() {
  const [form, setForm] = useState<EmailForm>({
    subject: '',
    html: '',
    text: '',
  });
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  // Load subscribers count
  const loadSubscribers = async () => {
    try {
      const response = await fetch('/api/email', {
        headers: { 'Authorization': `Bearer ${adminKey}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSubscriberCount(data.count);
        setSubscribers(data.subscribers || []);
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to load subscribers:', error);
      setAuthenticated(false);
    }
  };

  useEffect(() => {
    if (adminKey) {
      loadSubscribers();
    }
  }, [adminKey]);

  const handleSendToAll = async () => {
    if (!form.subject || !form.html) {
      toast.error('Please fill in both subject and email content');
      return;
    }

    if (!confirm(`Send this email to ${subscriberCount} subscribers?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`,
        },
        body: JSON.stringify({
          subject: form.subject,
          html: form.html,
          text: form.text || form.html.replace(/<[^>]*>/g, ''),
          sendToAll: true,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(data.message);
        setForm({ subject: '', html: '', text: '' });
      } else {
        toast.error(data.error || 'Failed to send emails');
      }
    } catch (error) {
      toast.error('Failed to send emails');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async (testEmail: string) => {
    if (!form.subject || !form.html) {
      toast.error('Please fill in both subject and email content');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`,
        },
        body: JSON.stringify({
          to: [testEmail],
          subject: `[TEST] ${form.subject}`,
          html: form.html,
          text: form.text || form.html.replace(/<[^>]*>/g, ''),
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(`Test email sent to ${testEmail}`);
      } else {
        toast.error(data.error || 'Failed to send test email');
      }
    } catch (error) {
      toast.error('Failed to send test email');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#02040a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-4">Email Admin</h2>
          <p className="text-slate-400 text-sm mb-4">Enter your admin API key to access the email system.</p>
          <input
            type="password"
            placeholder="Admin API Key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-[#02040a] border border-white/[0.06] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#5063F0]/30"
          />
          <button
            onClick={loadSubscribers}
            className="w-full mt-4 px-4 py-2.5 rounded-lg bg-[#5063F0] text-white font-semibold hover:bg-[#4765EE] transition-colors"
          >
            Access Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02040a] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Email Admin</h1>
            <p className="text-slate-400 text-sm">Send emails to your subscribers</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0a0f1a] rounded-lg border border-white/[0.06]">
            <Users className="w-4 h-4 text-[#6b7ce5]" />
            <span className="text-slate-300 font-medium">{subscriberCount} subscribers</span>
          </div>
        </div>

        {/* Email Form */}
        <div className="bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g., Aether v2.0 is here!"
              className="w-full px-4 py-2.5 rounded-lg bg-[#02040a] border border-white/[0.06] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#5063F0]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">HTML Content</label>
            <textarea
              value={form.html}
              onChange={(e) => setForm({ ...form, html: e.target.value })}
              placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
              rows={10}
              className="w-full px-4 py-2.5 rounded-lg bg-[#02040a] border border-white/[0.06] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#5063F0]/30 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Plain Text (optional)</label>
            <textarea
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="Plain text version of your email..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg bg-[#02040a] border border-white/[0.06] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#5063F0]/30"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/[0.06]">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] text-slate-300 hover:bg-white/[0.08] transition-colors"
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Hide Preview' : 'Preview'}
            </button>

            <button
              onClick={() => handleTestEmail('test@example.com')}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] text-slate-300 hover:bg-white/[0.08] transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Send Test
            </button>

            <button
              onClick={handleSendToAll}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#5063F0] text-white font-semibold hover:bg-[#4765EE] transition-colors disabled:opacity-50 ml-auto"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send to All ({subscriberCount})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview */}
        {previewMode && form.html && (
          <div className="mt-6 bg-white rounded-xl p-8">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: form.html }}
            />
          </div>
        )}

        {/* Subscribers List */}
        <div className="mt-8 bg-[#0a0f1a] rounded-xl border border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Recent Subscribers</h3>
          {subscribers.length === 0 ? (
            <p className="text-slate-500">No subscribers yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {subscribers.slice(0, 50).map((sub, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between px-4 py-2 bg-[#02040a] rounded-lg"
                >
                  <span className="text-slate-300 text-sm">{sub.email}</span>
                  <span className="text-slate-500 text-xs">
                    {new Date(sub.subscribed_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
