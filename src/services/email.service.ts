import { EMAIL_CONFIG } from '@/config/email.config';

// Supabase configuration for Edge Function fallback
const SUPABASE_URL = 'https://ecvqhfbiwqmqgiqfxheu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdnFoZmJpd3FtcWdpcWZ4aGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDEwMTksImV4cCI6MjA2MDg3NzAxOX0.rRF6VbPIRMucv2ePb4QFKA6gvmevrhqO0M_nTiWm5n4';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  fromName?: string;
  /**
   * Force using Edge Function instead of direct API
   * Set to true to bypass CORS issues in web browsers
   */
  useEdgeFunction?: boolean;
}

export class EmailService {
  /**
   * Detect if running in a browser environment (has CORS restrictions)
   * vs native mobile app (no CORS restrictions)
   */
  private static isBrowserEnvironment(): boolean {
    // Check if we're in a browser (has window object and fetch with CORS restrictions)
    return typeof window !== 'undefined' && typeof window.fetch !== 'undefined';
  }

  /**
   * Detect if running in a mobile native app (React Native, Flutter, etc.)
   */
  private static isNativeApp(): boolean {
    // React Native detection
    if (typeof navigator !== 'undefined' && (navigator as any).product === 'ReactNative') {
      return true;
    }
    // Flutter/other native app detection
    if (typeof window !== 'undefined' && (window as any).flutter_inappwebview) {
      return true;
    }
    // Check for other native app indicators
    if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
      return true;
    }
    return false;
  }

  /**
   * Send email using SendGrid API directly (with Edge Function fallback if CORS fails)
   * For mobile native apps: Direct API works (no CORS)
   * For web browsers: Direct API may fail (CORS), falls back to Edge Function
   */
  static async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const fromEmail = options.from || EMAIL_CONFIG.fromEmail;
      const fromName = options.fromName || EMAIL_CONFIG.fromName;

      if (!fromEmail) {
        return { success: false, error: 'Sender email is not configured' };
      }

      // Determine which method to use
      const isNativeApp = this.isNativeApp();
      const isBrowser = this.isBrowserEnvironment();
      const shouldUseEdgeFunction = options.useEdgeFunction || (isBrowser && !isNativeApp);

      console.log('📧 Sending email...');
      console.log(`   To: ${options.to}`);
      console.log(`   From: ${fromName} <${fromEmail}>`);
      console.log(`   Subject: ${options.subject}`);
      console.log(`   Environment: ${isNativeApp ? 'Native App' : isBrowser ? 'Web Browser' : 'Unknown'}`);
      console.log(`   Method: ${shouldUseEdgeFunction ? 'Edge Function' : 'Direct SendGrid API'}`);

      // For web browsers, use Edge Function to avoid CORS issues
      // For mobile native apps, use direct API (no CORS restrictions)
      if (shouldUseEdgeFunction) {
        return await this.sendEmailViaEdgeFunction(options, fromEmail, fromName);
      }

      // Direct API call requires API key (only for mobile apps)
      if (!EMAIL_CONFIG.sendgridApiKey) {
        // Fallback to Edge Function if API key not available
        console.warn('⚠️  SendGrid API key not configured, falling back to Edge Function');
        return await this.sendEmailViaEdgeFunction(options, fromEmail, fromName);
      }

      // Call SendGrid API directly (works for native mobile apps, may fail in browsers due to CORS)
      const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        mode: 'cors', // Explicitly set CORS mode
        headers: {
          'Authorization': `Bearer ${EMAIL_CONFIG.sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: options.to }],
            },
          ],
          from: {
            email: fromEmail,
            name: fromName,
          },
          subject: options.subject,
          content: [
            ...(options.text ? [{ type: 'text/plain', value: options.text }] : []),
            { type: 'text/html', value: options.html },
          ],
        }),
      });

      if (!sendGridResponse.ok) {
        const errorText = await sendGridResponse.text();
        let errorMessage = `SendGrid API error: ${sendGridResponse.status}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.errors && Array.isArray(errorJson.errors)) {
            errorMessage = errorJson.errors.map((e: any) => e.message || e.field || JSON.stringify(e)).join('; ');
          } else if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch {
          // If parsing fails, use the raw error text
          if (errorText) {
            errorMessage = errorText;
          }
        }

        console.error('❌ SendGrid API error:', sendGridResponse.status, errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }

      const messageId = sendGridResponse.headers.get('x-message-id') || undefined;

      console.log('✅ Email sent successfully via SendGrid:', messageId || 'No message ID');
      return {
        success: true,
        messageId,
      };
    } catch (error: any) {
      console.error('❌ Email send error:', error);
      
      // Check for CORS errors (most common when calling SendGrid from browser)
      const errorMessage = error.message || String(error);
      const isCorsError = 
        errorMessage.includes('CORS') ||
        errorMessage.includes('cross-origin') ||
        errorMessage.includes('Access-Control') ||
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('TypeError');

      if (isCorsError) {
        console.warn('⚠️  CORS Error Detected - Falling back to Supabase Edge Function');
        
        // Fallback to Supabase Edge Function
        // Get fromEmail and fromName from options/config
        const fromEmail = options.from || EMAIL_CONFIG.fromEmail;
        const fromName = options.fromName || EMAIL_CONFIG.fromName;
        return await this.sendEmailViaEdgeFunction(options, fromEmail, fromName);
      }
      
      return {
        success: false,
        error: errorMessage || 'Failed to send email',
      };
    }
  }

  /**
   * Send email via Supabase Edge Function (bypasses CORS restrictions)
   */
  private static async sendEmailViaEdgeFunction(
    options: EmailOptions,
    fromEmail: string,
    fromName: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/heritage-send-email`;
      console.log('📧 Sending email via Supabase Edge Function...');
      
      const fallbackResponse = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || this.stripHtml(options.html),
          from: fromEmail,
          fromName: fromName,
        }),
      });

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData?.success) {
          console.log('✅ Email sent via Edge Function:', fallbackData.messageId);
          return {
            success: true,
            messageId: fallbackData.messageId,
          };
        }
      }
      
      const fallbackError = await fallbackResponse.text();
      console.error('❌ Edge Function failed:', fallbackError);
      return {
        success: false,
        error: `Edge Function error: ${fallbackError}`,
      };
    } catch (fallbackError: any) {
      console.error('❌ Edge Function error:', fallbackError);
      return {
        success: false,
        error: `Edge Function failed: ${fallbackError.message || fallbackError}`,
      };
    }
  }

  /**
   * Strip HTML tags from text (for plain text fallback)
   */
  private static stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  /**
   * Send email with retry logic
   */
  static async sendEmailWithRetry(
    options: EmailOptions,
    maxRetries: number = 3
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    let lastError: string | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await this.sendEmail(options);

      if (result.success) {
        if (attempt > 1) {
          console.log(`✅ Email sent successfully on attempt ${attempt}`);
        }
        return result;
      }

      lastError = result.error;
      if (attempt < maxRetries) {
        const delay = attempt * 1000; // Exponential backoff: 1s, 2s, 3s
        console.warn(`⚠️  Email send failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return {
      success: false,
      error: lastError || 'Failed to send email after retries',
    };
  }
}

