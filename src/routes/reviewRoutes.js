import { Router } from 'express';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';

const router = Router();

// GET /api/reviews/product/:slug (Public)
router.get('/product/:slug', async (req, res) => {
  try {
    const reviews = await Review.find({ product_slug: req.params.slug, is_approved: true })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/reviews (Public)
router.post('/', async (req, res) => {
  try {
    const { product_slug, customer_name, rating, comment, wilaya_name } = req.body;
    if (!product_slug || !customer_name || !rating || !comment) {
      return res.status(400).json({ success: false, error: 'يرجى إكمال جميع حقول التقييم' });
    }

    const review = new Review({
      product_slug,
      customer_name,
      rating: Number(rating),
      comment,
      wilaya_name: wilaya_name || 'الجزائر',
      is_approved: true,
      is_verified_purchase: true,
    });

    await review.save();

    // Recalculate product rating
    const reviews = await Review.find({ product_slug, is_approved: true });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await Product.findOneAndUpdate(
      { slug: product_slug },
      {
        rating: Math.round(avgRating * 10) / 10,
        reviews_count: reviews.length,
      }
    );

    res.status(201).json({ success: true, data: review, message: 'شكراً لك! تم إضافة تقييمك بنجاح' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
