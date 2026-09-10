import { Router } from 'express';
import { PushToken } from '../models/PushToken.js';
import { sendPushToDevices } from '../utils/pushNotification.js';

const router = Router();

// Handler for registering tokens (supports both POST / and POST /register)
const registerTokenHandler = async (req, res) => {
  try {
    const { token, device_name, deviceName, platform } = req.body;
    const finalToken = token?.trim();

    if (!finalToken) {
      return res.status(400).json({ success: false, error: 'Push token is required' });
    }

    const pushDoc = await PushToken.findOneAndUpdate(
      { token: finalToken },
      {
        token: finalToken,
        device_name: device_name || deviceName || 'Merchant Mobile Device',
        platform: platform || 'android',
        last_used_at: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`📱 [Push Token] Registered device token: ${finalToken.slice(0, 20)}... (${platform || 'android'})`);
    res.json({ success: true, message: 'Push token registered successfully', data: pushDoc });
  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/admin/push-token & POST /api/push/register
router.post('/', registerTokenHandler);
router.post('/register', registerTokenHandler);

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

// POST /api/admin/push-token/test & POST /api/push/test (Send instant test push notification)
const testNotificationHandler = async (req, res) => {
  try {
    const { token, title, body } = req.body;

    let targetTokens = [];
    if (token) {
      targetTokens = [token.trim()];
    } else {
      const docs = await PushToken.find().lean();
      targetTokens = docs.map((d) => d.token);
    }

    if (targetTokens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'لم يتم العثور على أجهزة مسجلة صالحة لاستقبال الإشعار التجريبي.',
      });
    }

    const testTitle = title || '🔔 تجربة الإشعارات الفورية (FCM)';
    const testBody =
      body ||
      'مرحباً! نظام إشعارات Firebase Cloud Messaging في متجرك يعمل بنجاح وبسرعة فائقة حتى خارج التطبيق.';

    const result = await sendPushToDevices({
      tokens: targetTokens,
      title: testTitle,
      body: testBody,
      data: {
        type: 'test_notification',
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`✅ [Test Push] Sent test notification to ${result.sentCount} devices (FCM: ${result.fcmCount})`);
    res.json({
      success: true,
      message: `تم إرسال الإشعار التجريبي بنجاح إلى ${result.sentCount} جهاز!`,
      result,
    });
  } catch (error) {
    console.error('Error sending test push notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

router.post('/test', testNotificationHandler);

// DELETE /api/admin/push-token (Unregister push token)
router.delete('/', async (req, res) => {
  try {
    const { token } = req.body;
    if (token) {
      await PushToken.deleteOne({ token: token.trim() });
    }
    res.json({ success: true, message: 'Push token removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
