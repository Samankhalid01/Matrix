import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  admin_id: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  name: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Create indexes
AdminSchema.index({ email: 1 });
AdminSchema.index({ username: 1 });

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);