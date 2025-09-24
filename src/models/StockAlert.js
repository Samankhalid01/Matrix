import mongoose from 'mongoose';

const StockAlertSchema = new mongoose.Schema({
  alert_id: { type: Number, required: true, unique: true },
  product_id: { type: String, required: true },
  alert_type: { 
    type: String, 
    enum: ["out_of_stock", "low_stock", "reorder_required"], 
    required: true 
  },
  current_stock: { type: Number, required: true },
  threshold_value: { type: Number, required: true },
  is_resolved: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  resolved_at: { type: Date }
});

// Create indexes
StockAlertSchema.index({ product_id: 1 });
StockAlertSchema.index({ is_resolved: 1 });
StockAlertSchema.index({ alert_type: 1 });

export default mongoose.models.StockAlert || mongoose.model('StockAlert', StockAlertSchema);