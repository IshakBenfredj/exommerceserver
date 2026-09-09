import mongoose from 'mongoose';

const { Schema } = mongoose;

const BannerSchema = new Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  badge: { type: String, default: '' },
  image_url: { type: String, required: true },
  link: { type: String, default: '' },
  cta_text: { type: String, default: 'اكتشف المزيد' },
  active: { type: Boolean, default: true, index: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export const Banner = mongoose.model('Banner', BannerSchema);
