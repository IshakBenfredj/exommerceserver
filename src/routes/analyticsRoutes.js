import { Router } from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/analytics (Admin)
// Accurately calculates Total Sales (excluding cancelled & returned orders)
router.get('/', requireAdminAuth, async (req, res) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      returnedOrders,
      totalProducts,
      lowStockProducts,
      revenueResult,
      pendingRevenueResult,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.countDocuments({ status: 'returned' }),
      Product.countDocuments({ is_active: true }),
      Product.countDocuments({ is_active: true, stock_quantity: { $lte: 5 } }),
      // Only confirmed, shipped, and delivered orders are counted in Realized Total Sales
      // Cancelled and Returned orders are strictly excluded!
      Order.aggregate([
        { $match: { status: { $in: ['confirmed', 'shipped', 'delivered'] } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total_amount' } } },
      ]),
      // Potential revenue waiting for phone confirmation
      Order.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, pendingRevenue: { $sum: '$total_amount' } } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    const pendingRevenue = pendingRevenueResult.length > 0 ? pendingRevenueResult[0].pendingRevenue : 0;

    // Realized / confirmed orders count
    const validSalesOrdersCount = confirmedOrders + shippedOrders + deliveredOrders;
    const averageOrderValue =
      validSalesOrdersCount > 0 ? Math.round(totalRevenue / validSalesOrdersCount) : 0;

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        returnedOrders,
        totalProducts,
        lowStockCount: lowStockProducts,
        totalRevenue,
        pendingRevenue,
        averageOrderValue,
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
