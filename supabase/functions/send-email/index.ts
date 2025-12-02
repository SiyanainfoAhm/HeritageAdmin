// Supabase Edge Function to send emails via SendGrid
// Deploy: supabase functions deploy send-email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { to, subject, html, text } = await req.json();

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
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const SENDGRID_FROM_EMAIL = Deno.env.get('SENDGRID_FROM_EMAIL') || '';
    const SENDGRID_FROM_NAME = Deno.env.get('SENDGRID_FROM_NAME') || 'Heritage Admin';

    if (!SENDGRID_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'SendGrid API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Send email via SendGrid API
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
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
      const errorData = await sendGridResponse.text();
      console.error('SendGrid API error:', errorData);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `SendGrid API error: ${sendGridResponse.status}`,
          details: errorData 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const messageId = sendGridResponse.headers.get('x-message-id');

    return new Response(
      JSON.stringify({ success: true, messageId }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Failed to send email' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
