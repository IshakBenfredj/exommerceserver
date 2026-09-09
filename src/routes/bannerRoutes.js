import { Router } from 'express';
import { Banner } from '../models/Banner.js';
import { StoreSettings } from '../models/StoreSettings.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/banners - Public endpoint for active banners
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ active: true }).sort({ order: 1, createdAt: -1 }).lean();
    
    // If no standalone banners in collection, fallback to StoreSettings.banners
    if (!banners || banners.length === 0) {
      const settings = await StoreSettings.findOne().lean();
      const settingsBanners = (settings?.banners || []).filter(b => b.active !== false);
      return res.json({ success: true, data: settingsBanners });
    }

    res.json({ success: true, data: banners });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch banners' });
  }
});

// GET /api/banners/all - Admin endpoint for all banners
router.get('/all', requireAdminAuth, async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 }).lean();
    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/banners - Admin create banner
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const { title, subtitle, badge, image_url, link, cta_text, active, order } = req.body;
    if (!image_url) {
      return res.status(400).json({ success: false, error: 'image_url is required' });
    }

    const banner = new Banner({
      title: title || '',
      subtitle: subtitle || '',
      badge: badge || '',
      image_url,
      link: link || '',
      cta_text: cta_text || 'اكتشف المزيد',
      active: active !== undefined ? active : true,
      order: order || 0,
    });

    const saved = await banner.save();

    // Also synchronize into StoreSettings.banners
    await StoreSettings.updateOne({}, {
      $push: {
        banners: {
          id: saved._id.toString(),
          image_url: saved.image_url,
          title: saved.title,
          subtitle: saved.subtitle,
          badge: saved.badge,
          link: saved.link,
          active: saved.active,
        }
      }
    });

    res.status(201).json({ success: true, data: saved, message: 'تمت إضافة البانر بنجاح' });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/banners/:id - Admin update banner
router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const updated = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Banner not found' });
    }

    // Sync in StoreSettings.banners if exists
    const settings = await StoreSettings.findOne();
    if (settings && settings.banners) {
      const idx = settings.banners.findIndex(b => b.id === req.params.id);
      if (idx !== -1) {
        settings.banners[idx] = {
          id: updated._id.toString(),
          image_url: updated.image_url,
          title: updated.title,
          subtitle: updated.subtitle,
          badge: updated.badge,
          link: updated.link,
          active: updated.active,
        };
        await settings.save();
      }
    }

    res.json({ success: true, data: updated, message: 'تم تحديث البانر بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/banners/:id - Admin delete banner
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const deleted = await Banner.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Banner not found' });
    }

    // Remove from StoreSettings.banners
    await StoreSettings.updateOne({}, {
      $pull: { banners: { id: req.params.id } }
    });

    res.json({ success: true, message: 'تم حذف البانر بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
