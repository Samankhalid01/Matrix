import mongoose from 'mongoose';

const SurveillanceNotificationSchema = new mongoose.Schema({
  notification_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  incident_id: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['theft_detected', 'high_risk_activity', 'system_alert'],
    default: 'theft_detected',
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  risk_level: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
    index: true
  },
  confidence: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  read_at: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted timestamp
SurveillanceNotificationSchema.virtual('formatted_timestamp').get(function() {
  return this.timestamp.toISOString();
});

// Virtual for time ago
SurveillanceNotificationSchema.virtual('time_ago').get(function() {
  const now = new Date();
  const diff = now - this.timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Index for common queries
SurveillanceNotificationSchema.index({ read: 1, timestamp: -1 });
SurveillanceNotificationSchema.index({ type: 1, timestamp: -1 });
SurveillanceNotificationSchema.index({ priority: 1, read: 1 });
SurveillanceNotificationSchema.index({ incident_id: 1 });

const SurveillanceNotification = mongoose.models.SurveillanceNotification || 
  mongoose.model('SurveillanceNotification', SurveillanceNotificationSchema);

export default SurveillanceNotification;