# Create Verification Email Templates

This guide explains how to create email templates for verification approval and rejection notifications.

## Prerequisites

1. **Supabase Service Role Key**: You need the service role key from your Supabase project.
   - Go to Supabase Dashboard > Settings > API
   - Copy the `service_role` key (NOT the anon key)
   - ⚠️ **Keep this key secret!** Never commit it to version control.

2. **Environment Variables**: Ensure your `.env` file contains:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   VITE_SUPABASE_URL=https://ecvqhfbiwqmqgiqfxheu.supabase.co
   ```

## Option 1: Using Node.js Script (Recommended)

### Run the script:

```bash
npm run create-verification-templates
```

Or directly:

```bash
node scripts/create-verification-templates.js
```

### What it does:

- Checks if templates already exist (won't create duplicates)
- Creates two email templates:
  - `verification_approved` - Sent when verification is approved
  - `verification_rejected` - Sent when verification is rejected
- Verifies the templates were created successfully

### Output:

```
📧 Creating Verification Email Templates...

✅ Created template: "Verification Approved" (verification_approved)
✅ Created template: "Verification Rejected" (verification_rejected)

📋 Verifying created templates...

✅ Successfully created/verified templates:
   - verification_approved: Verification Approved (Active: true)
   - verification_rejected: Verification Rejected (Active: true)

✨ Done!
```

## Option 2: Using SQL Script

### Run in Supabase SQL Editor:

1. Go to Supabase Dashboard > SQL Editor
2. Open `scripts/create-verification-templates.sql`
3. Copy and paste the SQL into the editor
4. Click "Run" or press `Ctrl+Enter`

### What it does:

- Uses `INSERT ... WHERE NOT EXISTS` to avoid duplicates
- Creates the same two templates as the Node.js script
- Shows verification query at the end

## Template Variables

Both templates support the following variables that will be replaced with actual values:

### Verification Approved Template:
- `{{userName}}` - User's full name
- `{{entityType}}` - Type of entity (Local Guide, Hotel, etc.)
- `{{verificationDate}}` - Date when verification was approved

### Verification Rejected Template:
- `{{userName}}` - User's full name
- `{{entityType}}` - Type of entity (Local Guide, Hotel, etc.)
- `{{rejectionDate}}` - Date when verification was rejected

## Template Details

### Verification Approved
- **Template Key**: `verification_approved`
- **Subject**: `Verification Approved - {{entityType}}`
- **Critical**: Yes (always send)
- **Active**: Yes

### Verification Rejected
- **Template Key**: `verification_rejected`
- **Subject**: `Verification Status Update - {{entityType}}`
- **Critical**: Yes (always send)
- **Active**: Yes

## Customization

After creating the templates, you can customize them:

1. Go to Admin Panel > Manage > Notification Templates
2. Find the template you want to edit
3. Click the Edit icon
4. Modify the subject, HTML body, or plain text body
5. Save changes

## Troubleshooting

### Error: SUPABASE_SERVICE_ROLE_KEY is not set
- Make sure your `.env` file contains the service role key
- Restart your terminal/IDE after adding the key

### Templates already exist
- The script will skip creating duplicates
- You can edit existing templates through the admin panel

### SQL script fails
- Make sure you're using the Supabase SQL Editor
- Check that the `heritage_notification_templates` table exists
- Verify you have the necessary permissions

## Verification

After running the script, verify templates exist:

```sql
SELECT template_key, template_name, is_active 
FROM heritage_notification_templates 
WHERE template_key IN ('verification_approved', 'verification_rejected');
```

You should see both templates with `is_active = true`.

