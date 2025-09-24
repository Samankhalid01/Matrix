import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  notification_id: { type: Number, required: true, unique: true },
  recipient_type: { 
    type: String, 
    enum: ["customer", "admin"], 
    required: true 
  },
  recipient_id: { type: String, required: true },
  notification_type: { 
    type: String, 
    enum: ["stock_alert", "security_alert", "discount", "order_update", "complaint_resolution"], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ["Low", "Medium", "High", "Critical"], 
    default: "Medium" 
  },
  delivery_method: { 
    type: String, 
    enum: ["email", "sms", "push", "in_app"], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["Pending", "Sent", "Delivered", "Failed", "Read"], 
    default: "Pending" 
  },
  sent_at: { type: Date },
  created_at: { type: Date, default: Date.now }
});

// Create indexes
NotificationSchema.index({ recipient_id: 1 });
NotificationSchema.index({ notification_type: 1 });
NotificationSchema.index({ status: 1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);