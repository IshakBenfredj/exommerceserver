import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { Expo } from 'expo-server-sdk';
import { PushToken } from '../models/PushToken.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const expo = new Expo();

let firebaseMessaging = null;

/**
 * Lazily initialize and return the Firebase Messaging instance
 */
export function getFirebaseMessaging() {
  if (firebaseMessaging) return firebaseMessaging;

  try {
    let app;
    if (getApps().length === 0) {
      let serviceAccount = null;

      // 1. Check environment variable (Best for Render / Heroku / Cloud)
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
          serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } catch (e) {
          console.error('❌ [Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT env JSON:', e.message);
        }
      }

      // 2. Check secret files and local file paths
      if (!serviceAccount) {
        const possibleKeyPaths = [
          process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
          '/etc/secrets/firebase-service-account.json', // Render Secret Files default path
          path.resolve(__dirname, '../../firebase-service-account.json'),
          path.resolve(__dirname, '../../algerian-store-4b7ba-firebase-adminsdk-fbsvc-844179853a.json'),
        ].filter(Boolean);

        const keyPath = possibleKeyPaths.find((p) => fs.existsSync(p));
        if (keyPath) {
          serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        }
      }

      if (serviceAccount) {
        app = initializeApp({
          credential: cert(serviceAccount),
        });
        console.log(`🔥 [Firebase Admin] Initialized successfully with project: ${serviceAccount.project_id}`);
      } else {
        console.warn('⚠️ [Firebase Admin] Service account key not found. Set FIREBASE_SERVICE_ACCOUNT env var or add firebase-service-account.json.');
        return null;
      }
    } else {
      app = getApps()[0];
    }

    firebaseMessaging = getMessaging(app);
    return firebaseMessaging;
  } catch (err) {
    console.error('❌ [Firebase Admin] Initialization error:', err.message);
    return null;
  }
}

// Initial attempt on module load
getFirebaseMessaging();

/**
 * Universal push sender (supports both Firebase FCM and legacy Expo tokens)
 */
export async function sendPushToDevices({ tokens, title, body, data = {} }) {
  if (!tokens || tokens.length === 0) {
    return { sentCount: 0, fcmCount: 0, expoCount: 0, errors: [] };
  }

  const fcmTokens = [];
  const expoTokens = [];

  for (const t of tokens) {
    if (Expo.isExpoPushToken(t)) {
      expoTokens.push(t);
    } else if (typeof t === 'string' && t.trim().length > 20) {
      fcmTokens.push(t.trim());
    }
  }

  let fcmSent = 0;
  let expoSent = 0;
  const errors = [];

  // 1. Send via Firebase FCM
  if (fcmTokens.length > 0) {
    const messaging = getFirebaseMessaging();
    if (messaging) {
      try {
        const message = {
          tokens: fcmTokens,
          notification: {
            title,
            body,
          },
          data: Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, String(v ?? '')])
          ),
          android: {
            priority: 'high',
            notification: {
              channelId: 'app_dashf_orders',
              sound: 'default',
              defaultSound: true,
              defaultVibrateTimings: true,
              priority: 'max',
              visibility: 'public',
              clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
                contentAvailable: true,
              },
            },
          },
        };

        const response = await messaging.sendEachForMulticast(message);
        fcmSent = response.successCount;
        console.log(`🔥 [FCM Push] Successfully sent ${response.successCount}/${fcmTokens.length} push notifications`);

        // Clean up invalid or unregistered tokens from DB
        if (response.failureCount > 0) {
          const badTokens = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              const code = resp.error?.code;
              console.warn(`⚠️ [FCM Failure] Token ...${fcmTokens[idx].slice(-10)} failed: ${code}`);
              if (
                code === 'messaging/registration-token-not-registered' ||
                code === 'messaging/invalid-registration-token'
              ) {
                badTokens.push(fcmTokens[idx]);
              }
            }
          });
          if (badTokens.length > 0) {
            await PushToken.deleteMany({ token: { $in: badTokens } });
            console.log(`🧹 [FCM] Removed ${badTokens.length} expired FCM tokens from database`);
          }
        }
      } catch (fcmErr) {
        console.error('❌ [FCM Push Error] Failed sending multicast:', fcmErr);
        errors.push(fcmErr.message);
      }
    } else {
      console.warn('⚠️ [FCM] Firebase messaging not initialized, skipping FCM push');
      errors.push('Firebase messaging not initialized');
    }
  }

  // 2. Send via Expo (if any older React Native apps still registered)
  if (expoTokens.length > 0) {
    try {
      const messages = expoTokens.map((t) => ({
        to: t,
        sound: 'default',
        title,
        body,
        data,
        priority: 'high',
        channelId: 'orders',
      }));

      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        await expo.sendPushNotificationsAsync(chunk);
      }
      expoSent = expoTokens.length;
    } catch (expoErr) {
      console.error('❌ [Expo Push Error]:', expoErr);
      errors.push(expoErr.message);
    }
  }

  return {
    sentCount: fcmSent + expoSent,
    fcmCount: fcmSent,
    expoCount: expoSent,
    errors,
  };
}

/**
 * Send background push notification to all registered merchant mobile devices
 */
export async function sendOrderNotificationToMerchant(order) {
  try {
    const tokensDoc = await PushToken.find().lean();
    if (!tokensDoc || tokensDoc.length === 0) {
      console.log('ℹ️ [Push Notifications] No merchant devices registered yet.');
      return { sentCount: 0, errors: [] };
    }

    const allTokens = tokensDoc.map((d) => d.token);
    const title = `🛍️ طلبية جديدة #${order.order_number}`;
    const body = `طلب جديد من ${order.customer_name} (${order.wilaya_name || ''}) بمبلغ ${Number(order.total_amount).toLocaleString('ar-DZ')} دج`;

    const data = {
      type: 'new_order',
      orderId: String(order._id || ''),
      orderNumber: String(order.order_number || ''),
      customerName: String(order.customer_name || ''),
      totalAmount: String(order.total_amount || 0),
      wilaya: String(order.wilaya_name || ''),
    };

    const result = await sendPushToDevices({ tokens: allTokens, title, body, data });
    console.log(`📱 [Push Notifications] Sent order #${order.order_number} to ${result.sentCount} devices (FCM: ${result.fcmCount}, Expo: ${result.expoCount})`);
    return result;
  } catch (err) {
    console.error('❌ [Push Notifications] Unexpected error in sendOrderNotificationToMerchant:', err);
    return { sentCount: 0, errors: [err.message] };
  }
}
