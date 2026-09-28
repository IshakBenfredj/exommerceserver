import { Router } from 'express';
import { Category } from '../models/Category.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/categories (Public, active only)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ is_active: true })
      .sort({ display_order: 1, createdAt: 1 })
      .lean();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch categories' });
  }
});

// GET /api/categories/all (Admin, all categories)
router.get('/all', requireAdminAuth, async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ display_order: 1, createdAt: -1 })
      .lean();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0621-\u064A-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// POST /api/categories (Admin)
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const data = { ...req.body };
    data.name_ar = data.name_ar || data.name || data.name_fr || '';
    data.name_fr = data.name_fr || data.name || '';

    if (!data.name_ar) {
      return res.status(400).json({ success: false, error: 'اسم التصنيف بالعربية مطلوب' });
    }

    if (!data.slug || !data.slug.trim()) {
      const base = slugify(data.name_fr || data.name_ar) || 'category';
      const uniqueSuffix = Math.random().toString(36).substring(2, 7);
      data.slug = `${base}-${uniqueSuffix}`;
    } else {
      data.slug = slugify(data.slug);
    }

    const category = new Category(data);
    await category.save();
    res.status(201).json({ success: true, data: category, message: 'تم إنشاء التصنيف بنجاح' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/categories/:id (Admin)
router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) {
      return res.status(404).json({ success: false, error: 'التصنيف غير موجود' });
    }
    res.json({ success: true, data: category, message: 'تم تعديل التصنيف بنجاح' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/categories/:id (Admin)
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'التصنيف غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف التصنيف بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
