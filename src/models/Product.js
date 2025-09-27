// filepath: src/models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  product_id: { type: Number, required: true, unique: true },
  product_name: { type: String, required: true },
  description: { type: String },
  category_id: { type: String, required: true },
  qr_code: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
  weight: { type: Number },
images: [{ 
  url: String,
  alt: String,
  isPrimary: { type: Boolean, default: false },
  publicId: String,
  width: Number,
  height: Number,
  format: String,
  bytes: Number
}],
  imageUrl: { type: String }, // Keep for backward compatibility
  in_stock: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

ProductSchema.index({ product_id: 1 });
ProductSchema.index({ category_id: 1 });
ProductSchema.index({ product_name: 'text' });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);