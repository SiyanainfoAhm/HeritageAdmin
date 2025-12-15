import { FIREBASE_CONFIG, FCM_EDGE_FUNCTION_URL } from '@/config/firebase.config';

export interface FCMMessage {
  token: string; // FCM device token
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
  clickAction?: string; // URL or deep link
}

export interface FCMOptions {
  token: string;
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
  clickAction?: string;
  /**
   * Force using Edge Function instead of direct API
   * Set to true to bypass CORS issues in web browsers
   */
  useEdgeFunction?: boolean;
}

export interface FCMResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class FCMService {
  /**
   * Detect if running in a browser environment (has CORS restrictions)
   * vs native mobile app (no CORS restrictions)
   */
  private static isBrowserEnvironment(): boolean {
    return typeof window !== 'undefined' && typeof window.fetch !== 'undefined';
  }

  /**
   * Detect if running in a mobile native app (React Native, Flutter, etc.)
   */
  private static isNativeApp(): boolean {
    // React Native detection
    if (typeof navigator !== 'undefined' && (navigator as any).product === 'ReactNative') {
      return true;
    }
    // Flutter/other native app detection
    if (typeof window !== 'undefined' && (window as any).flutter_inappwebview) {
      return true;
    }
    // Check for other native app indicators
    if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
      return true;
    }
    return false;
  }

  /**
   * Send FCM push notification using Firebase REST API (with Edge Function fallback if CORS fails)
   * For mobile native apps: Direct API works (no CORS)
   * For web browsers: Direct API may fail (CORS), falls back to Edge Function
   */
  static async sendPushNotification(options: FCMOptions): Promise<FCMResponse> {
    try {
      if (!options.token || !options.token.trim()) {
        return { success: false, error: 'FCM device token is required' };
      }

      if (!options.title || !options.body) {
        return { success: false, error: 'Title and body are required' };
      }

      // Determine which method to use
      // Prefer direct legacy FCM endpoint when server key is available.
      // Only fall back to Edge Function if no server key or explicitly requested.
      const hasServerKey = !!FIREBASE_CONFIG.serverKey;
      const shouldUseEdgeFunction = options.useEdgeFunction || !hasServerKey;

      console.log('📱 Sending FCM push notification...');
      console.log(`   Token: ${options.token.substring(0, 20)}...`);
      console.log(`   Title: ${options.title}`);
      console.log(`   Body: ${options.body}`);
      console.log(`   Environment: ${isNativeApp ? 'Native App' : isBrowser ? 'Web Browser' : 'Unknown'}`);
      console.log(`   Method: ${shouldUseEdgeFunction ? 'Edge Function' : 'Direct FCM API'}`);

      // If server key is missing, try Edge Function; otherwise, use direct legacy endpoint
      if (shouldUseEdgeFunction) {
        return await this.sendPushNotificationViaEdgeFunction(options);
      }

      // Call FCM REST API directly (legacy endpoint, uses server key)
      return await this.sendPushNotificationDirect(options);
    } catch (error: any) {
      console.error('❌ FCM send error:', error);
      
      // Check for CORS errors (most common when calling FCM from browser)
      const errorMessage = error.message || String(error);
      const isCorsError = 
        errorMessage.includes('CORS') ||
        errorMessage.includes('cross-origin') ||
        errorMessage.includes('Access-Control') ||
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('TypeError');

      if (isCorsError) {
        console.warn('⚠️  CORS Error Detected - Falling back to Supabase Edge Function');
        return await this.sendPushNotificationViaEdgeFunction(options);
      }
      
      return {
        success: false,
        error: errorMessage || 'Failed to send push notification',
      };
    }
  }

  /**
   * Send push notification via direct FCM REST API
   */
  private static async sendPushNotificationDirect(options: FCMOptions): Promise<FCMResponse> {
    try {
      if (!FIREBASE_CONFIG.serverKey) {
        return { success: false, error: 'Firebase Server Key is not configured' };
      }

      // Use legacy FCM endpoint which accepts server key directly
      // This is simpler than v1 API which requires OAuth2 token
      const fcmUrl = 'https://fcm.googleapis.com/fcm/send';
      
      const message: any = {
        to: options.token,
        notification: {
          title: options.title,
          body: options.body,
        },
      };

      if (options.imageUrl) {
        message.notification.image = options.imageUrl;
      }

      if (options.data) {
        message.data = options.data;
      }

      if (options.clickAction) {
        message.data = message.data || {};
        message.data.click_action = options.clickAction;
      }

      const response = await fetch(fcmUrl, {
        method: 'POST',
        headers: {
          'Authorization': `key=${FIREBASE_CONFIG.serverKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `FCM API error: ${response.status}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            errorMessage = errorJson.error.message || JSON.stringify(errorJson.error);
          } else if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch {
          if (errorText) {
            errorMessage = errorText;
          }
        }

        console.error('❌ FCM API error:', response.status, errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }

      const result = await response.json();
      // Legacy API returns message_id, v1 API returns name
      const messageId = result.message_id || result.name || undefined;

      console.log('✅ Push notification sent successfully via FCM:', messageId || 'No message ID');
      return {
        success: true,
        messageId,
      };
    } catch (error: any) {
      console.error('❌ FCM direct send error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send push notification',
      };
    }
  }

  /**
   * Send push notification via Supabase Edge Function (bypasses CORS restrictions)
   */
  private static async sendPushNotificationViaEdgeFunction(
    options: FCMOptions
  ): Promise<FCMResponse> {
    try {
      const edgeFunctionUrl = FCM_EDGE_FUNCTION_URL;
      console.log('📱 Sending push notification via Supabase Edge Function...');
      
      // Get Supabase credentials from config
      const SUPABASE_URL = 'https://ecvqhfbiwqmqgiqfxheu.supabase.co';
      const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdnFoZmJpd3FtcWdpcWZ4aGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDEwMTksImV4cCI6MjA2MDg3NzAxOX0.rRF6VbPIRMucv2ePb4QFKA6gvmevrhqO0M_nTiWm5n4';
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          token: options.token,
          title: options.title,
          body: options.body,
          imageUrl: options.imageUrl,
          data: options.data,
          clickAction: options.clickAction,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.success) {
          console.log('✅ Push notification sent via Edge Function:', data.messageId);
          return {
            success: true,
            messageId: data.messageId,
          };
        }
      }
      
      const errorText = await response.text();
      console.error('❌ Edge Function failed:', errorText);
      return {
        success: false,
        error: `Edge Function error: ${errorText}`,
      };
    } catch (error: any) {
      console.error('❌ Edge Function error:', error);
      return {
        success: false,
        error: `Edge Function failed: ${error.message || error}`,
      };
    }
  }

  /**
   * Send push notification with retry logic
   */
  static async sendPushNotificationWithRetry(
    options: FCMOptions,
    maxRetries: number = 3
  ): Promise<FCMResponse> {
    let lastError: string | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await this.sendPushNotification(options);

      if (result.success) {
        if (attempt > 1) {
          console.log(`✅ Push notification sent successfully on attempt ${attempt}`);
        }
        return result;
      }

      lastError = result.error;
      if (attempt < maxRetries) {
        const delay = attempt * 1000; // Exponential backoff: 1s, 2s, 3s
        console.warn(`⚠️  Push notification send failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return {
      success: false,
      error: lastError || 'Failed to send push notification after retries',
    };
  }
}

