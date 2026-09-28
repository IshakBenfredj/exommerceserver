import { Router } from 'express';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

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

    const [rawProducts, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate('category_id', 'name_ar name_fr slug icon')
        .lean(),
      Product.countDocuments(filter),
    ]);

    // Add compatibility properties for both admin dashboard and client store
    const products = rawProducts.map((p) => ({
      ...p,
      title: p.name_fr || p.name_ar || '',
      title_ar: p.name_ar || p.name_fr || '',
      category: p.category_id || p.category_slug,
      sale_price: p.compare_at_price,
      attributes: {
        colors: p.colors || [],
        sizes: p.sizes || [],
      },
    }));

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

    res.json({
      success: true,
      data: {
        ...product,
        title: product.name_fr || product.name_ar || '',
        title_ar: product.name_ar || product.name_fr || '',
        category: product.category_id || product.category_slug,
        sale_price: product.compare_at_price,
      },
    });
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

    res.json({
      success: true,
      data: {
        ...product,
        title: product.name_fr || product.name_ar || '',
        title_ar: product.name_ar || product.name_fr || '',
        category: product.category_id || product.category_slug,
        sale_price: product.compare_at_price,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/products (Admin)
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const data = { ...req.body };

    // Standardize title/name
    data.name_ar = data.name_ar || data.title_ar || data.title || data.name_fr || '';
    data.name_fr = data.name_fr || data.title || data.name || '';

    if (!data.name_ar) {
      return res.status(400).json({ success: false, error: 'اسم المنتج بالعربية مطلوب' });
    }

    // Standardize description
    if (data.description && !data.description_ar) {
      data.description_ar = data.description;
    }
    if (data.description && !data.description_fr) {
      data.description_fr = data.description;
    }

    // Standardize compare_at_price / sale_price
    if (data.sale_price !== undefined && data.compare_at_price === undefined) {
      data.compare_at_price = data.sale_price;
    }

    // Standardize colors & sizes
    if (data.attributes) {
      if (Array.isArray(data.attributes.colors) && (!data.colors || data.colors.length === 0)) {
        data.colors = data.attributes.colors;
      }
      if (Array.isArray(data.attributes.sizes) && (!data.sizes || data.sizes.length === 0)) {
        data.sizes = data.attributes.sizes;
      }
    }

    // Standardize Category
    const rawCat = data.category_id || data.category;
    if (rawCat && typeof rawCat === 'object' && rawCat._id) {
      data.category_id = rawCat._id;
    } else if (typeof rawCat === 'string' && rawCat.trim() && rawCat.trim() !== '') {
      data.category_id = rawCat.trim();
    } else {
      delete data.category_id;
      delete data.category;
    }

    if (data.category_id) {
      try {
        const cat = await Category.findById(data.category_id).lean();
        if (cat) {
          data.category_slug = cat.slug;
        }
      } catch {
        delete data.category_id;
      }
    }

    // Auto-generate unique slug
    if (!data.slug || !data.slug.trim()) {
      const base = slugify(data.name_fr || data.name_ar) || 'product';
      const uniqueSuffix = Math.random().toString(36).substring(2, 7);
      data.slug = `${base}-${uniqueSuffix}`;
    } else {
      data.slug = slugify(data.slug);
    }

    if (data.price !== undefined) {
      data.price = Number(data.price);
    }

    const product = new Product(data);
    await product.save();
    res.status(201).json({ success: true, data: product, message: 'تم إضافة المنتج بنجاح' });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/products/:id (Admin)
router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const data = { ...req.body };

    // Standardize title/name
    if (data.title_ar || data.title) {
      data.name_ar = data.name_ar || data.title_ar || data.title;
    }
    if (data.title) {
      data.name_fr = data.name_fr || data.title;
    }

    // Standardize description
    if (data.description && !data.description_ar) {
      data.description_ar = data.description;
    }
    if (data.description && !data.description_fr) {
      data.description_fr = data.description;
    }

    // Standardize compare_at_price / sale_price
    if (data.sale_price !== undefined) {
      data.compare_at_price = data.sale_price;
    }

    // Standardize colors & sizes
    if (data.attributes) {
      if (Array.isArray(data.attributes.colors)) {
        data.colors = data.attributes.colors;
      }
      if (Array.isArray(data.attributes.sizes)) {
        data.sizes = data.attributes.sizes;
      }
    }

    // Standardize Category
    const rawCat = data.category_id || data.category;
    if (rawCat && typeof rawCat === 'object' && rawCat._id) {
      data.category_id = rawCat._id;
    } else if (typeof rawCat === 'string' && rawCat.trim()) {
      data.category_id = rawCat.trim();
    } else if (rawCat === '' || rawCat === null) {
      data.category_id = null;
      data.category_slug = '';
    }

    if (data.category_id) {
      try {
        const cat = await Category.findById(data.category_id).lean();
        if (cat) {
          data.category_slug = cat.slug;
        }
      } catch {
        data.category_id = null;
      }
    }

    if (data.price !== undefined) {
      data.price = Number(data.price);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
    }
    res.json({ success: true, data: product, message: 'تم تحديث المنتج بنجاح' });
  } catch (error) {
    console.error('Error updating product:', error);
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
