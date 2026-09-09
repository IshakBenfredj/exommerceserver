import mongoose from 'mongoose';

const { Schema } = mongoose;

const PackSchema = new Schema({
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  label: { type: String, default: '' },
  is_popular: { type: Boolean, default: false },
}, { _id: false });

const ProductSchema = new Schema({
  name_ar: { type: String, required: true, index: true },
  name_fr: { type: String, default: '' },
  slug: { type: String, required: true, unique: true, index: true },
  description_ar: { type: String, default: '' },
  description_fr: { type: String, default: '' },
  price: { type: Number, required: true, index: true },
  compare_at_price: { type: Number },
  cost_price: { type: Number },
  sku: { type: String, default: '' },
  stock_quantity: { type: Number, default: 100 },
  category_id: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
  category_slug: { type: String, index: true },
  images: { type: [String], default: [] },
  is_featured: { type: Boolean, default: false, index: true },
  is_active: { type: Boolean, default: true, index: true },
  product_type: { type: String, enum: ['normal', 'pack', 'bundle'], default: 'normal' },
  pricing_packs: [PackSchema],
  rating: { type: Number, default: 5 },
  reviews_count: { type: Number, default: 0 },
  colors: { type: [String], default: [] },
  sizes: { type: [String], default: [] },
  features: { type: [String], default: [] },
}, { timestamps: true });

ProductSchema.index({ name_ar: 'text', description_ar: 'text', name_fr: 'text' });

export const Product = mongoose.model('Product', ProductSchema);
