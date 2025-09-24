import mongoose from 'mongoose';

const DetectionSchema = new mongoose.Schema({
  frame: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Number,
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  bbox: {
    type: [Number],
    default: []
  }
});

const SurveillanceIncidentSchema = new mongoose.Schema({
  incident_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  video_file: {
    type: String,
    required: true
  },
  video_path: {
    type: String,
    required: true
  },
  flagged: {
    type: Boolean,
    default: false,
    index: true
  },
  status: {
    type: String,
    enum: ['pending_review', 'cleared', 'confirmed', 'false_alarm'],
    default: 'cleared',
    index: true
  },
  detected_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  duration: {
    type: Number,
    default: 0
  },
  total_frames: {
    type: Number,
    default: 0
  },
  detections: [DetectionSchema],
  detection_count: {
    type: Number,
    default: 0,
    index: true
  },
  risk_level: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
    index: true
  },
  confidence_avg: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  suspicious_frames: {
    type: [Number],
    default: []
  },
  admin_reviewed: {
    type: Boolean,
    default: false,
    index: true
  },
  admin_verdict: {
    type: String,
    enum: ['confirmed_theft', 'false_alarm'],
    default: null
  },
  review_notes: {
    type: String,
    default: ''
  },
  reviewed_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted detection time
SurveillanceIncidentSchema.virtual('formatted_detected_at').get(function() {
  return this.detected_at.toISOString();
});

// Virtual for duration in minutes
SurveillanceIncidentSchema.virtual('duration_minutes').get(function() {
  return Math.round(this.duration / 60 * 100) / 100;
});

// Index for common queries
SurveillanceIncidentSchema.index({ flagged: 1, detected_at: -1 });
SurveillanceIncidentSchema.index({ status: 1, detected_at: -1 });
SurveillanceIncidentSchema.index({ risk_level: 1, flagged: 1 });

const SurveillanceIncident = mongoose.models.SurveillanceIncident || 
  mongoose.model('SurveillanceIncident', SurveillanceIncidentSchema);

export default SurveillanceIncident;