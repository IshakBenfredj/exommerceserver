import { Router } from 'express';
import { Order } from '../models/Order.js';
import { Coupon } from '../models/Coupon.js';
import { Product } from '../models/Product.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { sendOrderNotificationToMerchant } from '../utils/pushNotification.js';

/**
 * Decrement stock when an order is placed (or reactivated)
 */
async function decrementStock(items) {
  if (!items || !Array.isArray(items)) return;
  for (const item of items) {
    const qty = Number(item.quantity) || 1;
    const prodId = item.product_id || item.id;
    if (prodId) {
      try {
        await Product.findByIdAndUpdate(prodId, {
          $inc: { stock_quantity: -qty },
        });
      } catch (err) {
        try {
          await Product.findOneAndUpdate(
            { $or: [{ slug: prodId }, { name_ar: item.product_name }] },
            { $inc: { stock_quantity: -qty } }
          );
        } catch (subErr) {
          console.warn(`Could not decrement stock for ${item.product_name}:`, subErr.message);
        }
      }
    }
  }
}

/**
 * Restore stock when an order is cancelled, returned, or deleted
 */
async function restoreStock(items) {
  if (!items || !Array.isArray(items)) return;
  for (const item of items) {
    const qty = Number(item.quantity) || 1;
    const prodId = item.product_id || item.id;
    if (prodId) {
      try {
        await Product.findByIdAndUpdate(prodId, {
          $inc: { stock_quantity: qty },
        });
      } catch (err) {
        try {
          await Product.findOneAndUpdate(
            { $or: [{ slug: prodId }, { name_ar: item.product_name }] },
            { $inc: { stock_quantity: qty } }
          );
        } catch (subErr) {
          console.warn(`Could not restore stock for ${item.product_name}:`, subErr.message);
        }
      }
    }
  }
}

export const createOrderRouter = (io) => {
  const router = Router();

  // POST /api/orders (Public - Guest Checkout)
  router.post('/', async (req, res) => {
    try {
      const {
        customer_name,
        customer_phone,
        customer_phone2,
        wilaya_id,
        wilaya_name,
        commune,
        address,
        shipping_type = 'home',
        shipping_cost = 0,
        subtotal,
        discount = 0,
        coupon_code = '',
        total_amount,
        items,
        notes = '',
      } = req.body;

      if (!customer_name || !customer_phone || !wilaya_id || !commune || !items || !items.length) {
        return res.status(400).json({
          success: false,
          error: 'يرجى إكمال جميع الحقول الإجبارية (الاسم، الهاتف، الولاية، البلدية، والمنتجات)',
        });
      }

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const order_number = `DZ-${randomSuffix}`;
      const tracking_code = `TRK-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;

      const orderData = {
        order_number,
        customer_name: String(customer_name).trim(),
        customer_phone: String(customer_phone).trim(),
        customer_phone2: customer_phone2 ? String(customer_phone2).trim() : '',
        wilaya_id: Number(wilaya_id),
        wilaya_name: wilaya_name || `ولاية ${wilaya_id}`,
        commune: String(commune).trim(),
        address: address ? String(address).trim() : '',
        shipping_type: shipping_type === 'desk' ? 'desk' : 'home',
        shipping_cost: Number(shipping_cost) || 0,
        subtotal: Number(subtotal) || Number(total_amount) - Number(shipping_cost),
        discount: Number(discount) || 0,
        coupon_code: coupon_code || '',
        total_amount: Number(total_amount),
        status: 'pending',
        notes: notes || '',
        items: items.map((item) => ({
          product_id: item.product_id || item.id,
          product_name: item.product_name || item.name_ar || item.name || 'منتج',
          price: Number(item.price),
          quantity: Number(item.quantity) || 1,
          image_url: item.image_url || item.image || '',
          selected_color: item.selected_color || item.color,
          selected_size: item.selected_size || item.size,
        })),
        tracking_code,
        timeline: [
          {
            status: 'pending',
            timestamp: new Date(),
            note: 'تم تسجيل الطلبية بنجاح وفي انتظار التأكيد الهاتفي',
          },
        ],
      };

      const order = new Order(orderData);
      await order.save();

      // Decrement inventory stock for ordered products
      try {
        await decrementStock(order.items);
      } catch (stockErr) {
        console.error('Error decrementing stock for new order:', stockErr);
      }

      // Increment coupon usage count if coupon was used
      if (coupon_code) {
        try {
          await Coupon.updateOne(
            { code: String(coupon_code).trim().toUpperCase() },
            { $inc: { times_used: 1 } }
          );
        } catch (couponErr) {
          console.error('Error incrementing coupon times_used:', couponErr);
        }
      }

      console.log(`🎉 [New Order] Created #${order.order_number} for ${order.customer_name} (${order.total_amount} DZD)`);

      // 1. Broadcast via Socket.IO for live in-app dashboard alert
      if (io) {
        io.emit('new_order', {
          order: order.toObject(),
          message: `طلبية جديدة #${order.order_number} من ${order.customer_name}`,
        });
      }

      // 2. Trigger BACKGROUND PUSH NOTIFICATION to merchant's mobile device!
      sendOrderNotificationToMerchant(order).catch((err) => {
        console.error('Error in async background push notification:', err);
      });

      res.status(201).json({
        success: true,
        message: 'تم تسجيل طلبك بنجاح! سنتصل بك قريباً لتأكيد الطلب.',
        data: order,
        tracking_code: order.tracking_code,
        order_number: order.order_number,
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ success: false, error: error.message || 'فشل في تسجيل الطلبية' });
    }
  });

  // GET /api/orders (Admin)
  router.get('/', requireAdminAuth, async (req, res) => {
    try {
      const { status, search, page = '1', limit = '30', wilaya } = req.query;
      const filter = {};

      if (status && status !== 'all') {
        filter.status = status;
      }

      if (wilaya) {
        filter.wilaya_id = Number(wilaya);
      }

      if (search) {
        const searchRegex = new RegExp(String(search).trim(), 'i');
        filter.$or = [
          { order_number: { $regex: searchRegex } },
          { customer_name: { $regex: searchRegex } },
          { customer_phone: { $regex: searchRegex } },
          { tracking_code: { $regex: searchRegex } },
          { commune: { $regex: searchRegex } },
        ];
      }

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));
      const skip = (pageNum - 1) * limitNum;

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Order.countDocuments(filter),
      ]);

      res.json({
        success: true,
        data: orders,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/orders/track/:code (Public Order Tracking)
  router.get('/track/:code', async (req, res) => {
    try {
      const code = String(req.params.code).trim();
      const order = await Order.findOne({
        $or: [
          { tracking_code: code },
          { order_number: code },
          { customer_phone: code },
        ],
      }).lean();

      if (!order) {
        return res.status(404).json({ success: false, error: 'لم يتم العثور على أي طلبية بهذا الرمز أو رقم الهاتف' });
      }

      res.json({ success: true, data: order });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/orders/:id (Admin)
  router.get('/:id', requireAdminAuth, async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).lean();
      if (!order) {
        return res.status(404).json({ success: false, error: 'الطلبية غير موجودة' });
      }
      res.json({ success: true, data: order });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // PATCH /api/orders/:id/status (Admin)
  router.patch('/:id/status', requireAdminAuth, async (req, res) => {
    try {
      const { status, note } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, error: 'يرجى تحديد الحالة الجديدة' });
      }

      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, error: 'الطلبية غير موجودة' });
      }

      const oldStatus = order.status;
      const newStatus = status;

      // ── Inventory Stock Management ──
      // 1. If an active order is cancelled or returned -> Restore products quantity to stock!
      const wasActive = !['cancelled', 'returned'].includes(oldStatus);
      const isCancelledOrReturned = ['cancelled', 'returned'].includes(newStatus);

      if (wasActive && isCancelledOrReturned) {
        try {
          await restoreStock(order.items);
          console.log(`📦 [Stock Restored] Restored items for order #${order.order_number} (${newStatus})`);
        } catch (stockErr) {
          console.error('Error restoring stock on order cancellation/return:', stockErr);
        }
      }
      // 2. If a previously cancelled or returned order is re-activated -> Deduct quantity from stock!
      else if (!wasActive && !isCancelledOrReturned) {
        try {
          await decrementStock(order.items);
          console.log(`📦 [Stock Deducted] Re-deducted items for reactivated order #${order.order_number} (${newStatus})`);
        } catch (stockErr) {
          console.error('Error re-decrementing stock on order reactivation:', stockErr);
        }
      }

      order.status = status;
      order.timeline.push({
        status,
        timestamp: new Date(),
        note: note || `تم تغيير حالة الطلب إلى: ${status}`,
      });

      await order.save();

      // Emit status update socket event
      if (io) {
        io.emit('order_status_updated', {
          orderId: order._id,
          status,
          orderNumber: order.order_number,
        });
      }

      res.json({ success: true, data: order, message: 'تم تحديث حالة الطلبية والمخزون بنجاح' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // DELETE /api/orders/:id (Admin)
  router.delete('/:id', requireAdminAuth, async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, error: 'الطلبية غير موجودة' });
      }

      // If the order was active (not cancelled or returned), restore inventory stock before deleting
      if (!['cancelled', 'returned'].includes(order.status)) {
        try {
          await restoreStock(order.items);
          console.log(`📦 [Stock Restored] Restored items on deletion of order #${order.order_number}`);
        } catch (stockErr) {
          console.error('Error restoring stock on order deletion:', stockErr);
        }
      }

      await Order.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'تم حذف الطلبية وإرجاع المخزون بنجاح' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
};
