import mongoose from 'mongoose';

const CustomerPresenceSchema = new mongoose.Schema({
  presence_id: { type: Number, required: true, unique: true },
  customer_id: { type: String, required: true },
  entry_time: { type: Date, default: Date.now },
  exit_time: { type: Date },
  is_currently_in_store: { type: Boolean, default: true },
  session_data: { type: mongoose.Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now }
});

// Create indexes
CustomerPresenceSchema.index({ customer_id: 1 });
CustomerPresenceSchema.index({ is_currently_in_store: 1 });

export default mongoose.models.CustomerPresence || mongoose.model('CustomerPresence', CustomerPresenceSchema);