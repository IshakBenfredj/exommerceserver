import { Router } from 'express';
import { PushToken } from '../models/PushToken.js';
import { Expo } from 'expo-server-sdk';

const router = Router();

// POST /api/admin/push-token (Register merchant device push token)
router.post('/', async (req, res) => {
  try {
    const { token, device_name, platform } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Push token is required' });
    }

    if (!Expo.isExpoPushToken(token)) {
      console.warn(`⚠️ [Push Token Registration] Invalid token format: ${token}`);
      return res.status(400).json({ success: false, error: 'Invalid Expo push token format' });
    }

    const pushDoc = await PushToken.findOneAndUpdate(
      { token },
      {
        token,
        device_name: device_name || 'Merchant Mobile Device',
        platform: platform || 'android',
        last_used_at: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`📱 [Push Token] Registered device token: ${token.slice(0, 20)}...`);
    res.json({ success: true, message: 'Push token registered successfully', data: pushDoc });
  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/push-token (List registered push devices)
router.get('/', async (req, res) => {
  try {
    const tokens = await PushToken.find().sort({ updatedAt: -1 }).lean();
    res.json({
      success: true,
      count: tokens.length,
      data: tokens.map((t) => ({
        id: t._id,
        device_name: t.device_name,
        platform: t.platform,
        last_used_at: t.last_used_at,
        token_preview: `${t.token.slice(0, 15)}...${t.token.slice(-5)}`,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/push-token/test (Send instant test push notification)
router.post('/test', async (req, res) => {
  try {
    const { token, title, body } = req.body;
    const expo = new Expo();

    let targetTokens = [];
    if (token) {
      targetTokens = [token];
    } else {
      const docs = await PushToken.find().lean();
      targetTokens = docs.map((d) => d.token);
    }

    const validTokens = targetTokens.filter((t) => Expo.isExpoPushToken(t));
    if (validTokens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'لم يتم العثور على أجهزة مسجلة صالحة لاستقبال الإشعار التجريبي.',
      });
    }

    const messages = validTokens.map((pushToken) => ({
      to: pushToken,
      sound: 'default',
      title: title || '🔔 تجربة الإشعارات الفورية',
      body: body || 'مرحباً! نظام الإشعارات في متجرك يعمل بنجاح وبسرعة فائقة.',
      data: {
        type: 'test_notification',
        timestamp: new Date().toISOString(),
      },
      priority: 'high',
      channelId: 'orders',
    }));

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    console.log(`✅ [Test Push] Sent test notification to ${validTokens.length} devices.`);
    res.json({
      success: true,
      message: `تم إرسال الإشعار التجريبي بنجاح إلى ${validTokens.length} جهاز!`,
      tickets,
    });
  } catch (error) {
    console.error('Error sending test push notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/admin/push-token (Unregister push token)
router.delete('/', async (req, res) => {
  try {
    const { token } = req.body;
    if (token) {
      await PushToken.deleteOne({ token });
    }
    res.json({ success: true, message: 'Push token removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
