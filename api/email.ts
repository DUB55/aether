import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Email service configuration
// Supports: sendgrid, ses, resend, or smtp
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'resend';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@aether.dev';
const FROM_NAME = process.env.FROM_NAME || 'Aether by DUB5';

// Initialize Supabase client for storing subscribers
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface EmailRequest {
  to?: string[];
  subject: string;
  html: string;
  text?: string;
  sendToAll?: boolean;
}

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  status: 'active' | 'unsubscribed';
}

// Store subscriber in database
export async function subscribeEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Check if email already exists
    const { data: existing } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', email)
      .single();

    if (existing) {
      if (existing.status === 'unsubscribed') {
        // Re-subscribe
        await supabase
          .from('subscribers')
          .update({ status: 'active', subscribed_at: new Date().toISOString() })
          .eq('email', email);
        return { success: true, message: 'Welcome back! You have been re-subscribed.' };
      }
      return { success: false, message: 'This email is already subscribed.' };
    }

    // Add new subscriber
    const { error } = await supabase
      .from('subscribers')
      .insert([{ email, status: 'active', subscribed_at: new Date().toISOString() }]);

    if (error) throw error;

    return { success: true, message: 'Successfully subscribed!' };
  } catch (error) {
    console.error('Subscribe error:', error);
    return { success: false, message: 'Failed to subscribe. Please try again.' };
  }
}

// Unsubscribe email
export async function unsubscribeEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('subscribers')
      .update({ status: 'unsubscribed' })
      .eq('email', email);

    if (error) throw error;

    return { success: true, message: 'Successfully unsubscribed.' };
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return { success: false, message: 'Failed to unsubscribe. Please try again.' };
  }
}

// Get all active subscribers
export async function getSubscribers(): Promise<Subscriber[]> {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get subscribers error:', error);
    return [];
  }
}

// Send email using configured provider
async function sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
  switch (EMAIL_PROVIDER) {
    case 'resend':
      return sendWithResend(to, subject, html, text);
    case 'sendgrid':
      return sendWithSendGrid(to, subject, html, text);
    case 'ses':
      return sendWithSES(to, subject, html, text);
    default:
      console.log('Email would be sent (provider not configured):', { to, subject });
      return true;
  }
}

// Resend API
async function sendWithResend(to: string, subject: string, html: string, text?: string): Promise<boolean> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured');
      return false;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to,
        subject,
        html,
        text,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Resend error:', error);
    return false;
  }
}

// SendGrid API
async function sendWithSendGrid(to: string, subject: string, html: string, text?: string): Promise<boolean> {
  try {
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    if (!sendgridApiKey) {
      console.warn('SENDGRID_API_KEY not configured');
      return false;
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject,
        content: [
          { type: 'text/plain', value: text || '' },
          { type: 'text/html', value: html },
        ],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('SendGrid error:', error);
    return false;
  }
}

// AWS SES
async function sendWithSES(to: string, subject: string, html: string, text?: string): Promise<boolean> {
  // AWS SES implementation would go here
  console.warn('AWS SES not fully implemented');
  return false;
}

// Main API handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Admin authentication check
  const adminKey = req.headers.authorization?.replace('Bearer ', '');
  const expectedAdminKey = process.env.ADMIN_API_KEY;

  if (req.method === 'POST' && req.body?.sendToAll) {
    if (!expectedAdminKey || adminKey !== expectedAdminKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    switch (req.method) {
      case 'POST': {
        const { to, subject, html, text, sendToAll } = req.body as EmailRequest;

        if (sendToAll) {
          // Send to all subscribers
          const subscribers = await getSubscribers();
          const results = await Promise.all(
            subscribers.map(sub => sendEmail(sub.email, subject, html, text))
          );
          const successCount = results.filter(Boolean).length;
          
          return res.status(200).json({
            success: true,
            message: `Sent to ${successCount} of ${subscribers.length} subscribers`,
          });
        }

        if (!to || !subject || !html) {
          return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
        }

        // Send to specific recipients
        const results = await Promise.all(
          to.map(email => sendEmail(email, subject, html, text))
        );
        const successCount = results.filter(Boolean).length;

        return res.status(200).json({
          success: successCount > 0,
          message: `Sent to ${successCount} of ${to.length} recipients`,
        });
      }

      case 'GET': {
        // Get subscribers count (admin only)
        if (!expectedAdminKey || adminKey !== expectedAdminKey) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const subscribers = await getSubscribers();
        return res.status(200).json({
          count: subscribers.length,
          subscribers: subscribers.map(s => ({ email: s.email, subscribed_at: s.subscribed_at })),
        });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Email API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
