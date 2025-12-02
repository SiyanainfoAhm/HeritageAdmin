/**
 * Email Configuration
 * 
 * SendGrid configuration for sending emails
 * 
 * Environment Variables:
 * - VITE_SENDGRID_API_KEY: SendGrid API key
 * - VITE_SENDGRID_FROM_EMAIL: Email address to send from
 * - VITE_SENDGRID_FROM_NAME: Display name for sender
 */

export const EMAIL_CONFIG = {
  sendgridApiKey: import.meta.env.VITE_SENDGRID_API_KEY || '',
  fromEmail: import.meta.env.VITE_SENDGRID_FROM_EMAIL || '',
  fromName: import.meta.env.VITE_SENDGRID_FROM_NAME || 'Heritage Admin',
};

