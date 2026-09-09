import mongoose from 'mongoose';

const { Schema } = mongoose;

const ReviewSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', index: true },
  product_slug: { type: String, index: true },
  customer_name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  is_verified_purchase: { type: Boolean, default: true },
  is_approved: { type: Boolean, default: true, index: true },
  wilaya_name: { type: String, default: 'الجزائر' },
}, { timestamps: true });

export const Review = mongoose.model('Review', ReviewSchema);
