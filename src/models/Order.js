import mongoose from 'mongoose';

const { Schema } = mongoose;

const OrderItemSchema = new Schema({
  product_id: { type: String },
  product_name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  image_url: { type: String, default: '' },
  selected_color: { type: String },
  selected_size: { type: String },
}, { _id: false });

const OrderTimelineSchema = new Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String },
}, { _id: false });

const OrderSchema = new Schema({
  order_number: { type: String, required: true, unique: true, index: true },
  customer_name: { type: String, required: true, index: true },
  customer_phone: { type: String, required: true, index: true },
  customer_phone2: { type: String, default: '' },
  wilaya_id: { type: Number, required: true, index: true },
  wilaya_name: { type: String, required: true },
  commune: { type: String, required: true },
  address: { type: String, default: '' },
  shipping_type: { type: String, enum: ['home', 'desk'], default: 'home' },
  shipping_cost: { type: Number, default: 0 },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  coupon_code: { type: String, default: '' },
  total_amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
    index: true,
  },
  notes: { type: String, default: '' },
  items: [OrderItemSchema],
  tracking_code: { type: String, required: true, unique: true, index: true },
  timeline: [OrderTimelineSchema],
}, { timestamps: true });

export const Order = mongoose.model('Order', OrderSchema);
