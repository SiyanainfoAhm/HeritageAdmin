// Supabase Edge Function to send FCM push notifications
// Deploy: supabase functions deploy heritage-send-fcm
// Set secrets (using existing Firebase env variable names):
//   supabase secrets set FCM_PROJECT_ID=your-project-id
//   supabase secrets set FCM_SERVICE_ACCOUNT_KEY=your-service-account-key-or-server-key
//   supabase secrets set FCM_SERVICE_ACCOUNT_EMAIL=your-service-account-email (optional, for v1 API)

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
    const { token, title, body, imageUrl, data, clickAction } = await req.json();

    if (!token || !title || !body) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: token, title, body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get Firebase credentials from environment (using existing Firebase env variable names)
    const FCM_PROJECT_ID = Deno.env.get('FCM_PROJECT_ID');
    const FCM_SERVICE_ACCOUNT_KEY = Deno.env.get('FCM_SERVICE_ACCOUNT_KEY');
    const FCM_SERVICE_ACCOUNT_EMAIL = Deno.env.get('FCM_SERVICE_ACCOUNT_EMAIL');

    // Fallback to old variable names for backward compatibility
    const PROJECT_ID = FCM_PROJECT_ID || Deno.env.get('FIREBASE_PROJECT_ID');
    const SERVER_KEY = FCM_SERVICE_ACCOUNT_KEY || Deno.env.get('FIREBASE_SERVER_KEY');

    if (!PROJECT_ID || !SERVER_KEY) {
      console.error('❌ Firebase credentials not configured in environment variables');
      console.error('   Expected: FCM_PROJECT_ID (or FIREBASE_PROJECT_ID)');
      console.error('   Expected: FCM_SERVICE_ACCOUNT_KEY (or FIREBASE_SERVER_KEY)');
      return new Response(
        JSON.stringify({ success: false, error: 'Firebase credentials not configured. Please set FCM_PROJECT_ID and FCM_SERVICE_ACCOUNT_KEY' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📱 Sending FCM push notification via Firebase API...');
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log(`   Title: ${title}`);
    console.log(`   Body: ${body}`);

    // Build FCM message payload
    // Using legacy FCM endpoint which accepts server key directly
    // The service account key can be used as a server key for the legacy endpoint
    const fcmUrl = 'https://fcm.googleapis.com/fcm/send';
    
    const message: any = {
      to: token,
      notification: {
        title: title,
        body: body,
      },
    };

    // Add optional fields
    if (imageUrl) {
      message.notification.image = imageUrl;
    }

    if (data && Object.keys(data).length > 0) {
      message.data = data;
    }

    if (clickAction) {
      message.data = message.data || {};
      message.data.click_action = clickAction;
    }

    // Send push notification via FCM REST API (legacy endpoint)
    // The service account key can be used directly as a server key
    const fcmResponse = await fetch(fcmUrl, {
      method: 'POST',
      headers: {
        'Authorization': `key=${SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!fcmResponse.ok) {
      const errorText = await fcmResponse.text();
      let errorMessage = `FCM API error: ${fcmResponse.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMessage = errorJson.error.message || JSON.stringify(errorJson.error);
        } else if (errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch {
        // If parsing fails, use the raw error text
        if (errorText) {
          errorMessage = errorText;
        }
      }

      console.error('❌ FCM API error:', fcmResponse.status, errorMessage);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          status: fcmResponse.status
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const result = await fcmResponse.json();
    // Legacy API returns message_id, v1 API returns name
    const messageId = result.message_id || result.name || undefined;

    console.log('✅ Push notification sent successfully via FCM:', messageId || 'No message ID');

    return new Response(
      JSON.stringify({ success: true, messageId }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('❌ Error sending FCM push notification:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send push notification' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

