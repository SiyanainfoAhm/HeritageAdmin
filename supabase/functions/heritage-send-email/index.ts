// Supabase Edge Function to send emails via SendGrid
// Deploy: supabase functions deploy heritage-send-email
// Set secrets: supabase secrets set SENDGRID_API_KEY=your-key

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight - MUST return 204 with proper headers
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Content-Length': '0',
      }
    });
  }

  try {
    const { to, subject, html, text, from, fromName } = await req.json();

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: to, subject, html' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get SendGrid credentials from environment (must be set as Supabase secrets)
    // Use provided from/fromName from request, or fallback to environment variables
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const SENDGRID_FROM_EMAIL = from || Deno.env.get('SENDGRID_FROM_EMAIL') || 'jatin.saksena@siyanainfo.com';
    const SENDGRID_FROM_NAME = fromName || Deno.env.get('SENDGRID_FROM_NAME') || 'Heritage Admin';

    if (!SENDGRID_API_KEY) {
      console.error('❌ SendGrid API key not configured in environment variables');
      return new Response(
        JSON.stringify({ success: false, error: 'SendGrid API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📧 Sending email via SendGrid API...');
    console.log(`   To: ${to}`);
    console.log(`   From: ${SENDGRID_FROM_NAME} <${SENDGRID_FROM_EMAIL}>`);
    console.log(`   Subject: ${subject}`);

    // Send email via SendGrid API directly
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
          },
        ],
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: SENDGRID_FROM_NAME,
        },
        subject: subject,
        content: [
          ...(text ? [{ type: 'text/plain', value: text }] : []),
          { type: 'text/html', value: html },
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
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          status: sendGridResponse.status
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const messageId = sendGridResponse.headers.get('x-message-id') || undefined;

    console.log('✅ Email sent successfully via SendGrid:', messageId || 'No message ID');

    return new Response(
      JSON.stringify({ success: true, messageId }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send email' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});








