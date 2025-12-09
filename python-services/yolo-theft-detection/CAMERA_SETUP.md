# YOLO Theft Detection Service

## Quick Start

### 1. Start the Service

**Option A: Using the batch file (Windows)**
```bash
# Double-click or run:
start-yolo-service.bat
```

**Option B: Manual start**
```bash
# Activate virtual environment
.venv\Scripts\activate

# Navigate to service directory
cd python-services\yolo-theft-detection

# Run the service
python app.py
```

The service will start on **http://localhost:5002**

### 2. Open the Frontend

1. Make sure Next.js is running: `npm run dev`
2. Navigate to: http://localhost:3000/admin/yolo-theft-detection
3. Click "Start Camera" button

## Troubleshooting Camera Issues

### Camera Not Starting

**Problem**: "Cannot open webcam" error

**Solutions**:

1. **Check if camera is in use**
   - Close other applications using the camera (Zoom, Skype, Teams, etc.)
   - Close other browser tabs with camera access

2. **Check camera permissions**
   - Windows: Settings → Privacy → Camera → Allow apps to access camera
   - Make sure Python is allowed to access the camera

3. **Try different camera index**
   - Edit `app.py` line ~50: change `camera_idx=0` to `camera_idx=1` or `camera_idx=2`
   - Some systems have multiple camera devices

4. **Test camera with OpenCV**
   ```python
   import cv2
   cap = cv2.VideoCapture(0)
   if cap.isOpened():
       print("Camera works!")
       cap.release()
   else:
       print("Camera failed")
   ```

5. **Reinstall camera drivers**
   - Update Windows
   - Update camera drivers in Device Manager

6. **Check if service is running**
   - Open http://localhost:5002/health
   - Should return: `{"camera_active": true, ...}`

### Service Not Starting

1. **Check if port 5002 is in use**
   ```bash
   netstat -ano | findstr :5002
   ```

2. **Check Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Check for error messages in terminal**

## API Endpoints

- `GET /health` - Check service status
- `POST /start` - Start camera
- `POST /stop` - Stop camera
- `GET /feed` - Full video feed
- `GET /feed/qr` - QR detection feed (left pane)
- `GET /feed/tracking` - Tracking feed (right pane)
- `POST /register` - Register customer by email
- `GET /detections` - Get theft detections
- `GET /active-customers` - Get active customers

## Camera Backends

The system tries multiple backends in order:
1. **DirectShow** (CAP_DSHOW) - Best for Windows
2. **Media Foundation** (CAP_MSMF) - Windows 10+
3. **Any Available** (CAP_ANY) - Fallback

## Requirements

- Python 3.8+
- Webcam (USB or built-in)
- Windows 10/11
- Camera permissions enabled

## Features

- Real-time face detection
- QR code scanning
- Customer tracking
- Theft detection with YOLO
- Dual video feeds (QR + Tracking)
