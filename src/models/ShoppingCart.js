import mongoose from 'mongoose';

const ShoppingCartSchema = new mongoose.Schema({
  cart_id: { type: Number, required: true, unique: true },
  customer_id: { type: String, required: true },
  session_id: { type: String },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const CartItemSchema = new mongoose.Schema({
  cart_item_id: { type: Number, required: true, unique: true },
  cart_id: { type: String, required: true },
  product_id: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unit_price: { type: Number, required: true },
  total_price: { type: Number },
  added_at: { type: Date, default: Date.now }
});

// Create indexes
ShoppingCartSchema.index({ customer_id: 1 });
ShoppingCartSchema.index({ is_active: 1 });
CartItemSchema.index({ cart_id: 1 });
CartItemSchema.index({ product_id: 1 });

export const ShoppingCart = mongoose.models.ShoppingCart || mongoose.model('ShoppingCart', ShoppingCartSchema);
export const CartItem = mongoose.models.CartItem || mongoose.model('CartItem', CartItemSchema);