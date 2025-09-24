from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import tensorflow as tf
from tensorflow import keras
import cv2
import numpy as np
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

app = Flask(__name__)
CORS(app)

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

def scan_surveillance_videos():
    """Scan videos folder and process any unprocessed videos"""
    global surveillance_incidents, notification_queue
    
    try:
        videos_path = Path(VIDEOS_FOLDER)
        if not videos_path.exists():
            return
            
        processed_videos = set(incident['video_file'] for incident in surveillance_incidents.values())
        
        for video_file in videos_path.glob('*.mp4'):
            if video_file.name not in processed_videos:
                # Process new video
                job_id = f"surveillance_{uuid.uuid4()}"
                print(f"Processing surveillance video: {video_file.name}")
                
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
            
            # Process every 15th frame for surveillance (more frequent than upload)
            if frame_count % 15 == 0:
                # Preprocess frame for model
                img = cv2.resize(frame, (224, 224))
                img = img.astype(np.float32) / 255.0
                img = np.expand_dims(img, axis=0)
                
                try:
                    predictions = model.predict(img, verbose=0)
                    
                    if len(predictions) > 0:
                        # Get confidence score (adjust based on your model)
                        confidence = float(predictions[0][0]) if len(predictions[0]) > 0 else 0.0
                        
                        # Flag high confidence detections
                        if confidence > 0.6:  # Lower threshold for surveillance
                            timestamp = frame_count / fps
                            detection = {
                                "frame": frame_count,
                                "timestamp": timestamp,
                                "confidence": confidence,
                                "bbox": [100, 100, 200, 200]  # Placeholder
                            }
                            detections.append(detection)
                            suspicious_frames.append(frame_count)
                            
                except Exception as e:
                    print(f"Error during surveillance inference: {str(e)}")
                    continue
        
        cap.release()
        
        # Determine if this video should be flagged
        is_flagged = len(detections) > 3  # Flag if more than 3 suspicious detections
        risk_level = "Low"
        
        if len(detections) > 10:
            risk_level = "High"
        elif len(detections) > 5:
            risk_level = "Medium"
        elif len(detections) > 3:
            risk_level = "Low"
            
        avg_confidence = np.mean([d["confidence"] for d in detections]) if detections else 0
        
        # Create surveillance incident record
        incident_id = str(uuid.uuid4())
        incident = {
            "incident_id": incident_id,
            "video_file": video_filename,
            "video_path": video_path,
            "flagged": is_flagged,
            "status": "pending_review" if is_flagged else "cleared",
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
        
        # Add to notification queue if flagged
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
    try:
        # Load your trained model
        model_path = 'models/best_model.h5'
        if os.path.exists(model_path):
            model = keras.models.load_model(model_path)
            print(f"Model loaded successfully")
            print(f"Model input shape: {model.input_shape}")
            print(f"Model output shape: {model.output_shape}")
            return True
        else:
            print(f"Model file not found at {model_path}")
            return False
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        return False

def process_video_frames(video_path, job_id):
    """Process video frames for theft detection"""
    global processing_status, results_cache
    
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
                img = cv2.resize(frame, (224, 224))  # Common input size for many models
                img = img.astype(np.float32) / 255.0
                img = np.expand_dims(img, axis=0)  # Add batch dimension
                
                # Run inference
                try:
                    predictions = model.predict(img, verbose=0)
                    
                    # Process predictions (adjust based on your model output format)
                    # This is a generic example - you may need to adjust based on your actual model
                    if len(predictions) > 0:
                        # Assuming binary classification (theft/no theft) or confidence score
                        confidence = float(predictions[0][0]) if len(predictions[0]) > 0 else 0.0
                        
                        # Filter detections with confidence > 0.5
                        if confidence > 0.5:
                            timestamp = frame_count / fps
                            detections.append({
                                "frame": frame_count,
                                "timestamp": timestamp,
                                "confidence": confidence,
                                "bbox": [100, 100, 200, 200]  # Placeholder bbox - adjust based on your model
                            })
                except Exception as e:
                    print(f"Error during inference: {str(e)}")
                    continue
        
        cap.release()
        
        # Calculate risk level
        risk_level = "Low"
        if len(detections) > 10:
            risk_level = "High"
        elif len(detections) > 5:
            risk_level = "Medium"
            
        # Store results
        results_cache[job_id] = {
            "status": "completed",
            "detections": detections,
            "total_frames": total_frames,
            "risk_level": risk_level,
            "confidence_avg": np.mean([d["confidence"] for d in detections]) if detections else 0,
            "detection_count": len(detections),
            "processed_at": datetime.now().isoformat()
        }
        
        processing_status[job_id] = {"status": "completed", "progress": 100}
        
    except Exception as e:
        processing_status[job_id] = {"status": "error", "error": str(e)}
        print(f"Error processing video {job_id}: {str(e)}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "backend": "tensorflow",
        "total_incidents": len(surveillance_incidents),
        "flagged_incidents": len([i for i in surveillance_incidents.values() if i['flagged']]),
        "pending_notifications": len([n for n in notification_queue if not n['read']]),
        "timestamp": datetime.now().isoformat()
    })

@app.route('/surveillance/scan', methods=['POST'])
def scan_videos():
    """Manually trigger surveillance video scan"""
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
        
        return send_from_directory(VIDEOS_FOLDER, video_filename)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 404

@app.route('/upload', methods=['POST'])
def upload_video():
    """Upload video for theft detection"""
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
        
        # Start processing in background thread
        thread = threading.Thread(target=process_video_frames, args=(filepath, job_id))
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

@app.route('/demo', methods=['POST'])
def process_demo_video():
    """Process demo video for quick testing"""
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
        return send_from_directory(app.config['VIDEOS_FOLDER'], filename)
    except Exception as e:
        return jsonify({"error": str(e)}), 404

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
    
    # Create necessary directories
    os.makedirs('videos', exist_ok=True)
    os.makedirs('models', exist_ok=True)
    
    # Load model
    model_loaded = load_model()
    if not model_loaded:
        print("⚠️  Warning: Model not loaded. Place your best_model.h5 in the models/ directory")
    else:
        print("✅ Theft detection model loaded successfully")
    
    # Start surveillance monitoring
    start_surveillance_monitoring()
    
    # Start Flask app
    print("🌐 Starting Flask server on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)  # Turn off debug for production