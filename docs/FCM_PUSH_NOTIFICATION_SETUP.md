# FCM Push Notification Setup Guide

This guide explains how to set up Firebase Cloud Messaging (FCM) push notifications for the Heritage Admin application.

## Overview

The FCM push notification system allows you to send push notifications to mobile devices using Firebase Cloud Messaging. Notifications are logged to the `heritage_notification_log` table with upsert support (updates existing logs or creates new ones).

## Firebase Configuration

### 1. Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key** to download your service account JSON
5. Alternatively, go to **Project Settings** > **Cloud Messaging** to get:
   - **Project ID**: Your Firebase project ID
   - **Server Key**: Legacy server key (if using REST API with legacy endpoint)
   - **Web API Key**: For client-side operations

### 2. Get FCM Server Key (Recommended for REST API)

For the REST API approach used in this implementation, you need:

1. Go to Firebase Console > **Project Settings** > **Cloud Messaging**
2. Under **Cloud Messaging API (Legacy)**, note the **Server Key**
3. Or use **Service Account** credentials with OAuth2 token

**Note**: The implementation uses Firebase REST API v1, which requires:
- **Project ID**: Your Firebase project ID
- **Server Key** or **Service Account Token**: For authentication

## Setup Options

### Option 1: Supabase Edge Function (Recommended)

This is the recommended approach as it avoids CORS issues and keeps credentials secure.

1. **Deploy the Edge Function**:
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Deploy the FCM function
   npm run deploy-fcm-function
   # Or directly:
   supabase functions deploy heritage-send-fcm
   ```

2. **Set Environment Variables in Supabase**:
   - Go to Supabase Dashboard > **Edge Functions** > **Settings**
   - Add secrets (using your existing Firebase env variable names):
     - `FCM_PROJECT_ID`: Your Firebase project ID
     - `FCM_SERVICE_ACCOUNT_KEY`: Your Firebase service account key (or server key)
     - `FCM_SERVICE_ACCOUNT_EMAIL`: Your Firebase service account email (optional)
   
   **Note**: The function also supports the old variable names (`FIREBASE_PROJECT_ID`, `FIREBASE_SERVER_KEY`) for backward compatibility.

3. **Test the Function**:
   ```bash
   supabase functions invoke heritage-send-fcm --body '{
     "token": "device-fcm-token-here",
     "title": "Test Notification",
     "body": "This is a test push notification"
   }'
   ```

### Option 2: Environment Variables (For Local Development)

Create a `.env` file in the project root:

```env
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_API_KEY=your-firebase-web-api-key
VITE_FIREBASE_SERVER_KEY=your-firebase-server-key
```

**Note**: For Supabase Edge Functions, use the existing Firebase environment variable names:
- `FCM_PROJECT_ID`
- `FCM_SERVICE_ACCOUNT_KEY`
- `FCM_SERVICE_ACCOUNT_EMAIL` (optional)

**Note**: Server keys should never be exposed in client-side code. Use Edge Function for production.

### Option 3: Direct API Call (Limited Use)

The implementation supports direct API calls, but this may fail due to CORS restrictions in browsers. It works better for:
- Server-side applications
- Native mobile apps
- Testing environments

## How It Works

### 1. Sending Push Notifications

```typescript
import { NotificationTemplateService } from '@/services/notificationTemplate.service';

// Send push notification using a template
const result = await NotificationTemplateService.sendPushNotification(
  userId,           // User ID
  'verification_approved', // Template key
  deviceToken,      // FCM device token
  {                 // Template variables
    userName: 'John Doe',
    entityType: 'Hotel',
  }
);

if (result.success) {
  console.log('Push notification sent successfully');
} else {
  console.error('Failed to send:', result.error);
}
```

### 2. Notification Log Upsert

The system automatically upserts notification logs:
- **Checks** if a log exists for: `user_id` + `notification_type` + `channel` + `recipient`
- **Updates** existing log if found
- **Inserts** new log if not found

This ensures you have accurate tracking of notification delivery status.

### 3. Notification Template Structure

Push notification templates are stored in `heritage_notification_templates` table with these fields:
- `push_title`: Notification title (supports variables like `{{userName}}`)
- `push_body`: Notification body text
- `push_image_url`: Optional image URL
- `push_action_url`: Optional deep link or URL

Example template:
```sql
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active
) VALUES (
  'verification_approved',
  'Verification Approved',
  'Verification Approved',
  'Your {{entityType}} verification has been approved!',
  'heritage://verification/approved',
  true
);
```

## Implementation Details

### Files Created

1. **`src/config/firebase.config.ts`**: Firebase configuration
2. **`src/services/fcm.service.ts`**: FCM service for sending notifications
3. **`supabase/functions/heritage-send-fcm/index.ts`**: Edge Function for FCM
4. **`src/services/notificationTemplate.service.ts`**: Updated with push notification methods

### Key Methods

#### `FCMService.sendPushNotification(options)`
Sends a push notification via FCM REST API.

#### `FCMService.sendPushNotificationWithRetry(options, maxRetries)`
Sends with automatic retry logic (default: 3 retries).

#### `NotificationTemplateService.sendPushNotification(userId, templateKey, deviceToken, variables)`
Sends push notification using a template with variable replacement.

#### `NotificationTemplateService.upsertNotificationLog(logData)`
Direct method to upsert notification logs.

## Testing

### 1. Test Push Notification Sending

```typescript
import { FCMService } from '@/services/fcm.service';

const result = await FCMService.sendPushNotification({
  token: 'your-device-fcm-token',
  title: 'Test Notification',
  body: 'This is a test message',
  imageUrl: 'https://example.com/image.jpg', // Optional
  clickAction: 'heritage://test', // Optional deep link
  data: { // Optional additional data
    customField: 'customValue',
  },
});

console.log('Result:', result);
```

### 2. Check Notification Logs

```sql
-- View all FCM notifications
SELECT * FROM heritage_notification_log 
WHERE channel = 'fcm' 
ORDER BY created_at DESC 
LIMIT 10;

-- Check specific user's notifications
SELECT * FROM heritage_notification_log 
WHERE user_id = 38 AND channel = 'fcm'
ORDER BY created_at DESC;
```

### 3. Verify Templates

```sql
-- Check if push notification templates exist
SELECT template_key, push_title, push_body, is_active 
FROM heritage_notification_templates 
WHERE push_title IS NOT NULL AND push_body IS NOT NULL;
```

## Troubleshooting

### Push Notification Not Sending

1. **Check Browser Console**:
   - Look for FCM sending errors
   - Check if template was found
   - Verify device token is valid

2. **Check Notification Log**:
   ```sql
   SELECT * FROM heritage_notification_log 
   WHERE channel = 'fcm' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

3. **Verify Template Exists**:
   ```sql
   SELECT * FROM heritage_notification_templates 
   WHERE template_key = 'verification_approved' 
   AND push_title IS NOT NULL 
   AND push_body IS NOT NULL 
   AND is_active = true;
   ```

4. **Check Firebase**:
   - Verify project ID is correct
   - Check server key is valid
   - Ensure device token is not expired
   - Check Firebase Console > Cloud Messaging for delivery status

### Common Issues

- **CORS Error**: Use Supabase Edge Function instead of direct API call
- **Template Not Found**: Ensure template has `push_title` and `push_body` configured
- **Invalid Token**: Device token may be expired or invalid
- **Firebase API Error**: Check project ID and server key
- **Edge Function Error**: Verify secrets are set correctly in Supabase

### Error Codes

- **400**: Missing required fields (token, title, body)
- **401**: Invalid Firebase credentials
- **404**: Invalid device token or project ID
- **500**: Server error (check Firebase Console)

## Security Notes

⚠️ **Important**: 
- Never commit Firebase server keys to version control
- Use environment variables for production
- Store secrets in Supabase Edge Function secrets (not in code)
- Server keys should only be used server-side (Edge Functions)
- Device tokens should be stored securely and refreshed periodically

## Integration Example

### Sending Push Notification on Verification Approval

```typescript
// In your verification approval handler
import { NotificationTemplateService } from '@/services/notificationTemplate.service';

async function approveVerification(verificationId: number, userId: number) {
  // ... approval logic ...
  
  // Get user's FCM device token (from your user/devices table)
  const deviceToken = await getUserDeviceToken(userId);
  
  if (deviceToken) {
    // Send push notification
    await NotificationTemplateService.sendPushNotification(
      userId,
      'verification_approved',
      deviceToken,
      {
        userName: user.name,
        entityType: 'Hotel',
      }
    );
  }
  
  // Also send email (existing functionality)
  await NotificationTemplateService.sendEmailNotification(
    userId,
    'verification_approved',
    user.email,
    {
      userName: user.name,
      entityType: 'Hotel',
    }
  );
}
```

## Next Steps

1. ✅ Deploy Supabase Edge Function for production
2. ✅ Set up Firebase credentials in Supabase secrets
3. ✅ Configure push notification templates in database
4. ✅ Implement device token collection from mobile app
5. ✅ Test push notification sending
6. ✅ Monitor Firebase Console for delivery status
7. ✅ Set up notification log monitoring

## Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [FCM REST API Reference](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages)
- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)

