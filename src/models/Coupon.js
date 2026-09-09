import mongoose from 'mongoose';

const { Schema } = mongoose;

const CouponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  discount_type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discount_value: { type: Number, required: true },
  min_order_amount: { type: Number, default: 0 },
  max_discount_amount: { type: Number },
  start_date: { type: Date },
  end_date: { type: Date },
  usage_limit: { type: Number },
  times_used: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export const Coupon = mongoose.model('Coupon', CouponSchema);
