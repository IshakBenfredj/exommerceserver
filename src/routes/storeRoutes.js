import { Router } from 'express';
import { StoreSettings } from '../models/StoreSettings.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/store/settings (Public)
router.get('/settings', async (req, res) => {
  try {
    let settings = await StoreSettings.findOne().lean();
    if (!settings) {
      const defaultSettings = new StoreSettings();
      const saved = await defaultSettings.save();
      settings = saved.toObject();
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching store settings:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch settings' });
  }
});

// PUT /api/store/settings (Admin Protected)
router.put('/settings', requireAdminAuth, async (req, res) => {
  try {
    const updateData = req.body;

    if (Array.isArray(updateData.banners)) {
      updateData.banners = updateData.banners.map((b, idx) => ({
        id: b.id || `banner-${Date.now()}-${idx}`,
        image_url: b.image_url || b.imageUrl || '',
        imageUrl: b.imageUrl || b.image_url || '',
        title: b.title || '',
        subtitle: b.subtitle || '',
        badge: b.badge || '',
        link: b.link || b.linkUrl || '',
        linkUrl: b.linkUrl || b.link || '',
        active: b.active !== undefined ? b.active : (b.isActive !== undefined ? b.isActive : true),
        isActive: b.isActive !== undefined ? b.isActive : (b.active !== undefined ? b.active : true),
        cta_text: b.cta_text || b.ctaText || '',
        ctaText: b.ctaText || b.cta_text || '',
        order: b.order || idx,
      }));
    }

    let settings = await StoreSettings.findOne();

    if (!settings) {
      settings = new StoreSettings(updateData);
    } else {
      Object.assign(settings, updateData);
    }

    const saved = await settings.save();
    res.json({ success: true, message: 'تم تحديث إعدادات المتجر بنجاح', data: saved });
  } catch (error) {
    console.error('Error updating store settings:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update settings' });
  }
});

export default router;
