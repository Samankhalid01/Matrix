import mongoose from 'mongoose';

const ComplaintSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['product', 'service', 'billing', 'delivery', 'other'],
    default: 'other',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'closed'],
    default: 'pending',
  },
  resolution: {
    type: String,
    default: '',
  },
  resolvedBy: {
    type: String,
    default: '',
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
  attachments: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
ComplaintSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
