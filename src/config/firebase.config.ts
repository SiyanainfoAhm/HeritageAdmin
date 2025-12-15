/**
 * Firebase Configuration
 * 
 * Firebase Cloud Messaging (FCM) configuration for push notifications
 * 
 * Environment Variables:
 * - VITE_FIREBASE_PROJECT_ID: Firebase project ID
 * - VITE_FIREBASE_API_KEY: Firebase Web API key (for REST API)
 * - VITE_FIREBASE_SERVER_KEY: Firebase Server Key (for admin operations)
 * 
 * Note: For Supabase Edge Functions, use Deno secrets:
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_SERVER_KEY
 */

export const FIREBASE_CONFIG = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  serverKey: import.meta.env.VITE_FIREBASE_SERVER_KEY || '',
  // FCM REST API endpoints
  // Legacy endpoint (uses server key directly)
  fcmLegacyEndpoint: 'https://fcm.googleapis.com/fcm/send',
  // v1 endpoint (requires OAuth2 token)
  fcmV1Endpoint: (projectId: string) => `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
};

// Supabase configuration for Edge Function fallback
const SUPABASE_URL = 'https://ecvqhfbiwqmqgiqfxheu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdnFoZmJpd3FtcWdpcWZ4aGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDEwMTksImV4cCI6MjA2MDg3NzAxOX0.rRF6VbPIRMucv2ePb4QFKA6gvmevrhqO0M_nTiWm5n4';

export const FCM_EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/heritage-send-fcm`;

