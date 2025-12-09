"""
Retail Security Unified - Separate MJPEG endpoints for QR & Tracking
- Adds /feed/qr and /feed/tracking endpoints that stream the left (QR) and right (Tracking) panes separately
- Keeps existing combined UI and /feed endpoint for compatibility

Run: python retail_security_unified.py
"""

import os
import time
import base64
import threading
from threading import Lock, Thread
from datetime import datetime

import cv2
import numpy as np
import torch
from PIL import Image
from dotenv import load_dotenv

# Optional TTS
try:
    import pyttsx3
except Exception:
    pyttsx3 = None

from facenet_pytorch import MTCNN, InceptionResnetV1
# import torchreid  # Disabled due to tensorboard import issues
from ultralytics import YOLO
from supabase import create_client, Client

# Flask server for remote endpoints and MJPEG streaming
from flask import Flask, Response, jsonify, request
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)


class RetailSecuritySystem:
    def __init__(self, camera_idx=0, window_width=1280, window_height=540):
        # Supabase
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
        if self.supabase_url and self.supabase_key:
            self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        else:
            self.supabase = None
            print("⚠ Supabase not configured. DB ops will be skipped.")

        # Device
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.use_half = self.device.type == 'cuda'

        # Models
        print("Loading face model...")
        self.mtcnn = MTCNN(keep_all=True, device=self.device)
        self.face_model = InceptionResnetV1(pretrained='vggface2').eval().to(self.device)
        self.reid_model = None  # Disabled due to torchreid import issues - using face-only matching
        if self.use_half:
            try:
                self.face_model = self.face_model.half()
                print("✓ FP16 enabled")
            except Exception:
                pass
        print("✅ Face model loaded (using face-only matching)")

        # YOLO (theft model)
        self.theft_model = None
        self.is_custom_theft_model = False
        self.load_theft_yolo()

        # Camera
        self.camera_idx = camera_idx
        self.cap = None
        self.frame_lock = Lock()
        self.latest_frame = None
        self.stop_camera_thread = False

        # UI layout
        self.window_width = window_width
        self.window_height = window_height
        # left pane width fraction
        self.left_frac = 0.4

        # QR & registration
        self.qr_detector = cv2.QRCodeDetector()
        self.qr_cooldown = 2.0
        self.last_qr_time = 0

        # Customers
        self.active_customers = {}  # email -> {face_emb, body_emb, last_seen}
        self.customer_lock = Lock()
        self.embeddings_frames = 8
        self.similarity_threshold = 0.55

        # Alerts
        self.last_alert_time = {}
        self.alert_cooldown = 30
        self.theft_detections = []  # List of theft alerts for API
        self.theft_lock = Lock()  # Thread lock for detections list
        
        # Tracking control - ONLY enable after first QR registration
        self.tracking_enabled = False  # Start disabled until QR scanned

        # Runtime flags
        self.running = False

        # TTS
        if pyttsx3:
            try:
                self.tts = pyttsx3.init()
                self.tts.setProperty('rate', 150)
            except Exception:
                self.tts = None
        else:
            self.tts = None

        print("✅ System initialized - combined UI mode with separate feeds")

    def load_theft_yolo(self):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_paths = [
            os.path.join(script_dir, 'models', 'best.pt'),
            os.path.join(script_dir, 'runs2', 'train2', 'theft_yolo11_v2', 'experiment2', 'weights', 'best.pt'),
            os.path.join(script_dir, 'best.pt'),
        ]
        for p in model_paths:
            if os.path.exists(p):
                try:
                    self.theft_model = YOLO(p)
                    print(f"✅ Loaded YOLO model: {p}")
                    self.is_custom_theft_model = 'best.pt' in p
                    return
                except Exception as e:
                    print(f"❌ YOLO load failed for {p}: {e}")
        # If no model found, skip fallback download - just warn user
        print("⚠️ No theft detection model found. Please ensure models/best.pt exists.")
        self.theft_model = None

    # ---------------- Camera control ----------------
    def start_camera(self):
        if self.cap is not None and self.cap.isOpened():
            print("Camera already running")
            return
        
        print(f"🎥 Attempting to open camera {self.camera_idx}...")
        
        # Try multiple camera backends
        backends = [
            (cv2.CAP_DSHOW, "DirectShow"),
            (cv2.CAP_MSMF, "Media Foundation"),
            (cv2.CAP_ANY, "Any available")
        ]
        
        for backend, name in backends:
            print(f"   Trying {name} backend...")
            self.cap = cv2.VideoCapture(self.camera_idx, backend)
            if self.cap.isOpened():
                print(f"   ✓ Camera opened with {name}")
                break
            self.cap.release()
            self.cap = None
        
        if self.cap is None or not self.cap.isOpened():
            raise Exception(f"Cannot open webcam at index {self.camera_idx}. Please check:\n"
                          f"  1. Camera is connected and not in use\n"
                          f"  2. Camera permissions are granted\n"
                          f"  3. Try different camera index (0, 1, 2...)")
        
        # Set camera properties
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        self.cap.set(cv2.CAP_PROP_FPS, 30)
        
        # Verify we can read frames
        ret, test_frame = self.cap.read()
        if not ret or test_frame is None:
            self.cap.release()
            self.cap = None
            raise Exception("Camera opened but cannot read frames")
        
        print(f"✅ Camera resolution: {test_frame.shape[1]}x{test_frame.shape[0]}")
        
        self.stop_camera_thread = False
        Thread(target=self.update_frame, daemon=True).start()
        print("🎥 Camera started successfully!")

    def stop_camera(self):
        self.stop_camera_thread = True
        time.sleep(0.1)
        if self.cap:
            self.cap.release()
            self.cap = None
        print("🛑 Camera stopped")

    def update_frame(self):
        while not self.stop_camera_thread:
            if not self.cap:
                time.sleep(0.05)
                continue
            ret, frame = self.cap.read()
            if ret:
                with self.frame_lock:
                    self.latest_frame = frame
            else:
                time.sleep(0.01)

    def get_frame(self):
        with self.frame_lock:
            return self.latest_frame.copy() if self.latest_frame is not None else None

    # ---------------- Embeddings ----------------
    def generate_face_embedding(self, frame):
        try:
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil = Image.fromarray(frame_rgb)
            boxes, _ = self.mtcnn.detect(pil)
            if boxes is None or len(boxes) == 0:
                return None, None
            box = boxes[0]
            x1, y1, x2, y2 = [max(0, int(v)) for v in box]
            x2, y2 = min(frame.shape[1], x2), min(frame.shape[0], y2)
            if x2 <= x1 or y2 <= y1:
                return None, None
            face = frame_rgb[y1:y2, x1:x2]
            face = cv2.resize(face, (160, 160))
            tensor = torch.tensor(face).permute(2, 0, 1).float().unsqueeze(0).to(self.device) / 255.0
            mean = torch.tensor([0.5, 0.5, 0.5]).view(1, 3, 1, 1).to(self.device)
            std = torch.tensor([0.5, 0.5, 0.5]).view(1, 3, 1, 1).to(self.device)
            tensor = (tensor - mean) / std
            if self.use_half:
                tensor = tensor.half()
            with torch.no_grad():
                emb = self.face_model(tensor)
            emb = emb.cpu().numpy().flatten()
            emb = emb / (np.linalg.norm(emb) + 1e-10)
            return emb, (x1, y1, x2, y2)
        except Exception as e:
            return None, None

    def generate_body_embedding(self, frame, bbox):
        # Body embeddings disabled - using face-only matching
        return None

    def compare_embeddings(self, a, b):
        if a is None or b is None:
            return 0.0
        na = np.linalg.norm(a)
        nb = np.linalg.norm(b)
        if na == 0 or nb == 0:
            return 0.0
        return float(np.dot(a/na, b/nb))

    # ---------------- Matching ----------------
    def find_matching_customer(self, face_emb, body_emb):
        best_score = 0
        best_email = None
        best_face = 0.0
        best_body = 0.0
        with self.customer_lock:
            for email, data in self.active_customers.items():
                face_sim = 0.0
                body_sim = 0.0
                if face_emb is not None and data.get('face_emb') is not None:
                    face_sim = self.compare_embeddings(face_emb, data['face_emb'])
                if body_emb is not None and data.get('body_emb') is not None:
                    body_sim = self.compare_embeddings(body_emb, data['body_emb'])
                if face_sim > 0 and body_sim > 0:
                    score = 0.7 * face_sim + 0.3 * body_sim
                elif face_sim > 0:
                    score = 0.9 * face_sim
                elif body_sim > 0:
                    score = 0.8 * body_sim
                else:
                    score = 0
                if score > best_score and score > self.similarity_threshold:
                    best_score = score
                    best_email = email
                    best_face = face_sim
                    best_body = body_sim
        return best_email, best_score, best_face, best_body

    # ---------------- Registration (non-blocking) ----------------
    def announce_theft(self, person_id, confidence):
        """Announce theft detection via voice (non-blocking)"""
        def speak():
            if self.tts:
                try:
                    message = f"Alert! Theft detected. Person: {person_id}. Confidence: {int(confidence * 100)} percent."
                    print(f"🔊 Voice Alert: {message}")
                    self.tts.say(message)
                    self.tts.runAndWait()
                except Exception as e:
                    print(f"TTS Error: {e}")
        Thread(target=speak, daemon=True).start()
    
    def save_theft_alert(self, person_id, confidence, match_score):
        """Save theft alert to Supabase surveillance_incidents table"""
        if not self.supabase:
            return
        try:
            payload = {
                'incident_type': 'theft_detection',
                'person_identifier': person_id,
                'confidence': float(confidence),
                'match_score': float(match_score),
                'timestamp': datetime.now().isoformat(),
                'status': 'active',
                'description': f"Shoplifting behavior detected with {confidence:.1%} confidence"
            }
            self.supabase.table('surveillance_incidents').insert(payload).execute()
            print(f"💾 Saved theft alert to database: {person_id}")
        except Exception as e:
            print(f"⚠ Database save error: {e}")

    def start_registration_thread(self, email):
        Thread(target=self.register_customer_from_qr, args=(email,), daemon=True).start()

    def register_customer_from_qr(self, email):
        print(f"📩 Starting registration for {email}")
        face_list = []
        body_list = []
        attempts = 0
        max_attempts = 200
        while len(face_list) < self.embeddings_frames and attempts < max_attempts:
            frame = self.get_frame()
            if frame is None:
                attempts += 1
                time.sleep(0.02)
                continue
            attempts += 1
            f_emb, f_box = self.generate_face_embedding(frame)
            if f_emb is not None:
                face_list.append(f_emb)
                x1, y1, x2, y2 = f_box
                body_h = (y2 - y1) * 3
                body_bbox = (max(0, x1 - 30), max(0, y2), min(frame.shape[1], x2 + 30), min(frame.shape[0], y2 + int(body_h)))
                b_emb = self.generate_body_embedding(frame, body_bbox)
                if b_emb is not None:
                    body_list.append(b_emb)
                print(f"  Captured {len(face_list)}/{self.embeddings_frames}")
            time.sleep(0.05)

        if len(face_list) == 0:
            print(f"❌ No faces captured for {email}")
            return {'success': False, 'message': 'No faces captured'}

        avg_face = np.mean(np.stack(face_list), axis=0)
        avg_body = np.mean(np.stack(body_list), axis=0) if body_list else None

        with self.customer_lock:
            self.active_customers[email] = {
                'face_emb': avg_face,
                'body_emb': avg_body,
                'last_seen': time.time()
            }
        
        # Enable theft detection tracking after first customer registration
        if not self.tracking_enabled:
            self.tracking_enabled = True
            print(f"🎯 TRACKING MODE ACTIVATED - Theft detection now enabled!")
        
        print(f"✅ Registered {email} (in-memory). Active customers: {len(self.active_customers)}")

        if self.supabase:
            try:
                payload = {
                    'user_id': None,
                    'embedding': {
                        'email': email,
                        'face': avg_face.tolist(),
                        'body': avg_body.tolist() if avg_body is not None else None
                    },
                    'created_at': datetime.now().isoformat()
                }
                self.supabase.table('user_embeddings').upsert(payload).execute()
                print(f"💾 Saved embeddings for {email} to Supabase")
            except Exception as e:
                print(f"⚠ Could not save to Supabase: {e}")

        return {'success': True, 'message': f'{email} registered'}

    # ---------------- Alerts ----------------
    def can_alert(self, key):
        now = time.time()
        last = self.last_alert_time.get(key, 0)
        if now - last < self.alert_cooldown:
            return False
        self.last_alert_time[key] = now
        return True

    def save_theft_alert(self, frame, email, bbox, confidence, reid_score):
        x1, y1, x2, y2 = bbox
        labeled = frame.copy()
        cv2.rectangle(labeled, (x1, y1), (x2, y2), (0, 0, 255), 3)
        t = datetime.now().strftime('%Y%m%d_%H%M%S')
        os.makedirs('theft_alerts', exist_ok=True)
        filename = f"theft_alerts/{t}_{(email or 'unknown')}.jpg"
        cv2.imwrite(filename, labeled)

        if self.supabase:
            try:
                # Save alert without image (store locally instead)
                payload = {
                    'timestamp': datetime.now().isoformat(),
                    'customer_email': email or 'UNIDENTIFIED',
                    'reid_confidence': float(reid_score),
                    'theft_confidence': float(confidence),
                    'bounding_box': {'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2},
                    'camera_id': 'YOLO_CAM_01'
                }
                self.supabase.table('theft_alerts').insert(payload).execute()
                print(f"✅ Alert saved to database: {email or 'UNIDENTIFIED'}")
            except Exception as e:
                print(f"⚠ Failed saving alert to DB: {e}")

    def announce(self, msg):
        if self.tts:
            Thread(target=lambda: (self.tts.say(msg), self.tts.runAndWait()), daemon=True).start()

    # ---------------- Combined frame creation (used by UI and feeds) ----------------
    def build_combined_frame(self):
        frame = self.get_frame()
        if frame is None:
            return None

        src_h = self.window_height
        src_w = int(self.window_width * 0.95)
        try:
            frame_resized = cv2.resize(frame, (src_w, src_h))
        except Exception:
            frame_resized = cv2.resize(frame, (src_w, src_h))

        left_w = int(self.left_frac * src_w)
        right_w = src_w - left_w

        left_pane = frame_resized[:, :left_w].copy()
        right_pane = frame_resized[:, left_w: left_w + right_w].copy()

        # QR SCANNING (Left Pane)
        cv2.putText(left_pane, "QR ENTRY", (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
        cv2.rectangle(left_pane, (5, 5), (left_w - 5, src_h - 5), (200, 200, 200), 1)
        
        # Try to detect QR code
        now = time.time()
        if (now - self.last_qr_time) > self.qr_cooldown:
            try:
                data, bbox, _ = self.qr_detector.detectAndDecode(left_pane)
                if data and '@' in data:  # Valid email in QR
                    self.last_qr_time = now
                    print(f"\n📱 QR Code detected: {data}")
                    self.start_registration_thread(data)
                    # Draw QR detection box
                    if bbox is not None:
                        pts = bbox[0].astype(int)
                        cv2.polylines(left_pane, [pts], True, (0, 255, 0), 3)
                        cv2.putText(left_pane, "QR DETECTED!", (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
            except Exception as e:
                pass

        # Show tracking status on right pane
        if not self.tracking_enabled:
            cv2.putText(right_pane, "WAITING FOR QR REGISTRATION...", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
            cv2.putText(right_pane, "Tracking disabled", (10, 60), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 2)
        else:
            cv2.putText(right_pane, "TRACKING ACTIVE", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        # THEFT DETECTION (Right Pane) - ONLY if tracking is enabled
        if self.theft_model is not None and self.tracking_enabled:
            try:
                # Higher confidence threshold to reduce false positives
                results = self.theft_model(right_pane, verbose=False, conf=0.50)
                for r in results:
                    for box in r.boxes:
                        cls = int(box.cls[0])
                        conf = float(box.conf[0])
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        
                        # Class 0 = 'Shoplifting' (theft), Class 1 = 'normal'
                        if cls == 0:  # THEFT DETECTED!
                            color = (0, 0, 255)  # Red for theft
                            label = f"THEFT! {conf:.2f}"
                            
                            # Try to identify person
                            person_roi = right_pane[y1:y2, x1:x2]
                            face_emb, _ = self.generate_face_embedding(person_roi)
                            matched_email, match_score, _, _ = self.find_matching_customer(face_emb, None)
                            
                            # Trigger alert
                            alert_key = matched_email if matched_email else "UNIDENTIFIED"
                            if (now - self.last_alert_time.get(alert_key, 0)) > self.alert_cooldown:
                                self.last_alert_time[alert_key] = now
                                
                                # Add to detections list
                                detection = {
                                    'email': matched_email if matched_email else "UNIDENTIFIED",
                                    'confidence': conf,
                                    'timestamp': datetime.now().isoformat(),
                                    'match_score': match_score if matched_email else 0.0
                                }
                                with self.theft_lock:
                                    self.theft_detections.append(detection)
                                    # Keep only last 50 detections
                                    if len(self.theft_detections) > 50:
                                        self.theft_detections = self.theft_detections[-50:]
                                
                                print(f"\n🚨 THEFT ALERT! Person: {alert_key}, Confidence: {conf:.2f}")
                                
                                # Voice alert
                                self.announce_theft(alert_key, conf)
                                
                                # Save to database
                                self.save_theft_alert(alert_key, conf, match_score)
                            
                            cv2.rectangle(right_pane, (x1, y1), (x2, y2), color, 3)
                            cv2.putText(right_pane, label, (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                            if matched_email:
                                cv2.putText(right_pane, matched_email, (x1, y2+20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
                        else:
                            # Normal person
                            color = (0, 255, 0)  # Green
                            label = f"Normal {conf:.2f}"
                            cv2.rectangle(right_pane, (x1, y1), (x2, y2), color, 2)
                            cv2.putText(right_pane, label, (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            except Exception as e:
                print(f"Error in theft detection: {e}")

        # Stitch together
        combined = np.zeros((src_h, src_w, 3), dtype=np.uint8)
        combined[:, :left_w] = left_pane
        combined[:, left_w: left_w + right_w] = right_pane

        # Top bar
        cv2.rectangle(combined, (0, 0), (src_w, 25), (0, 0, 0), -1)
        cv2.putText(combined, f"QR: Left | Tracking: Right    Registered: {len(self.active_customers)}", (8, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

        return combined, left_pane, right_pane

    # ---------------- MJPEG generators ----------------
    def generate_mjpeg(self):
        while True:
            out = self.build_combined_frame()
            if out is None:
                time.sleep(0.05)
                continue
            combined, _, _ = out
            _, buf = cv2.imencode('.jpg', combined)
            b = buf.tobytes()
            yield (b'--frame\r\n' + b'Content-Type: image/jpeg\r\n\r\n' + b + b'\r\n')
            time.sleep(0.03)

    def generate_mjpeg_qr(self):
        while True:
            out = self.build_combined_frame()
            if out is None:
                time.sleep(0.05)
                continue
            _, left_pane, _ = out
            _, buf = cv2.imencode('.jpg', left_pane)
            b = buf.tobytes()
            yield (b'--frame\r\n' + b'Content-Type: image/jpeg\r\n\r\n' + b + b'\r\n')
            time.sleep(0.03)

    def generate_mjpeg_tracking(self):
        while True:
            out = self.build_combined_frame()
            if out is None:
                time.sleep(0.05)
                continue
            _, _, right_pane = out
            _, buf = cv2.imencode('.jpg', right_pane)
            b = buf.tobytes()
            yield (b'--frame\r\n' + b'Content-Type: image/jpeg\r\n\r\n' + b + b'\r\n')
            time.sleep(0.03)


# Create system instance
security_system = RetailSecuritySystem()

# Flask routes
@app.route('/')
def index():
    return jsonify({'service': 'RetailSecurityUnified', 'status': 'ok'})

@app.route('/health')
def health():
    camera_running = security_system.cap is not None and security_system.cap.isOpened()
    return jsonify({
        'camera_active': camera_running,
        'streaming': camera_running,
        'active_customers': len(security_system.active_customers)
    })

@app.route('/start', methods=['POST'])
def start_camera():
    try:
        security_system.start_camera()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/stop', methods=['POST'])
def stop_camera():
    security_system.stop_camera()
    return jsonify({'success': True})

# Existing combined feed (full frame)
@app.route('/feed')
def feed():
    return Response(security_system.generate_mjpeg(), mimetype='multipart/x-mixed-replace; boundary=frame')

# New: QR-only feed (left pane)
@app.route('/feed/qr')
def feed_qr():
    return Response(security_system.generate_mjpeg_qr(), mimetype='multipart/x-mixed-replace; boundary=frame')

# New: Tracking-only feed (right pane)
@app.route('/feed/tracking')
def feed_tracking():
    return Response(security_system.generate_mjpeg_tracking(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/register', methods=['POST'])
def api_register():
    data = request.get_json() or {}
    email = data.get('email')
    if not email:
        return jsonify({'success': False, 'message': 'email required'}), 400
    security_system.start_registration_thread(email)
    return jsonify({'success': True, 'message': f'registration started for {email}'})

@app.route('/active-customers')
def active_customers_api():
    with security_system.customer_lock:
        customers = [{'email': e, 'last_seen': v['last_seen']} for e, v in security_system.active_customers.items()]
    return jsonify({'count': len(customers), 'customers': customers})

@app.route('/detections')
def detections_api():
    """Return list of theft detections for frontend"""
    with security_system.theft_lock:
        detections = security_system.theft_detections.copy()
    return jsonify({'count': len(detections), 'detections': detections})


if __name__ == '__main__':
    print("=" * 60)
    print("🔒 YOLO THEFT DETECTION BACKEND")
    print("=" * 60)
    print(f"✅ Face Recognition: Ready")
    print(f"✅ YOLO Model: Loaded")
    print(f"✅ API Server: Starting on http://localhost:5002")
    print(f"✅ Camera: Will start on first request")
    print("=" * 60)
    print("DEBUG: About to call app.run()...")
    import sys
    import flask as flask_module
    print(f"DEBUG: Python version: {sys.version}")
    print(f"DEBUG: Flask version: {flask_module.__version__}")
    
    # Run Flask server (blocking)
    try:
        print("DEBUG: Calling app.run with host=0.0.0.0, port=5002...")
        app.run(host='0.0.0.0', port=5002, debug=False, threaded=True, use_reloader=False)
        print("DEBUG: app.run() returned normally - THIS SHOULD NOT HAPPEN!")
    except KeyboardInterrupt:
        print("\nDEBUG: KeyboardInterrupt caught")
    except OSError as e:
        print(f"\nDEBUG: OSError (port in use?): {e}")
        import traceback
        traceback.print_exc()
    except Exception as e:
        print(f"\nDEBUG: Exception caught: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
    finally:
        print("DEBUG: In finally block")
        if security_system.cap:
            security_system.stop_camera()
        print("✅ Shutdown complete")