// Supabase Edge Function: heritage-send-fcm (Firebase HTTP v1) — FINAL
// Deploy: supabase functions deploy heritage-send-fcm
//
// Secret (store FULL service-account JSON as single-line string):
//   supabase secrets set FCM_SERVICE_ACCOUNT_JSON="$(cat service-account.json)"
// Windows PowerShell:
//   supabase secrets set FCM_SERVICE_ACCOUNT_JSON="$(Get-Content .\service-account.json -Raw)"
//
// Request JSON:
// {
//   "token": "...",
//   "title": "Test",
//   "body": "Test notification",
//   "imageUrl": "https://...optional",
//   "data": { "screen": "BookingHistory" },
//   "clickAction": "FLUTTER_NOTIFICATION_CLICK"
// }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type SendFcmRequest = {
  token: string;
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, unknown>;
  clickAction?: string;
};

function jsonResponse(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getServiceAccount() {
  const raw = Deno.env.get("FCM_SERVICE_ACCOUNT_JSON");
  if (!raw) throw new Error("Missing secret: FCM_SERVICE_ACCOUNT_JSON");

  let sa: any;
  try {
    sa = JSON.parse(raw);
  } catch {
    throw new Error("FCM_SERVICE_ACCOUNT_JSON is not valid JSON");
  }

  const required = ["project_id", "client_email", "private_key", "token_uri"];
  for (const k of required) {
    if (!sa?.[k]) throw new Error(`FCM_SERVICE_ACCOUNT_JSON missing field: ${k}`);
  }

  return sa;
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  // Standard base64
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);

  // Convert to base64url
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlEncodeJson(obj: unknown): string {
  const json = JSON.stringify(obj);
  return base64UrlEncodeBytes(new TextEncoder().encode(json));
}

function pemToDerBytes(pem: string): Uint8Array {
  const clean = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");

  const binStr = atob(clean);
  const bytes = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
  return bytes;
}

async function importPrivateKeyFromPem(pem: string): Promise<CryptoKey> {
  const der = pemToDerBytes(pem);
  return await crypto.subtle.importKey(
    "pkcs8",
    der, // ✅ BufferSource
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function signJwtRS256(privateKeyPem: string, payload: Record<string, unknown>): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };

  const encodedHeader = base64UrlEncodeJson(header);
  const encodedPayload = base64UrlEncodeJson(payload);
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const key = await importPrivateKeyFromPem(privateKeyPem);

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput),
  );

  const sigBytes = new Uint8Array(signature);
  const encodedSig = base64UrlEncodeBytes(sigBytes);

  return `${signingInput}.${encodedSig}`;
}

async function getAccessToken(sa: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const jwtPayload = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: sa.token_uri, // usually https://oauth2.googleapis.com/token
    iat: now,
    exp: now + 3600,
  };

  const jwt = await signJwtRS256(sa.private_key, jwtPayload);

  const res = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(`OAuth token error: ${res.status} ${text}`);
  }

  const token = json?.access_token;
  if (!token) throw new Error(`OAuth token response missing access_token: ${text}`);
  return token;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Max-Age": "86400",
        "Content-Length": "0",
      },
    });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { success: false, error: "Method not allowed" });
  }

  try {
    const payload = (await req.json()) as SendFcmRequest;

    const token = payload?.token;
    const title = payload?.title;
    const body = payload?.body;

    if (!token || !title || !body) {
      return jsonResponse(400, { success: false, error: "Missing required fields: token, title, body" });
    }

    const sa = getServiceAccount();
    const PROJECT_ID = sa.project_id as string;

    console.log("📱 FCM v1 send start");
    console.log(`   Project: ${PROJECT_ID}`);
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log(`   Title: ${title}`);

    // FCM v1 requires data values to be string:string
    const finalData: Record<string, string> = {};
    if (payload.data) {
      for (const [k, v] of Object.entries(payload.data)) finalData[k] = String(v);
    }
    if (payload.clickAction) finalData["click_action"] = payload.clickAction;

    const fcmBody: any = {
      message: {
        token,
        notification: { title, body },
      },
    };

    if (payload.imageUrl) {
      fcmBody.message.notification.image = payload.imageUrl;
    }
    if (Object.keys(finalData).length > 0) {
      fcmBody.message.data = finalData;
    }

    const accessToken = await getAccessToken(sa);

    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;
    const fcmRes = await fetch(fcmUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fcmBody),
    });

    // Read text first for maximum safety/debug
    const fcmText = await fcmRes.text();
    let fcmJson: any = null;
    try {
      fcmJson = fcmText ? JSON.parse(fcmText) : null;
    } catch {
      fcmJson = null;
    }

    if (!fcmRes.ok) {
      console.error("❌ FCM v1 error:", fcmRes.status, fcmText);
      
      // Extract error details for better error messages
      let errorMessage = `FCM v1 error: ${fcmRes.status}`;
      if (fcmJson?.error) {
        const fcmError = fcmJson.error;
        if (fcmError.details?.[0]?.errorCode === "UNREGISTERED") {
          errorMessage = "FCM token is invalid or expired (UNREGISTERED). The device may have uninstalled the app or the token needs to be refreshed.";
        } else if (fcmError.message) {
          errorMessage = fcmError.message;
        }
      }
      
      return jsonResponse(500, {
        success: false,
        error: errorMessage,
        raw: fcmText,
        status: fcmRes.status,
      });
    }

    // Success response contains { name: "projects/.../messages/..." }
    const messageId = fcmJson?.name ?? null;

    console.log("✅ FCM v1 sent:", messageId ?? "(no message id)");
    return jsonResponse(200, { success: true, messageId, raw: fcmText });
  } catch (err: any) {
    console.error("❌ Function error:", err);
    return jsonResponse(500, { success: false, error: err?.message || "Failed to send push notification" });
  }
});
