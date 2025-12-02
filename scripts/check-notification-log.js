/**
 * Check Notification Log
 * 
 * This script checks the notification log to see if emails were logged
 * and their status.
 * 
 * Usage:
 *   node scripts/check-notification-log.js [email]
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ecvqhfbiwqmqgiqfxheu.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is not set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const emailToCheck = process.argv[2] || 'saxena.jatin1987@gmail.com';

async function checkNotificationLog() {
  console.log(`📧 Checking notification log for: ${emailToCheck}\n`);

  // Check notification logs
  const { data: logs, error } = await supabase
    .from('heritage_notification_log')
    .select('*')
    .eq('recipient', emailToCheck)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error fetching notification logs:', error);
    return;
  }

  if (!logs || logs.length === 0) {
    console.log('⚠️  No notification logs found for this email.');
    console.log('\nPossible reasons:');
    console.log('  1. Email template not found (verification_approved)');
    console.log('  2. User email not found in database');
    console.log('  3. Email sending failed silently');
    return;
  }

  console.log(`✅ Found ${logs.length} notification log(s):\n`);

  logs.forEach((log, index) => {
    console.log(`--- Log ${index + 1} ---`);
    console.log(`ID: ${log.id}`);
    console.log(`User ID: ${log.user_id}`);
    console.log(`Notification Type: ${log.notification_type}`);
    console.log(`Channel: ${log.channel}`);
    console.log(`Recipient: ${log.recipient}`);
    console.log(`Subject: ${log.subject}`);
    console.log(`Status: ${log.status}`);
    console.log(`Skip Reason: ${log.skip_reason || 'N/A'}`);
    console.log(`Provider: ${log.provider || 'N/A'}`);
    console.log(`Created At: ${log.created_at}`);
    console.log(`Sent At: ${log.sent_at || 'Not sent yet'}`);
    console.log('');
  });

  // Check if template exists
  console.log('\n📋 Checking if template exists...\n');
  const { data: template } = await supabase
    .from('heritage_notification_templates')
    .select('template_key, template_name, is_active')
    .eq('template_key', 'verification_approved')
    .maybeSingle();

  if (template) {
    console.log(`✅ Template found: ${template.template_name} (Active: ${template.is_active})`);
  } else {
    console.log('❌ Template "verification_approved" not found!');
    console.log('   Run: npm run create-verification-templates');
  }

  // Check user email
  console.log('\n👤 Checking user email in database...\n');
  const { data: user } = await supabase
    .from('heritage_user')
    .select('user_id, full_name, email')
    .eq('email', emailToCheck)
    .maybeSingle();

  if (user) {
    console.log(`✅ User found: ${user.full_name} (ID: ${user.user_id})`);
    console.log(`   Email: ${user.email}`);
  } else {
    console.log(`❌ User with email "${emailToCheck}" not found in database!`);
  }
}

checkNotificationLog().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

