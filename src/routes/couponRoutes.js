import { Router } from 'express';
import { Coupon } from '../models/Coupon.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/coupons/validate (Public)
router.post('/validate', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'يرجى إدخال رمز الكوبون' });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode, is_active: true });

    if (!coupon) {
      return res.status(404).json({ success: false, error: 'كوبون الخصم غير صحيح أو غير مفعل' });
    }

    const now = new Date();
    if (coupon.start_date && coupon.start_date > now) {
      return res.status(400).json({ success: false, error: 'هذا الكوبون لم يبدأ بعد' });
    }

    if (coupon.end_date && coupon.end_date < now) {
      return res.status(400).json({ success: false, error: 'هذا الكوبون منتهي الصلاحية' });
    }

    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return res.status(400).json({ success: false, error: 'تم استنفاد الحد الأقصى لاستخدام هذا الكوبون' });
    }

    const orderSubtotal = Number(subtotal) || 0;
    if (coupon.min_order_amount && orderSubtotal < coupon.min_order_amount) {
      return res.status(400).json({
        success: false,
        error: `الحد الأدنى للطلب لاستخدام هذا الكوبون هو ${coupon.min_order_amount} دج`,
      });
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round((orderSubtotal * coupon.discount_value) / 100);
      if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
        discountAmount = coupon.max_discount_amount;
      }
    } else {
      discountAmount = coupon.discount_value;
    }

    res.json({
      success: true,
      message: 'تم تفعيل الكوبون بنجاح',
      data: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discountAmount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/coupons (Admin)
router.get('/', requireAdminAuth, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/coupons (Admin)
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.code) {
      payload.code = String(payload.code).trim().toUpperCase();
    }
    const coupon = new Coupon(payload);
    await coupon.save();
    res.status(201).json({ success: true, data: coupon, message: 'تم إنشاء الكوبون بنجاح' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'رمز الكوبون هذا مستخدم بالفعل، يرجى اختيار رمز آخر' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
});

// PATCH /api/coupons/:id/toggle (Admin)
router.patch('/:id/toggle', requireAdminAuth, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'الكوبون غير موجود' });
    }
    coupon.is_active = typeof req.body.is_active === 'boolean' ? req.body.is_active : !coupon.is_active;
    await coupon.save();
    res.json({
      success: true,
      data: coupon,
      message: coupon.is_active ? 'تم تفعيل الكوبون بنجاح' : 'تم إيقاف تفعيل الكوبون',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/coupons/:id (Admin)
router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.code) {
      payload.code = String(payload.code).trim().toUpperCase();
    }
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'الكوبون غير موجود' });
    }
    res.json({ success: true, data: coupon, message: 'تم تحديث بيانات الكوبون بنجاح' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/coupons/:id (Admin)
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'الكوبون غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف الكوبون بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
