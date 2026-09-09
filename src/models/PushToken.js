import mongoose from 'mongoose';

const { Schema } = mongoose;

const PushTokenSchema = new Schema({
  token: { type: String, required: true, unique: true, index: true },
  device_name: { type: String, default: 'Merchant Mobile' },
  platform: { type: String, default: 'android' },
  last_used_at: { type: Date, default: Date.now },
}, { timestamps: true });

export const PushToken = mongoose.model('PushToken', PushTokenSchema);
