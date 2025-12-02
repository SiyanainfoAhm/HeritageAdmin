/**
 * Create Verification Email Templates
 * 
 * This script creates email templates for verification approval and rejection
 * in the heritage_notification_templates table.
 * 
 * Usage:
 *   node scripts/create-verification-templates.js
 * 
 * Or via npm:
 *   npm run create-verification-templates
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ecvqhfbiwqmqgiqfxheu.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is not set in .env file');
  console.error('   Please add SUPABASE_SERVICE_ROLE_KEY to your .env file');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const templates = [
  {
    template_key: 'verification_approved',
    template_name: 'Verification Approved',
    email_subject: 'Verification Approved - {{entityType}}',
    email_body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
    .button { display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verification Approved</h1>
    </div>
    <div class="content">
      <p>Dear {{userName}},</p>
      <p>We are pleased to inform you that your <strong>{{entityType}}</strong> verification has been approved!</p>
      <p>Your verification was approved on <strong>{{verificationDate}}</strong>.</p>
      <p>You can now access all features available for verified {{entityType}} accounts.</p>
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      <p>Thank you for being part of our community!</p>
      <p>Best regards,<br>The Heritage Team</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>`,
    email_body_text: `Dear {{userName}},

We are pleased to inform you that your {{entityType}} verification has been approved!

Your verification was approved on {{verificationDate}}.

You can now access all features available for verified {{entityType}} accounts.

If you have any questions or need assistance, please don't hesitate to contact our support team.

Thank you for being part of our community!

Best regards,
The Heritage Team`,
    is_critical: true,
    is_active: true,
  },
  {
    template_key: 'verification_rejected',
    template_name: 'Verification Rejected',
    email_subject: 'Verification Status Update - {{entityType}}',
    email_body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f44336; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
    .button { display: inline-block; padding: 12px 30px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    .info-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verification Status Update</h1>
    </div>
    <div class="content">
      <p>Dear {{userName}},</p>
      <p>We regret to inform you that your <strong>{{entityType}}</strong> verification request has been reviewed and could not be approved at this time.</p>
      <p>The review was completed on <strong>{{rejectionDate}}</strong>.</p>
      <div class="info-box">
        <p><strong>What's Next?</strong></p>
        <p>Please review your submitted information and ensure all required documents are complete and accurate. You may resubmit your verification request after addressing any issues.</p>
      </div>
      <p>If you have any questions about this decision or need assistance with your application, please contact our support team.</p>
      <p>We appreciate your understanding and look forward to working with you in the future.</p>
      <p>Best regards,<br>The Heritage Team</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>`,
    email_body_text: `Dear {{userName}},

We regret to inform you that your {{entityType}} verification request has been reviewed and could not be approved at this time.

The review was completed on {{rejectionDate}}.

What's Next?
Please review your submitted information and ensure all required documents are complete and accurate. You may resubmit your verification request after addressing any issues.

If you have any questions about this decision or need assistance with your application, please contact our support team.

We appreciate your understanding and look forward to working with you in the future.

Best regards,
The Heritage Team`,
    is_critical: true,
    is_active: true,
  },
];

async function createTemplates() {
  console.log('📧 Creating Verification Email Templates...\n');

  for (const template of templates) {
    try {
      // Check if template already exists
      const { data: existing } = await supabase
        .from('heritage_notification_templates')
        .select('id, template_key, template_name')
        .eq('template_key', template.template_key)
        .maybeSingle();

      if (existing) {
        console.log(`⏭️  Template "${template.template_name}" (${template.template_key}) already exists. Skipping...`);
        continue;
      }

      // Insert template
      const { data, error } = await supabase
        .from('heritage_notification_templates')
        .insert(template)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating template "${template.template_name}":`, error.message);
        continue;
      }

      console.log(`✅ Created template: "${template.template_name}" (${template.template_key})`);
    } catch (error) {
      console.error(`❌ Exception creating template "${template.template_name}":`, error.message);
    }
  }

  console.log('\n📋 Verifying created templates...\n');

  // Verify templates
  const { data: createdTemplates, error: verifyError } = await supabase
    .from('heritage_notification_templates')
    .select('template_key, template_name, is_active, created_at')
    .in('template_key', ['verification_approved', 'verification_rejected'])
    .order('template_key');

  if (verifyError) {
    console.error('❌ Error verifying templates:', verifyError.message);
    return;
  }

  if (createdTemplates && createdTemplates.length > 0) {
    console.log('✅ Successfully created/verified templates:');
    createdTemplates.forEach((t) => {
      console.log(`   - ${t.template_key}: ${t.template_name} (Active: ${t.is_active})`);
    });
  } else {
    console.log('⚠️  No templates found. Please check for errors above.');
  }

  console.log('\n✨ Done!');
}

// Run the script
createTemplates().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

