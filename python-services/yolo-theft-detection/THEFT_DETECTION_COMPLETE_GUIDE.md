# 🚨 Complete Theft Detection System Guide

## ✅ System Overview

Your theft detection system is now **FULLY OPERATIONAL** with the following workflow:

### 🔄 Complete Workflow

```
1. Customer scans QR code
   ↓
2. Camera captures 10 frames automatically
   ↓
3. System generates:
   - Face embedding (512D)
   - Body embedding (2048D)
   ↓
4. Saves to user_embeddings table (JSONB format)
   ↓
5. Customer added to active_customers list
   ↓
6. YOLO11 continuously monitors for theft behavior
   ↓
7. When theft detected:
   - YOLO detects suspicious behavior (class 1)
   - System extracts face/body from detected person
   - Matches against registered customers
   - Draws RED bounding box around thief
   - Saves alert to theft_alerts table
   - Stores labeled frame with customer email
   ↓
8. Admin receives real-time alert with:
   - Customer email
   - Confidence scores
   - Bounding box coordinates
   - Labeled frame image
```

---

## 📊 Database Schema (Current)

### ✅ `user_embeddings` Table
```sql
CREATE TABLE user_embeddings (
  user_id UUID PRIMARY KEY,
  embedding JSONB NOT NULL,  -- {"face": [...], "body": [...], "email": "..."}
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES "Customer"(id)
);
```

**Format:**
```json
{
  "face": [512 floats],
  "body": [2048 floats],
  "email": "customer@example.com"
}
```

### ✅ `theft_alerts` Table
```sql
CREATE TABLE theft_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  customer_email TEXT NOT NULL,
  reid_confidence FLOAT,
  theft_confidence FLOAT,
  bounding_box JSONB,  -- {"x1": 100, "y1": 200, "x2": 300, "y2": 400}
  track_id INTEGER,
  frame_path TEXT,
  camera_id TEXT DEFAULT 'main'
);
```

### ⚠️ `customers_instore` Table (DEPRECATED)
**This table is NO LONGER USED.** All embeddings are now stored in `user_embeddings`.

---

## 🎯 API Endpoints

### Base URL: `http://127.0.0.1:5002`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service info |
| `/health` | GET | System health status |
| `/start` | POST | Start camera |
| `/stop` | POST | Stop camera |
| `/register` | POST | Manually register customer |
| `/feed` | GET | Live video stream (MJPEG) |
| `/detections` | GET | All detections (theft + normal) |
| **`/theft-alerts`** | GET | **Real-time theft alerts** ⭐ |
| `/active-customers` | GET | Currently active customers |

---

## 🔴 How Theft Detection Works

### 1. **YOLO11 Detection**
- Model: `yolo11n.pt` or `best.pt`
- Classes:
  - **Class 0**: Normal behavior
  - **Class 1**: Theft behavior ⚠️

### 2. **When Theft Detected**
```python
# System automatically:
1. Draws RED bounding box around person
2. Extracts face embedding (512D)
3. Extracts body embedding (2048D)
4. Compares with registered customers:
   - Face similarity: 70% weight
   - Body similarity: 30% weight
   - Threshold: 0.55 (55%)
5. If match found:
   - Identifies customer email
   - Saves alert to theft_alerts table
   - Saves labeled frame to theft_alerts/ folder
   - Updates recent_theft_alerts list (for real-time polling)
6. If no match:
   - Labels as "UNKNOWN THEFT"
   - Still saves alert (with null email)
```

### 3. **Bounding Box Colors**
- 🟢 **GREEN**: Normal customer (no theft)
- 🔴 **RED**: Theft detected!

### 4. **Similarity Calculation**
```python
combined_score = (face_similarity * 0.7) + (body_similarity * 0.3)

if combined_score > 0.55:
    # Customer identified!
    save_theft_alert(email, confidence, bbox)
```

---

## 🎬 Testing the Complete System

### Step 1: Start Service
```powershell
cd E:\Eighth_Semester\FYP-2\MATRIX\python-services\yolo-theft-detection
python app.py
```

### Step 2: Start Camera
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:5002/start" -Method POST
```

### Step 3: Register Customers
**Option A: QR Scan (Automatic)**
- Customer scans QR code with email
- System auto-captures 10 frames
- Saves to `user_embeddings`

**Option B: Manual Registration**
```powershell
$body = @{email = "test@example.com"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://127.0.0.1:5002/register" -Method POST -Body $body -ContentType "application/json"
```

### Step 4: View Live Feed
Open browser: `http://127.0.0.1:5002/feed`

### Step 5: Simulate Theft
1. Stand in front of camera
2. Perform suspicious action (e.g., hide item, quick movements)
3. YOLO11 detects behavior as theft (class 1)
4. System matches your face/body
5. **RED box appears with your email!**

### Step 6: Check Theft Alerts
```powershell
# Real-time alerts (for frontend polling)
Invoke-RestMethod -Uri "http://127.0.0.1:5002/theft-alerts"

# Response:
{
  "alerts": [
    {
      "timestamp": "2025-11-21T17:30:45",
      "email": "hubba@gmail.com",
      "confidence": 0.87,
      "reid_score": 0.72,
      "alert_id": "uuid-here",
      "bbox": {"x1": 100, "y1": 200, "x2": 300, "y2": 400}
    }
  ],
  "count": 1
}
```

### Step 7: Check Database
```sql
-- View all theft alerts
SELECT * FROM theft_alerts ORDER BY timestamp DESC;

-- View customer embeddings
SELECT user_id, embedding->>'email' as email, updated_at 
FROM user_embeddings;
```

---

## 🎨 Frontend Integration

### React Component Example
```javascript
// Poll for theft alerts every 3 seconds
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await fetch('http://127.0.0.1:5002/theft-alerts');
    const data = await response.json();
    
    if (data.count > 0) {
      // Show alert notification
      data.alerts.forEach(alert => {
        showNotification({
          title: '🚨 THEFT DETECTED!',
          message: `Customer: ${alert.email}`,
          type: 'error',
          confidence: alert.confidence
        });
      });
    }
  }, 3000);
  
  return () => clearInterval(interval);
}, []);
```

---

## 🔧 Troubleshooting

### ❌ Issue: No bounding boxes appear
**Solution:**
- Check if YOLO model is loaded: Look for "✅ Loaded YOLO model" in logs
- Verify model file exists: `yolo11n.pt` or `best.pt`
- Ensure model was trained with class 1 = theft

### ❌ Issue: Bounding boxes but no customer match
**Symptoms:**
- RED box shows "UNKNOWN THEFT"
- Logs show: `FaceSim: 0.00 | BodySim: 0.00`

**Solutions:**
1. Lower similarity threshold:
```python
self.similarity_threshold = 0.45  # Was 0.55
```

2. Check embeddings in database:
```sql
SELECT * FROM user_embeddings WHERE embedding->>'email' = 'hubba@gmail.com';
```

3. Re-register customer (capture 10 new frames)

### ❌ Issue: GREEN boxes instead of RED during theft
**Cause:** YOLO model classifying theft as normal behavior (class 0)

**Solutions:**
1. Retrain YOLO11 model with more theft examples
2. Lower confidence threshold:
```python
results = self.theft_model(frame, verbose=False, conf=0.3)  # Was 0.5
```

### ❌ Issue: No alerts in database
**Check:**
```python
# In app.py, verify save_theft_alert is called:
if match_email:
    if self.can_alert(match_email):
        self.save_theft_alert(frame, match_email, bbox, conf, reid_score)
```

---

## 📈 Performance Optimization

### GPU Acceleration
```python
# Automatically enabled if CUDA available
# Check logs for: "🚀 GPU: NVIDIA GeForce RTX..."
```

### Adjust Detection Frequency
```python
# Process every Nth frame to reduce CPU load
if frame_counter % 3 == 0:  # Every 3rd frame
    results = self.theft_model(frame, ...)
```

### Batch Processing
```python
# Process multiple frames together (GPU only)
results = self.theft_model([frame1, frame2, frame3], ...)
```

---

## 🎯 Key Configuration Parameters

| Parameter | Current Value | Description |
|-----------|---------------|-------------|
| `similarity_threshold` | 0.55 | Min similarity for customer match |
| `embeddings_frames` | 10 | Frames captured during registration |
| `alert_cooldown` | 30s | Min time between alerts per customer |
| `qr_cooldown` | 3s | Min time between QR scans |
| `disappear_timeout` | 180s | Customer inactive time before removal |
| YOLO confidence | 0.5 | Min confidence for theft detection |

---

## ✅ System Status Checklist

- [x] Service running on port 5002
- [x] Camera started successfully
- [x] QR scanning enabled
- [x] Embedding capture working (10 frames)
- [x] Embeddings saved to `user_embeddings` (JSONB)
- [x] YOLO11 model loaded
- [x] Theft detection active
- [x] Customer matching implemented
- [x] RED bounding boxes for theft
- [x] Alerts saved to `theft_alerts` table
- [x] Real-time alerts endpoint (`/theft-alerts`)
- [x] Customer email displayed on alerts

---

## 🎉 What's Working Now

✅ **QR Code Scanning**: Automatically registers customers
✅ **10-Frame Capture**: Captures face + body embeddings
✅ **JSONB Storage**: Saves to `user_embeddings` table
✅ **YOLO Theft Detection**: Monitors for suspicious behavior
✅ **Customer Matching**: Identifies who committed theft
✅ **RED Bounding Boxes**: Visual indicator of theft
✅ **Database Alerts**: Saves to `theft_alerts` table
✅ **Real-time API**: Frontend can poll `/theft-alerts`
✅ **Customer Email Display**: Shows identity on alerts

---

## 📞 Support

If you encounter issues:

1. **Check Logs**: Service prints detailed debug info
2. **Test Embeddings**: Use `/active-customers` to verify registration
3. **Verify Database**: Check `user_embeddings` table has data
4. **Test YOLO**: Ensure model detects class 1 (theft)
5. **Adjust Threshold**: Lower `similarity_threshold` if needed

---

## 🚀 Next Steps

1. **Frontend Integration**: Poll `/theft-alerts` every 3s
2. **Admin Dashboard**: Display alerts with customer details
3. **Email Notifications**: Send alerts to store manager
4. **Alert History**: View past alerts from `theft_alerts` table
5. **Performance Tuning**: Optimize for your hardware

---

**System Version**: 2.0  
**Last Updated**: 2025-11-21  
**Status**: ✅ FULLY OPERATIONAL
