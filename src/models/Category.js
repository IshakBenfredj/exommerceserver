import mongoose from 'mongoose';

const { Schema } = mongoose;

const CategorySchema = new Schema({
  name_ar: { type: String, required: true },
  name_fr: { type: String, default: '' },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: '' },
  image_url: { type: String, default: '' },
  icon: { type: String, default: 'cube' },
  display_order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export const Category = mongoose.model('Category', CategorySchema);
