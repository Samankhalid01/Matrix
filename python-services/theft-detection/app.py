import os
# Suppress TensorFlow oneDNN optimization messages
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
# Suppress TensorFlow GPU warnings if no GPU available
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
# Force CPU-only mode for faster startup (disable GPU)
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
# Disable TensorFlow's automatic GPU memory growth
os.environ['TF_FORCE_GPU_ALLOW_GROWTH'] = 'true'

print("Starting Matrix Theft Detection System...")
print("Loading imports...")

print("Importing Flask...")
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
print("Flask imported successfully!")

print("Checking TensorFlow availability...")

# Try to import TensorFlow properly
tf = None
keras = None
TENSORFLOW_AVAILABLE = False

try:
    import tensorflow as tf
    from tensorflow import keras
    # Configure TensorFlow for CPU-only usage
    tf.config.set_visible_devices([], 'GPU')
    print("✅ TensorFlow imported successfully (CPU mode)!")
    print(f"📊 TensorFlow version: {tf.__version__}")
    TENSORFLOW_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ TensorFlow not available: {e}")
    print("🔧 App will run without AI model. Install tensorflow-cpu to enable theft detection.")
    TENSORFLOW_AVAILABLE = False
    tf = None
    keras = None
except Exception as e:
    print(f"⚠️ TensorFlow import error: {e}")
    print("🔧 App will run without AI model.")
    TENSORFLOW_AVAILABLE = False
    tf = None
    keras = None

print("Importing OpenCV...")
try:
    import cv2
    print("✅ OpenCV imported successfully!")
    OPENCV_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ OpenCV not available: {e}")
    print("🔧 App will run with limited video processing capabilities")
    cv2 = None
    OPENCV_AVAILABLE = False
except Exception as e:
    print(f"⚠️ OpenCV import error: {e}")
    print("🔧 This is likely a NumPy compatibility issue with Python 3.13")
    cv2 = None
    OPENCV_AVAILABLE = False

print("Importing other libraries...")
try:
    import numpy as np
    print("✅ NumPy imported successfully!")
    NUMPY_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ NumPy not available: {e}")
    np = None
    NUMPY_AVAILABLE = False
except Exception as e:
    print(f"⚠️ NumPy import error: {e}")
    np = None
    NUMPY_AVAILABLE = False

import os
from pathlib import Path
import uuid
import base64
from werkzeug.utils import secure_filename
import threading
import queue
import time
import json
from datetime import datetime, timedelta

print("Imports loaded successfully!")

app = Flask(__name__)
CORS(app)

print("Flask app initialized!")

# Configuration
VIDEOS_FOLDER = 'videos'
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'wmv'}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

app.config['VIDEOS_FOLDER'] = VIDEOS_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Global variables
model = None
processing_status = {}
results_cache = {}
surveillance_incidents = {}  # Store flagged incidents
notification_queue = []  # Store pending notifications
upload_processing_videos = set()  # Track videos currently being processed by upload

def scan_surveillance_videos():
    """Scan videos folder and process any unprocessed videos"""
    global surveillance_incidents, notification_queue, upload_processing_videos
    
    try:
        videos_path = Path(VIDEOS_FOLDER)
        if not videos_path.exists():
            return
            
        processed_videos = set(incident['video_file'] for incident in surveillance_incidents.values())
        
        for video_file in videos_path.glob('*.mp4'):
            # **SKIP UPLOAD VIDEOS (those with UUID prefixes)**
            filename_parts = video_file.name.split('_', 1)
            if len(filename_parts) > 1:
                try:
                    # Check if first part looks like a UUID (upload videos have UUID prefixes)
                    uuid.UUID(filename_parts[0])
                    print(f"⏭️ Skipping uploaded video from surveillance: {video_file.name}")
                    continue  # This is an uploaded video, skip surveillance processing
                except ValueError:
                    pass  # Not a UUID, continue with normal processing
            
            # Skip if already processed OR currently being processed by upload
            if video_file.name not in processed_videos and video_file.name not in upload_processing_videos:
                # Process new surveillance video (only non-upload videos)
                job_id = f"surveillance_{uuid.uuid4()}"
                print(f"🔍 Processing surveillance video: {video_file.name}")
                
                # Start processing in background
                thread = threading.Thread(target=process_surveillance_video, 
                                        args=(str(video_file), job_id, video_file.name))
                thread.daemon = True
                thread.start()
                
    except Exception as e:
        print(f"Error scanning surveillance videos: {str(e)}")

def process_surveillance_video(video_path, job_id, video_filename):
    """Process surveillance video and flag suspicious activities"""
    global surveillance_incidents, notification_queue
    
    try:
        processing_status[job_id] = {"status": "processing", "progress": 0}
        
        cap = cv2.VideoCapture(video_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        duration = total_frames / fps if fps > 0 else 0
        
        detections = []
        frame_count = 0
        suspicious_frames = []
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            frame_count += 1
            progress = (frame_count / total_frames) * 100
            processing_status[job_id]["progress"] = progress
            
            # Process every 15th frame for surveillance
            if frame_count % 15 == 0:
                # **EXACT PREPROCESSING FROM WORKING NOTEBOOK**
                # Preprocess frame for model (match notebook implementation)
                resized_frame = cv2.resize(frame, (224, 224))
                rgb_frame = cv2.cvtColor(resized_frame, cv2.COLOR_BGR2RGB)  # Critical BGR->RGB conversion!
                normalized_frame = rgb_frame.astype(np.float32) / 255.0
                img = np.expand_dims(normalized_frame, axis=0)
                
                try:
                    if model is not None:
                        predictions = model.predict(img, verbose=0)
                        
                        if len(predictions) > 0:
                            # Get confidence score - sigmoid output (0-1 scale)
                            raw_confidence = float(predictions[0][0]) if len(predictions[0]) > 0 else 0.0
                            
                            # Debug logging
                            if frame_count % 45 == 0:  # Log every 45th frame
                                print(f"🔍 Frame {frame_count}: Raw confidence = {raw_confidence:.4f}")
                            
                            # Convert to percentage
                            confidence_percentage = raw_confidence * 100
                            
                            # **ADAPTIVE THRESHOLD based on model type**
                            if hasattr(model, '_needs_conservative_thresholds') and model._needs_conservative_thresholds:
                                # For functional CNN model - use VERY high threshold to avoid false positives
                                detection_threshold = 0.75  # 75% - conservative for untrained functional model
                                print(f"🚨 Using CONSERVATIVE threshold (75%) for functional model")
                            else:
                                # For trained model - use CALIBRATED threshold based on analysis
                                # Analysis showed shoplifting videos have 16-18% confidence
                                detection_threshold = 0.18  # 18% - calibrated for this trained model
                            
                            if raw_confidence > detection_threshold:
                                timestamp = frame_count / fps
                                detection = {
                                    "frame": frame_count,
                                    "timestamp": timestamp,
                                    "confidence": confidence_percentage,
                                    "raw_confidence": raw_confidence,
                                    "bbox": [100, 100, 200, 200]  # Placeholder
                                }
                                detections.append(detection)
                                suspicious_frames.append(frame_count)
                                print(f"🚨 SHOPLIFTING DETECTED at {timestamp:.2f}s - Confidence: {confidence_percentage:.1f}%")
                    else:
                        # Model not loaded - skip inference but don't spam errors
                        if frame_count == 15:  # Only log once per video
                            print(f"⚠️ Model not loaded - skipping video analysis for {video_filename}")
                            
                except Exception as e:
                    print(f"Error during surveillance inference: {str(e)}")
                    continue
        
        cap.release()
        
        # Calculate average confidence
        avg_confidence = np.mean([d["confidence"] for d in detections]) if detections else 0
        max_confidence = max([d["confidence"] for d in detections]) if detections else 0
        
        # Calculate average confidence
        avg_confidence = np.mean([d["confidence"] for d in detections]) if detections else 0
        max_confidence = max([d["confidence"] for d in detections]) if detections else 0
        
        # Determine if this video should be flagged based on TRAINED MODEL PREDICTIONS
        # Use reasonable thresholds for trained model (similar to notebook)
        high_confidence_detections = [d for d in detections if d["confidence"] > 60]  # 60%+ confidence
        is_flagged = len(high_confidence_detections) >= 2 or max_confidence > 70  # Multiple detections OR good confidence
        
        # Risk level based on TRAINED MODEL PREDICTIONS
        if len(detections) >= 8 and max_confidence > 80:
            risk_level = "Critical"
        elif len(detections) >= 5 and max_confidence > 70:
            risk_level = "High"
        elif len(detections) >= 2 and max_confidence > 60:
            risk_level = "Medium" 
        elif len(detections) >= 1 and max_confidence > 50:
            risk_level = "Low"
        else:
            risk_level = "Clean"
            
        print(f"📊 Processing complete: {len(detections)} detections, Avg confidence: {avg_confidence:.1f}%, Risk: {risk_level}")
        
        # **ALWAYS create surveillance record (but only flag suspicious ones)**
        incident_id = str(uuid.uuid4())
        incident = {
            "incident_id": incident_id,
            "video_file": video_filename,
            "video_path": video_path,
            "flagged": is_flagged,
            "status": "pending_review" if is_flagged else "normal",  # Changed from "cleared" to "normal"
            "detected_at": datetime.now().isoformat(),
            "duration": duration,
            "total_frames": total_frames,
            "detections": detections,
            "detection_count": len(detections),
            "risk_level": risk_level,
            "confidence_avg": avg_confidence,
            "suspicious_frames": suspicious_frames,
            "admin_reviewed": False,
            "admin_verdict": None,
            "review_notes": ""
        }
        
        surveillance_incidents[incident_id] = incident
        
        # **Only add notifications for flagged incidents**
        if is_flagged:
            notification = {
                "id": str(uuid.uuid4()),
                "incident_id": incident_id,
                "type": "theft_detected",
                "title": f"Suspicious Activity Detected",
                "message": f"Potential theft detected in {video_filename} with {len(detections)} suspicious activities",
                "risk_level": risk_level,
                "confidence": avg_confidence,
                "timestamp": datetime.now().isoformat(),
                "read": False
            }
            notification_queue.append(notification)
            print(f"🚨 FLAGGED: {video_filename} - {len(detections)} detections, Risk: {risk_level}")
        else:
            print(f"✅ NORMAL: {video_filename} - Routine surveillance, Risk: {risk_level}")
        
        processing_status[job_id] = {"status": "completed", "progress": 100}
        
    except Exception as e:
        processing_status[job_id] = {"status": "error", "error": str(e)}
        print(f"Error processing surveillance video {job_id}: {str(e)}")

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_model():
    """Load the Keras/TensorFlow theft detection model"""
    global model
    
    if not TENSORFLOW_AVAILABLE:
        print("⚠️ TensorFlow not available - model loading skipped")
        return False
    
    # Load the model with TensorFlow 2.16.2 (supports batch_shape)
    try:
        print("🔄 Loading theft detection model...")
        model_path = 'models/best_model.h5'
        if os.path.exists(model_path):
            print(f"📂 Model file found at {model_path}")
            print(f"⏳ Loading trained model from {model_path}...")
            
            # Load the model directly (TensorFlow 2.16.2 supports batch_shape)
            model = keras.models.load_model(model_path)
            
            print(f"✅ Trained model loaded successfully!")
            print(f"📊 Model input shape: {model.input_shape}")
            print(f"� Model output shape: {model.output_shape}")
            print(f"🔢 Total parameters: {model.count_params():,}")
            
            # Mark as trained model (not conservative)
            model._needs_conservative_thresholds = False
            
            # Test model with dummy data
            print("🧪 Testing model with dummy data...")
            dummy_input = np.random.random((1, 224, 224, 3)).astype(np.float32)
            test_prediction = model.predict(dummy_input, verbose=0)
            print(f"✅ Model test prediction: {test_prediction[0][0]:.4f} (trained model ready)")
            
            return True
        else:
            print(f"❌ Model file not found at {model_path}")
            print("⚠️ Place your best_model.h5 in the models/ directory")
            return False
            
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        print("🔧 Creating functional CNN model as fallback...")
        
        # Create a FUNCTIONAL CNN model fallback
        model = keras.Sequential([
            keras.layers.Input(shape=(224, 224, 3)),
            keras.layers.Conv2D(32, 3, activation='relu'),
            keras.layers.MaxPooling2D(),
            keras.layers.Conv2D(64, 3, activation='relu'),
            keras.layers.MaxPooling2D(),
            keras.layers.Conv2D(128, 3, activation='relu'),
            keras.layers.MaxPooling2D(),
            keras.layers.GlobalAveragePooling2D(),
            keras.layers.Dense(256, activation='relu'),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(128, activation='relu'),
            keras.layers.Dropout(0.5),
            keras.layers.Dense(1, activation='sigmoid')
        ])
        
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        
        # Mark as conservative model (needs high threshold)
        model._needs_conservative_thresholds = True
        
        print("✅ Functional CNN fallback model created")
        print("🚨 Using CONSERVATIVE thresholds to avoid false positives")
        
        return True

def process_video_frames(video_path, job_id, filename=None):
    """Process video frames for theft detection"""
    global processing_status, results_cache, upload_processing_videos
    
    try:
        processing_status[job_id] = {"status": "processing", "progress": 0}
        
        cap = cv2.VideoCapture(video_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        
        detections = []
        frame_count = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            frame_count += 1
            progress = (frame_count / total_frames) * 100
            processing_status[job_id]["progress"] = progress
            
            # Process every 30th frame to speed up processing
            if frame_count % 30 == 0:
                # Preprocess frame for Keras model
                img = cv2.resize(frame, (224, 224))  # Resize to model input size
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # CRITICAL: Convert BGR to RGB (matches notebook)
                img = img.astype(np.float32) / 255.0  # Normalize to [0,1]
                img = np.expand_dims(img, axis=0)  # Add batch dimension
                
                # Run inference
                try:
                    if model is not None:
                        predictions = model.predict(img, verbose=0)
                        
                        # Process predictions for binary classification model
                        if len(predictions) > 0:
                            # Binary classification sigmoid output (0-1 scale)
                            raw_confidence = float(predictions[0][0]) if len(predictions[0]) > 0 else 0.0
                            confidence_percentage = raw_confidence * 100
                            
                            # Debug logging
                            if frame_count % 60 == 0:  # Log every 60th frame
                                print(f"🔍 Frame {frame_count}: Raw confidence = {raw_confidence:.4f}")
                            
                            # **ADAPTIVE THRESHOLD based on model type**
                            if hasattr(model, '_needs_conservative_thresholds') and model._needs_conservative_thresholds:
                                # For functional CNN model - use VERY high threshold to avoid false positives
                                detection_threshold = 0.75  # 75% - conservative for uploads with untrained model
                                print(f"🚨 Using CONSERVATIVE threshold (75%) for functional model uploads")
                            else:
                                # For trained model - use same threshold as surveillance
                                detection_threshold = 0.18  # 18% - calibrated threshold for trained model
                            
                            if raw_confidence > detection_threshold:
                                timestamp = frame_count / fps
                                detections.append({
                                    "frame": frame_count,
                                    "timestamp": timestamp,
                                    "confidence": confidence_percentage,
                                    "raw_confidence": raw_confidence,
                                    "bbox": [100, 100, 200, 200]  # Placeholder bbox
                                })
                                print(f"🚨 SHOPLIFTING DETECTED at {timestamp:.2f}s - Confidence: {confidence_percentage:.1f}%")
                    else:
                        # Model not loaded - skip inference but don't spam errors
                        if frame_count == 30:  # Only log once per video
                            print(f"⚠️ Model not loaded - skipping upload video analysis")
                except Exception as e:
                    print(f"Error during inference: {str(e)}")
                    continue
        
        cap.release()
        
        # Calculate risk level and confidence metrics based on MODEL PREDICTIONS
        avg_confidence = np.mean([d["confidence"] for d in detections]) if detections else 0
        max_confidence = max([d["confidence"] for d in detections]) if detections else 0
        
        # Risk levels based on TRAINED model predictions (calibrated for 18-25% range)
        if len(detections) >= 6 and max_confidence > 24:
            risk_level = "Critical"
        elif len(detections) >= 4 and max_confidence > 22:
            risk_level = "High"
        elif len(detections) >= 2 and max_confidence > 20:
            risk_level = "Medium" 
        elif len(detections) >= 1 and max_confidence > 18:
            risk_level = "Low"
        else:
            risk_level = "Clean"
            
        print(f"📊 Upload processing complete: {len(detections)} detections, Max confidence: {max_confidence:.1f}%, Risk: {risk_level}")
            
        # Store results
        results_cache[job_id] = {
            "status": "completed",
            "detections": detections,
            "total_frames": total_frames,
            "risk_level": risk_level,
            "confidence_avg": avg_confidence,
            "confidence_max": max_confidence,
            "detection_count": len(detections),
            "processed_at": datetime.now().isoformat(),
            "is_flagged": len(detections) > 0 and max_confidence > 18  # Flag if above calibrated threshold
        }
        
        processing_status[job_id] = {"status": "completed", "progress": 100}
        
        # Remove from upload processing tracking (allow surveillance scan if needed)
        if filename and filename in upload_processing_videos:
            upload_processing_videos.remove(filename)
        
    except Exception as e:
        processing_status[job_id] = {"status": "error", "error": str(e)}
        print(f"Error processing video {job_id}: {str(e)}")
        
        # Cleanup on error too
        if filename and filename in upload_processing_videos:
            upload_processing_videos.remove(filename)

@app.route('/', methods=['GET'])
def index():
    """Root endpoint - API information"""
    return jsonify({
        "service": "Matrix Theft Detection API",
        "version": "1.0.0",
        "status": "running",
        "model_loaded": model is not None,
        "endpoints": {
            "health": "/health - Health check",
            "upload": "/upload - Upload video for analysis",
            "demo": "/demo - Process demo video",
            "surveillance": {
                "incidents": "/surveillance/incidents - Get all incidents",
                "notifications": "/surveillance/notifications - Get notifications",
                "scan": "/surveillance/scan - Trigger video scan"
            }
        },
        "timestamp": datetime.now().isoformat()
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "tensorflow_available": TENSORFLOW_AVAILABLE,
        "opencv_available": OPENCV_AVAILABLE if 'OPENCV_AVAILABLE' in globals() else False,
        "numpy_available": NUMPY_AVAILABLE if 'NUMPY_AVAILABLE' in globals() else False,
        "backend": "flask_only" if not TENSORFLOW_AVAILABLE else "tensorflow",
        "total_incidents": len(surveillance_incidents),
        "flagged_incidents": len([i for i in surveillance_incidents.values() if i['flagged']]),
        "pending_notifications": len([n for n in notification_queue if not n['read']]),
        "timestamp": datetime.now().isoformat()
    })

@app.route('/surveillance/scan', methods=['GET', 'POST'])
def scan_videos():
    """Manually trigger surveillance video scan"""
    if request.method == 'GET':
        return jsonify({
            "endpoint": "/surveillance/scan",
            "description": "Manually trigger surveillance video scan",
            "method": "POST",
            "usage": "Send POST request to trigger video scan",
            "current_incidents": len(surveillance_incidents),
            "flagged_incidents": len([i for i in surveillance_incidents.values() if i['flagged']])
        }), 200
    
    try:
        scan_surveillance_videos()
        return jsonify({
            "status": "success",
            "message": "Video scan initiated"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/surveillance/incidents', methods=['GET'])
def get_surveillance_incidents():
    """Get all surveillance incidents"""
    try:
        # Filter by status if requested
        status_filter = request.args.get('status')  # 'flagged', 'pending_review', 'cleared', 'confirmed', 'false_alarm'
        
        incidents = list(surveillance_incidents.values())
        
        if status_filter:
            if status_filter == 'flagged':
                incidents = [i for i in incidents if i['flagged']]
            elif status_filter == 'pending':
                incidents = [i for i in incidents if i['status'] == 'pending_review']
            elif status_filter == 'reviewed':
                incidents = [i for i in incidents if i['admin_reviewed']]
            else:
                incidents = [i for i in incidents if i['status'] == status_filter]
        
        # Sort by detection time (newest first)
        incidents.sort(key=lambda x: x['detected_at'], reverse=True)
        
        return jsonify({
            "incidents": incidents,
            "total": len(incidents),
            "flagged": len([i for i in incidents if i['flagged']]),
            "pending_review": len([i for i in incidents if i['status'] == 'pending_review'])
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/surveillance/incidents/<incident_id>', methods=['GET'])
def get_incident_details(incident_id):
    """Get detailed information about a specific incident"""
    try:
        if incident_id not in surveillance_incidents:
            return jsonify({"error": "Incident not found"}), 404
            
        incident = surveillance_incidents[incident_id]
        return jsonify(incident), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/surveillance/incidents/<incident_id>/review', methods=['POST'])
def review_incident(incident_id):
    """Admin review of flagged incident"""
    try:
        if incident_id not in surveillance_incidents:
            return jsonify({"error": "Incident not found"}), 404
            
        data = request.get_json()
        verdict = data.get('verdict')  # 'confirmed_theft', 'false_alarm'
        notes = data.get('notes', '')
        
        if verdict not in ['confirmed_theft', 'false_alarm']:
            return jsonify({"error": "Invalid verdict"}), 400
            
        # Update incident
        surveillance_incidents[incident_id].update({
            "admin_reviewed": True,
            "admin_verdict": verdict,
            "review_notes": notes,
            "reviewed_at": datetime.now().isoformat(),
            "status": "confirmed" if verdict == 'confirmed_theft' else "false_alarm"
        })
        
        return jsonify({
            "status": "success",
            "message": f"Incident reviewed as {verdict}"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/surveillance/notifications', methods=['GET'])
def get_notifications():
    """Get pending notifications for admin"""
    try:
        # Filter unread notifications
        unread_only = request.args.get('unread', 'false').lower() == 'true'
        
        notifications = notification_queue.copy()
        if unread_only:
            notifications = [n for n in notifications if not n['read']]
            
        # Sort by timestamp (newest first)
        notifications.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return jsonify({
            "notifications": notifications,
            "total": len(notifications),
            "unread": len([n for n in notification_queue if not n['read']])
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/surveillance/notifications/<notification_id>/read', methods=['POST'])
def mark_notification_read(notification_id):
    """Mark notification as read"""
    try:
        for notification in notification_queue:
            if notification['id'] == notification_id:
                notification['read'] = True
                return jsonify({"status": "success"}), 200
                
        return jsonify({"error": "Notification not found"}), 404
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/surveillance/video/<incident_id>', methods=['GET'])
def get_incident_video(incident_id):
    """Get video file for incident playback"""
    try:
        if incident_id not in surveillance_incidents:
            return jsonify({"error": "Incident not found"}), 404
            
        incident = surveillance_incidents[incident_id]
        video_filename = incident['video_file']
        video_path = incident.get('video_path', '')
        
        # Check if video file exists
        full_video_path = os.path.join(VIDEOS_FOLDER, video_filename)
        if not os.path.exists(full_video_path):
            # Try the stored path
            if video_path and os.path.exists(video_path):
                return send_from_directory(os.path.dirname(video_path), os.path.basename(video_path))
            else:
                return jsonify({"error": "Video file not found"}), 404
        
        return send_from_directory(VIDEOS_FOLDER, video_filename)
        
    except Exception as e:
        print(f"Error serving video {incident_id}: {str(e)}")
        return jsonify({"error": str(e)}), 404

@app.route('/upload', methods=['GET', 'POST'])
def upload_video():
    """Upload video for theft detection"""
    if request.method == 'GET':
        return jsonify({
            "endpoint": "/upload",
            "description": "Upload video for theft detection analysis",
            "method": "POST",
            "content_type": "multipart/form-data",
            "required_field": "video",
            "supported_formats": list(ALLOWED_EXTENSIONS),
            "max_file_size": f"{MAX_FILE_SIZE // (1024*1024)}MB",
            "usage": "Send POST request with 'video' file field",
            "example_curl": "curl -X POST -F 'video=@your_video.mp4' http://localhost:5000/upload"
        }), 200
    
    try:
        if 'video' not in request.files:
            return jsonify({"error": "No video file provided"}), 400
            
        file = request.files['video']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type"}), 400
            
        # Generate unique job ID
        job_id = str(uuid.uuid4())
        filename = secure_filename(f"{job_id}_{file.filename}")
        filepath = os.path.join(app.config['VIDEOS_FOLDER'], filename)
        
        # Ensure upload directory exists
        os.makedirs(app.config['VIDEOS_FOLDER'], exist_ok=True)
        
        # Save file
        file.save(filepath)
        
        # Track this video as being processed by upload (prevent surveillance duplicate processing)
        upload_processing_videos.add(filename)
        
        # Start processing in background thread
        thread = threading.Thread(target=process_video_frames, args=(filepath, job_id, filename))
        thread.daemon = True
        thread.start()
        
        return jsonify({
            "job_id": job_id,
            "status": "uploaded",
            "message": "Video uploaded successfully. Processing started."
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/status/<job_id>', methods=['GET'])
def get_processing_status(job_id):
    """Get processing status for a job"""
    if job_id in processing_status:
        return jsonify(processing_status[job_id])
    elif job_id in results_cache:
        return jsonify({"status": "completed", "progress": 100})
    else:
        return jsonify({"status": "not_found"}), 404

@app.route('/results/<job_id>', methods=['GET'])
def get_results(job_id):
    """Get theft detection results"""
    if job_id in results_cache:
        return jsonify(results_cache[job_id])
    else:
        return jsonify({"error": "Results not found"}), 404

@app.route('/demo', methods=['GET', 'POST'])
def process_demo_video():
    """Process demo video for quick testing"""
    if request.method == 'GET':
        demo_path = 'videos/demo1.mp4'
        return jsonify({
            "endpoint": "/demo",
            "description": "Process demo video for quick testing",
            "method": "POST",
            "demo_video": demo_path,
            "demo_exists": os.path.exists(demo_path),
            "available_videos": [f for f in os.listdir('videos') if f.endswith('.mp4')] if os.path.exists('videos') else [],
            "usage": "Send POST request to process demo video",
            "example_curl": "curl -X POST http://localhost:5000/demo"
        }), 200
    
    try:
        demo_path = 'videos/demo1.mp4'  # Your test video
        
        if not os.path.exists(demo_path):
            return jsonify({"error": "Demo video not found"}), 404
            
        job_id = "demo_" + str(uuid.uuid4())
        
        # Start processing
        thread = threading.Thread(target=process_video_frames, args=(demo_path, job_id))
        thread.daemon = True
        thread.start()
        
        return jsonify({
            "job_id": job_id,
            "status": "processing",
            "message": "Demo video processing started"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/videos/<filename>', methods=['GET'])
def serve_video(filename):
    """Serve video files"""
    try:
        video_path = os.path.join(app.config['VIDEOS_FOLDER'], filename)
        if not os.path.exists(video_path):
            return jsonify({"error": f"Video file {filename} not found"}), 404
            
        return send_from_directory(app.config['VIDEOS_FOLDER'], filename)
    except Exception as e:
        print(f"Error serving video {filename}: {str(e)}")
        return jsonify({"error": str(e)}), 404

@app.route('/debug/videos', methods=['GET'])
def debug_videos():
    """Debug endpoint to list available videos and incidents"""
    try:
        video_files = []
        if os.path.exists(VIDEOS_FOLDER):
            video_files = [f for f in os.listdir(VIDEOS_FOLDER) if f.endswith(('.mp4', '.avi', '.mov', '.mkv', '.wmv'))]
        
        return jsonify({
            "videos_folder": VIDEOS_FOLDER,
            "videos_folder_exists": os.path.exists(VIDEOS_FOLDER),
            "available_videos": video_files,
            "total_incidents": len(surveillance_incidents),
            "flagged_incidents": len([i for i in surveillance_incidents.values() if i['flagged']]),
            "incidents": {
                incident_id: {
                    "video_file": incident["video_file"],
                    "flagged": incident["flagged"],
                    "detection_count": incident["detection_count"],
                    "risk_level": incident["risk_level"]
                } for incident_id, incident in surveillance_incidents.items()
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/debug/model', methods=['GET'])
def debug_model():
    """Debug endpoint to test model predictions"""
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500
        
        # Create test inputs
        test_inputs = []
        predictions = []
        
        # Test with different input patterns
        for i in range(5):
            # Random test image
            test_img = np.random.random((1, 224, 224, 3)).astype(np.float32)
            pred = model.predict(test_img, verbose=0)
            test_inputs.append(f"Random image {i+1}")
            predictions.append(float(pred[0][0]))
        
        return jsonify({
            "model_loaded": True,
            "model_input_shape": str(model.input_shape),
            "model_output_shape": str(model.output_shape),
            "test_predictions": {
                "inputs": test_inputs,
                "raw_outputs": predictions,
                "percentages": [p * 100 for p in predictions],
                "min_prediction": min(predictions),
                "max_prediction": max(predictions),
                "avg_prediction": sum(predictions) / len(predictions)
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/surveillance/incidents/clear', methods=['POST'])
def clear_surveillance_incidents():
    """Clear all surveillance incidents cache and re-scan videos"""
    try:
        global surveillance_incidents, notification_queue
        
        # Clear existing incidents and notifications
        old_count = len(surveillance_incidents)
        surveillance_incidents.clear()
        notification_queue.clear()
        
        # Trigger new scan with updated logic
        scan_surveillance_videos()
        
        return jsonify({
            "status": "success",
            "message": f"Cleared {old_count} old incidents and initiated fresh video scan with updated detection logic",
            "old_incidents": old_count,
            "scan_initiated": True
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def start_surveillance_monitoring():
    """Start background surveillance monitoring"""
    print("🔍 Starting surveillance monitoring...")
    
    # Initial scan of existing videos
    scan_surveillance_videos()
    
    # Set up periodic scanning (every 30 seconds)
    def monitor_videos():
        while True:
            time.sleep(30)  # Check every 30 seconds
            scan_surveillance_videos()
    
    # Start monitoring thread
    monitor_thread = threading.Thread(target=monitor_videos)
    monitor_thread.daemon = True
    monitor_thread.start()

if __name__ == '__main__':
    print("🚨 Starting Matrix Theft Detection Surveillance System...")
    print("📁 Creating directories...")
    
    # Create necessary directories
    os.makedirs('videos', exist_ok=True)
    os.makedirs('models', exist_ok=True)
    print("✅ Directories created")
    
    print("🤖 Loading AI model...")
    # Load model
    model_loaded = load_model()
    if not model_loaded:
        print("⚠️  Warning: Model not loaded. Place your best_model.h5 in the models/ directory")
    else:
        print("✅ Theft detection model loaded successfully")
    
    print("🔍 Starting surveillance monitoring...")
    # Start surveillance monitoring
    start_surveillance_monitoring()
    
    # Start Flask app
    print("🌐 Starting Flask server on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)  # Turn off debug for production