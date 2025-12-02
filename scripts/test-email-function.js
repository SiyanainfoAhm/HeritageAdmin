/**
 * Test Email Edge Function
 * 
 * This script tests if the send-email Edge Function is deployed and working
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ecvqhfbiwqmqgiqfxheu.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdnFoZmJpd3FtcWdpcWZ4aGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDEwMTksImV4cCI6MjA2MDg3NzAxOX0.rRF6VbPIRMucv2ePb4QFKA6gvmevrhqO0M_nTiWm5n4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEmailFunction() {
  console.log('🧪 Testing quick-service Edge Function...\n');

  try {
    console.log('📧 Calling Edge Function...');
    const { data, error } = await supabase.functions.invoke('quick-service', {
      body: {
        to: 'saxena.jatin1987@gmail.com',
        subject: 'Test Email from Heritage Admin',
        html: '<h1>Test Email</h1><p>This is a test email to verify the Edge Function is working.</p>',
        text: 'Test Email - This is a test email to verify the Edge Function is working.',
      },
    });

    if (error) {
      console.error('❌ Error:', error);
      console.error('\nPossible issues:');
      console.error('  1. Edge Function not deployed');
      console.error('  2. Function name mismatch');
      console.error('  3. CORS configuration issue');
      console.error('\nDeploy with: supabase functions deploy send-email');
      return;
    }

    if (data?.success) {
      console.log('✅ SUCCESS! Email function is working!');
      console.log('   Message ID:', data.messageId);
    } else {
      console.error('❌ Function returned error:', data?.error);
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
    console.error('\nMake sure the Edge Function is deployed!');
  }
}

testEmailFunction();

