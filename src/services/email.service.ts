import { EMAIL_CONFIG } from '@/config/email.config';

// Supabase configuration for Edge Function calls
const SUPABASE_URL = 'https://ecvqhfbiwqmqgiqfxheu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdnFoZmJpd3FtcWdpcWZ4aGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDEwMTksImV4cCI6MjA2MDg3NzAxOX0.rRF6VbPIRMucv2ePb4QFKA6gvmevrhqO0M_nTiWm5n4';

// Note: SendGrid cannot be used directly from browser due to CORS
// We use Supabase Edge Function (server-side) to send emails

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  fromName?: string;
}

export class EmailService {
  /**
   * Send email using SendGrid via Supabase Edge Function or direct API
   */
  static async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!EMAIL_CONFIG.sendgridApiKey) {
        return { success: false, error: 'SendGrid API key is not configured' };
      }

      // Use Supabase Edge Function (server-side, no CORS issues)
      // Using direct fetch with auth headers (like translation service)
      console.log('📧 Calling Supabase Edge Function to send email...');
      
      // Function name is 'quick-service' in Supabase
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/quick-service`;
      
      const response = await fetch(edgeFunctionUrl, {
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
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Edge function HTTP error:', response.status, errorText);
        
        if (response.status === 404) {
          return {
            success: false,
            error: 'Edge Function not deployed. Please deploy send-email function to Supabase.',
          };
        }
        
        return {
          success: false,
          error: `Edge function error: ${response.status} - ${errorText}`,
        };
      }

      const data = await response.json();

      if (data?.success) {
        console.log('✅ Email sent via Edge Function:', data.messageId);
        return {
          success: true,
          messageId: data.messageId,
        };
      } else {
        console.error('❌ Email send failed:', data?.error);
        return {
          success: false,
          error: data?.error || 'Failed to send email via Edge Function',
        };
      }
    } catch (error: any) {
      console.error('Email send error:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to send email',
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

