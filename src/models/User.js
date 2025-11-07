import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true,
    trim: true 
  },
  lastName: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8 
  },
  storeName: { 
    type: String, 
    required: true,
    trim: true 
  },
  storeAddress: { 
    type: String, 
    required: true,
    trim: true 
  },
  phoneNumber: { 
    type: String, 
    required: true,
    trim: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLogin: { 
    type: Date 
  },
  role: { 
    type: String, 
    default: 'admin', // Changed default to admin since these are store owners
    enum: ['customer', 'admin'] 
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Create indexes for better query performance  
UserSchema.index({ firstName: 1, lastName: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', { virtuals: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);