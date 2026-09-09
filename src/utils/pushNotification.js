import { Expo } from 'expo-server-sdk';
import { PushToken } from '../models/PushToken.js';

const expo = new Expo();

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

    const validTokens = [];
    const invalidIds = [];

    for (const doc of tokensDoc) {
      if (Expo.isExpoPushToken(doc.token)) {
        validTokens.push(doc.token);
      } else {
        console.warn(`⚠️ [Push Notifications] Invalid Expo push token: ${doc.token}`);
        invalidIds.push(doc._id.toString());
      }
    }

    // Clean up invalid tokens
    if (invalidIds.length > 0) {
      await PushToken.deleteMany({ _id: { $in: invalidIds } });
    }

    if (validTokens.length === 0) {
      return { sentCount: 0, errors: [] };
    }

    const messages = validTokens.map((pushToken) => ({
      to: pushToken,
      sound: 'default',
      title: `🛍️ طلبية جديدة #${order.order_number}`,
      body: `طلب جديد من ${order.customer_name} (${order.wilaya_name}) بمبلغ ${Number(order.total_amount).toLocaleString('ar-DZ')} دج`,
      data: {
        type: 'new_order',
        orderId: order._id?.toString(),
        orderNumber: order.order_number,
        customerName: order.customer_name,
        totalAmount: order.total_amount,
        wilaya: order.wilaya_name,
      },
      priority: 'high',
      channelId: 'orders',
    }));

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    const errors = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('❌ [Push Notifications] Error sending push chunk:', error);
        errors.push(error);
      }
    }

    console.log(`📱 [Push Notifications] Successfully sent ${validTokens.length} background push notifications for order #${order.order_number}`);
    return { sentCount: validTokens.length, errors };
  } catch (err) {
    console.error('❌ [Push Notifications] Unexpected error in sendOrderNotificationToMerchant:', err);
    return { sentCount: 0, errors: [err] };
  }
}
