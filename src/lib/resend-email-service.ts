// Resend email service
// Handles sending emails via Resend API

export interface EmailOptions {
  to: string | string[]
  from?: string
  subject: string
  html?: string
  text?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY as string;
const DEFAULT_FROM = 'Aether <noreply@aether.dev>';

export const resendEmailService = {
  // Send email
  sendEmail: async (options: EmailOptions): Promise<EmailResult> => {
    try {
      if (!RESEND_API_KEY) {
        console.error('Resend API key not configured');
        return {
          success: false,
          error: 'Email service not configured'
        };
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: options.from || DEFAULT_FROM,
          to: Array.isArray(options.to) ? options.to : [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
          reply_to: options.replyTo,
          attachments: options.attachments
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Resend API error:', data);
        return {
          success: false,
          error: data.message || 'Failed to send email'
        };
      }

      return {
        success: true,
        messageId: data.id
      };
    } catch (error) {
      console.error('Email service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      };
    }
  },

  // Send verification email
  sendVerificationEmail: async (email: string, verificationCode: string): Promise<EmailResult> => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your email</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #ffffff;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #6366f1;
            }
            .code {
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 8px;
              text-align: center;
              padding: 20px;
              background: #f3f4f6;
              border-radius: 8px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: #6366f1;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Aether</div>
            </div>
            <h1>Verify your email address</h1>
            <p>Thank you for signing up for Aether. Please use the verification code below to complete your registration:</p>
            <div class="code">${verificationCode}</div>
            <p>This code will expire in 24 hours.</p>
            <p>If you didn't request this verification, you can safely ignore this email.</p>
            <div class="footer">
              <p>&copy; 2024 Aether. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return resendEmailService.sendEmail({
      to: email,
      subject: 'Verify your email address',
      html
    });
  },

  // Send welcome email
  sendWelcomeEmail: async (email: string, name?: string): Promise<EmailResult> => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Aether</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #ffffff;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #6366f1;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: #6366f1;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Aether</div>
            </div>
            <h1>Welcome to Aether${name ? `, ${name}` : ''}!</h1>
            <p>We're excited to have you on board. Aether is your AI-powered development platform for building modern web applications.</p>
            <p>Here's what you can do with Aether:</p>
            <ul>
              <li>Build web applications with AI assistance</li>
              <li>Deploy your projects instantly</li>
              <li>Collaborate with your team in real-time</li>
              <li>Manage your workspaces and projects</li>
            </ul>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <div class="footer">
              <p>&copy; 2024 Aether. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return resendEmailService.sendEmail({
      to: email,
      subject: 'Welcome to Aether!',
      html
    });
  },

  // Send password reset email
  sendPasswordResetEmail: async (email: string, resetLink: string): Promise<EmailResult> => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset your password</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #ffffff;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #6366f1;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: #6366f1;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Aether</div>
            </div>
            <h1>Reset your password</h1>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
            <div class="footer">
              <p>&copy; 2024 Aether. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return resendEmailService.sendEmail({
      to: email,
      subject: 'Reset your password',
      html
    });
  },

  // Send notification email
  sendNotificationEmail: async (email: string, subject: string, message: string): Promise<EmailResult> => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Notification</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #ffffff;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #6366f1;
            }
            .message {
              background: #f3f4f6;
              padding: 20px;
              border-radius: 6px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Aether</div>
            </div>
            <h1>${subject}</h1>
            <div class="message">${message}</div>
            <div class="footer">
              <p>&copy; 2024 Aether. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return resendEmailService.sendEmail({
      to: email,
      subject,
      html
    });
  }
};
