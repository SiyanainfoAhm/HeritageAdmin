# 🔧 CORS Fix Guide - SendGrid Email Service

## 📋 Problem

SendGrid API **does not support CORS** from web browsers. When calling `https://api.sendgrid.com/v3/mail/send` directly from a browser, you'll get a CORS error:

```
Access to fetch at 'https://api.sendgrid.com/v3/mail/send' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Solution

The email service now **automatically detects the environment** and uses the appropriate method:

### 🌐 **Web Browsers** (Has CORS restrictions)
- **Automatically uses**: Supabase Edge Function (bypasses CORS)
- **Why**: Browsers enforce CORS policy, blocking direct API calls

### 📱 **Mobile Native Apps** (No CORS restrictions)
- **Uses**: Direct SendGrid API
- **Why**: React Native, Flutter, and other native apps don't have CORS restrictions
- **Works for**: React Native, Flutter, Ionic, etc.

## 🔍 How It Works

### Environment Detection

The service automatically detects:

1. **Native App Detection**:
   - React Native: `navigator.product === 'ReactNative'`
   - Flutter: `window.flutter_inappwebview`
   - React Native WebView: `window.ReactNativeWebView`

2. **Browser Detection**:
   - Has `window` object and `window.fetch`
   - Not a native app

### Automatic Method Selection

```typescript
// For web browsers → Uses Edge Function
// For mobile apps → Uses Direct SendGrid API
const shouldUseEdgeFunction = options.useEdgeFunction || (isBrowser && !isNativeApp);
```

## 🚀 Usage

### Default (Automatic)

```typescript
// Automatically chooses the right method
await EmailService.sendEmail({
  to: 'user@example.com',
  subject: 'Test Email',
  html: '<h1>Hello</h1>',
});
```

### Force Edge Function (Web Browsers)

```typescript
// Force using Edge Function (useful for web browsers)
await EmailService.sendEmail({
  to: 'user@example.com',
  subject: 'Test Email',
  html: '<h1>Hello</h1>',
  useEdgeFunction: true, // Force Edge Function
});
```

## 📱 Mobile App Integration

### React Native

```typescript
// In your React Native app
import { EmailService } from './services/email.service';

// Direct API call works (no CORS)
await EmailService.sendEmail({
  to: 'user@example.com',
  subject: 'Test Email',
  html: '<h1>Hello</h1>',
});
```

### Flutter

```dart
// In your Flutter app, use the same API
// Direct API calls work (no CORS restrictions)
```

## 🔄 Fallback Logic

If a direct SendGrid API call fails due to CORS:

1. **Detects CORS error** automatically
2. **Falls back** to Supabase Edge Function
3. **Sends email** successfully

## 🛠️ Configuration

### Edge Function Setup

Make sure your Supabase Edge Function is deployed:

```bash
# Deploy the Edge Function
supabase functions deploy send-email

# Set secrets
supabase secrets set SENDGRID_API_KEY=your-api-key
supabase secrets set SENDGRID_FROM_EMAIL=your-email@example.com
supabase secrets set SENDGRID_FROM_NAME=Your Name
```

### Email Config

Update `src/config/email.config.ts`:

```typescript
export const EMAIL_CONFIG = {
  sendgridApiKey: 'SG.your-api-key-here',
  fromEmail: 'your-email@example.com',
  fromName: 'Your App Name',
};
```

## 🧪 Testing

### Test in Web Browser

```typescript
// Should automatically use Edge Function
const result = await EmailService.sendEmail({
  to: 'test@example.com',
  subject: 'Test',
  html: '<p>Test email</p>',
});

console.log(result); // { success: true, messageId: '...' }
```

### Test in Mobile App

```typescript
// Should use direct SendGrid API
const result = await EmailService.sendEmail({
  to: 'test@example.com',
  subject: 'Test',
  html: '<p>Test email</p>',
});

console.log(result); // { success: true, messageId: '...' }
```

## 📊 Console Logs

The service logs which method is being used:

```
📧 Sending email...
   To: user@example.com
   From: App Name <sender@example.com>
   Subject: Test Email
   Environment: Web Browser  (or "Native App")
   Method: Edge Function  (or "Direct SendGrid API")
```

## ⚠️ Important Notes

1. **API Key Security**: 
   - Direct API calls expose the API key in browser network requests
   - Edge Function keeps the API key server-side (more secure)

2. **Mobile Apps**:
   - Direct API calls work fine (no CORS)
   - API key is still exposed in app code (consider using Edge Function for better security)

3. **Production**:
   - For web apps: Always use Edge Function (set `useEdgeFunction: true` or rely on auto-detection)
   - For mobile apps: Direct API works, but Edge Function is more secure

## 🔐 Security Recommendation

**For Production**: Use Edge Function for both web and mobile apps to keep API keys server-side:

```typescript
// Always use Edge Function (more secure)
await EmailService.sendEmail({
  to: 'user@example.com',
  subject: 'Test Email',
  html: '<h1>Hello</h1>',
  useEdgeFunction: true, // Force Edge Function
});
```

## ✅ Summary

- ✅ **Web Browsers**: Automatically uses Edge Function (no CORS issues)
- ✅ **Mobile Apps**: Uses Direct SendGrid API (no CORS restrictions)
- ✅ **Automatic Fallback**: If direct API fails, falls back to Edge Function
- ✅ **Manual Override**: Can force Edge Function with `useEdgeFunction: true`

The service now works seamlessly in both web browsers and mobile native apps! 🎉

