import { Router } from 'express';
import { Product } from '../models/Product.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/products (Public with filters & pagination)
router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      featured,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = '1',
      limit = '20',
      all,
    } = req.query;

    const filter = {};

    if (all !== 'true') {
      filter.is_active = true;
    }

    if (category) {
      filter.category_slug = category;
    }

    if (featured === 'true') {
      filter.is_featured = true;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      const searchRegex = new RegExp(String(search).trim(), 'i');
      filter.$or = [
        { name_ar: { $regex: searchRegex } },
        { name_fr: { $regex: searchRegex } },
        { description_ar: { $regex: searchRegex } },
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate('category_id', 'name_ar slug')
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch products' });
  }
});

// GET /api/products/slug/:slug (Public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category_id', 'name_ar name_fr slug')
      .lean();

    if (!product) {
      return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/products/:id (Public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category_id', 'name_ar name_fr slug')
      .lean();

    if (!product) {
      return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/products (Admin)
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, data: product, message: 'تم إضافة المنتج بنجاح' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/products/:id (Admin)
router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
    }
    res.json({ success: true, data: product, message: 'تم تحديث المنتج بنجاح' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/products/:id (Admin)
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
