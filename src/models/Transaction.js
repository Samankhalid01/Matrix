import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  transaction_id: { type: String, required: true, unique: true },
  customer_id: { type: String, required: true },
  cart_id: { type: String, required: true },
  subtotal: { type: Number, required: true },
  discount_amount: { type: Number, default: 0.00 },
  tax_amount: { type: Number, default: 0.00 },
  total_amount: { type: Number, required: true },
  payment_method: { 
    type: String, 
    enum: ["Credit Card", "Debit Card", "Digital Wallet", "Cash"], 
    required: true 
  },
  payment_status: { 
    type: String, 
    enum: ["Pending", "Completed", "Failed", "Refunded"], 
    default: "Pending" 
  },
  transaction_date: { type: Date, default: Date.now },
  receipt_generated: { type: Boolean, default: false }
});

// Create indexes
TransactionSchema.index({ customer_id: 1 });
TransactionSchema.index({ transaction_date: -1 });
TransactionSchema.index({ payment_status: 1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);