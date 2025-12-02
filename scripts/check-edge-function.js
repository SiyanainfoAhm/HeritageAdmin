/**
 * Check Edge Function Status
 * 
 * This script checks if the send-email Edge Function is deployed and working
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ecvqhfbiwqmqgiqfxheu.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdnFoZmJpd3FtcWdpcWZ4aGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDEwMTksImV4cCI6MjA2MDg3NzAxOX0.rRF6VbPIRMucv2ePb4QFKA6gvmevrhqO0M_nTiWm5n4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkEdgeFunction() {
  console.log('🔍 Checking Edge Function Status...\n');
  console.log('Checking both function names:');
  console.log('  1. send-email:', `${supabaseUrl}/functions/v1/send-email`);
  console.log('  2. quick-service:', `${supabaseUrl}/functions/v1/quick-service`);
  console.log('');

  // Test 1: Check OPTIONS for quick-service (CORS preflight)
  console.log('1️⃣ Testing OPTIONS request for quick-service (CORS preflight)...');
  try {
    const optionsResponse = await fetch(`${supabaseUrl}/functions/v1/quick-service`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
      },
    });

    console.log(`   Status: ${optionsResponse.status}`);
    if (optionsResponse.status === 204) {
      console.log('   ✅ OPTIONS request successful (CORS configured correctly)');
    } else if (optionsResponse.status === 404) {
      console.log('   ❌ Function not found (404) - Function is NOT deployed!');
      console.log('   📝 Deploy with: supabase functions deploy send-email');
      return;
    } else {
      console.log('   ⚠️  Unexpected status:', optionsResponse.status);
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }

  console.log('');

  // Test 2: Check POST request
  console.log('2️⃣ Testing POST request to quick-service...');
  try {
    const postResponse = await fetch(`${supabaseUrl}/functions/v1/quick-service`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test</p>',
        text: 'Test',
      }),
    });

    console.log(`   Status: ${postResponse.status}`);
    const responseText = await postResponse.text();
    
    if (postResponse.status === 404) {
      console.log('   ❌ Function not found (404)');
      console.log('   Response:', responseText);
      console.log('');
      console.log('   📝 ACTION REQUIRED: Deploy the function!');
      console.log('   Go to: https://supabase.com/dashboard/project/ecvqhfbiwqmqgiqfxheu/functions');
      console.log('   Or run: supabase functions deploy send-email');
    } else if (postResponse.status === 200) {
      console.log('   ✅ Function is deployed and responding!');
      try {
        const data = JSON.parse(responseText);
        console.log('   Response:', data);
      } catch (e) {
        console.log('   Response:', responseText);
      }
    } else {
      console.log('   ⚠️  Status:', postResponse.status);
      console.log('   Response:', responseText);
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }

  console.log('');

  // Test 3: Using Supabase client
  console.log('3️⃣ Testing via Supabase client (quick-service)...');
  try {
    const { data, error } = await supabase.functions.invoke('quick-service', {
      body: {
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      },
    });

    if (error) {
      console.log('   ❌ Error:', error.message);
      if (error.message.includes('404') || error.message.includes('not found')) {
        console.log('   📝 Function is NOT deployed!');
      }
    } else {
      console.log('   ✅ Function invoked successfully!');
      console.log('   Response:', data);
    }
  } catch (error) {
    console.error('   ❌ Exception:', error.message);
  }

  console.log('');
  console.log('📋 Summary:');
  console.log('   - If you see 404 errors, the function is NOT deployed');
  console.log('   - If you see 200/204, the function IS deployed');
  console.log('   - Check Supabase Dashboard → Edge Functions to verify');
}

checkEdgeFunction().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

