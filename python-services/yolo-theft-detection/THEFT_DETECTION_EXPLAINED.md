# 🎯 Theft Detection System - How It Works

## 📋 Overview

Your theft detection system uses **YOLO11n** (general object detection model) combined with **facial/body recognition** to identify potential theft.

## 🔍 Detection Logic

### 1️⃣ **Person Detection (YOLO)**
- YOLO detects all **persons** in the frame (class 0 in COCO dataset)
- Every detected person gets a bounding box

### 2️⃣ **Identity Verification (FaceNet + OSNet)**
For each detected person:
- **Face embedding** extracted (512D vector)
- **Body embedding** extracted (2048D vector from OSNet)
- Compare against registered customers in database

### 3️⃣ **Classification & Bounding Boxes**

#### 🟢 **GREEN BOX** - Registered Customer
- Person matched with registered customer (similarity > 0.55)
- Shows customer name/email
- Safe - No alert

#### 🟡 **YELLOW BOX** - Unidentified Person (Warning)
- Person NOT matched with any registered customer
- Tracked for 0-5 seconds
- Shows: `"Unidentified (Xs)"`
- No alert yet - monitoring

#### 🔴 **RED BOX** - Theft Suspect (ALERT!)
- Unidentified person present for **> 5 seconds**
- **THEFT ALERT** saved to database
- **Admin notified** via `/theft-alerts` endpoint
- Shows: `"⚠️ THEFT SUSPECT (confidence)"`
- Confidence increases with duration:
  - 5 seconds = 0.50 confidence
  - 10 seconds = 0.60 confidence
  - 15 seconds = 0.70 confidence
  - 20+ seconds = 0.95 confidence

## 🔄 **Complete Workflow**

```
1. Customer enters store
   └─> Scans QR code
   └─> Camera captures 10 frames
   └─> Face + Body embeddings saved to user_embeddings table
   └─> Customer marked as "registered"

2. During shopping:
   └─> Camera continuously detects persons
   └─> For each person:
       ├─> Extract face/body embeddings
       ├─> Compare with registered customers
       │
       ├─> IF MATCH → GREEN BOX (safe)
       │
       └─> IF NO MATCH:
           ├─> Track duration (yellow box)
           └─> IF duration > 5 seconds:
               ├─> RED BOX (theft suspect)
               ├─> Save alert to theft_alerts table
               └─> Admin gets notification
```

## 📊 **Database Tables Used**

### `user_embeddings` (Customer Registration)
```sql
{
  user_id: UUID,
  embedding: {
    face: [512D array],
    body: [2048D array],
    email: "customer@example.com"
  },
  updated_at: timestamp
}
```

### `theft_alerts` (Theft Detection)
```sql
{
  id: UUID,
  timestamp: timestamp,
  customer_email: "UNIDENTIFIED" or "customer@email.com",
  reid_confidence: 0.0-1.0,
  theft_confidence: 0.5-0.95,
  bounding_box: {x1, y1, x2, y2},
  frame_image: base64_string,
  camera_id: "main"
}
```

## 🚀 **Testing the System**

### **Step 1: Start Service**
```powershell
cd python-services/yolo-theft-detection
python app.py
```

### **Step 2: Start Camera**
```powershell
curl -X POST http://127.0.0.1:5002/start
```

### **Step 3: Register Customer**
- Scan QR code with customer email
- Wait for "✅ 10 face + 10 body" message
- Customer now registered

### **Step 4: Test Theft Detection**

#### **Scenario A: Registered Customer (Should be GREEN)**
1. Stand in front of camera after registration
2. You should see **GREEN box** with your name
3. No theft alert

#### **Scenario B: Unregistered Person (Should be YELLOW → RED)**
1. Ask someone else (not registered) to stand in front of camera
2. First 0-5 seconds: **YELLOW box** "Unidentified (Xs)"
3. After 5 seconds: **RED box** "⚠️ THEFT SUSPECT"
4. Check database: Alert saved to `theft_alerts` table

### **Step 5: View Alerts**
```powershell
# Get recent theft alerts
curl http://127.0.0.1:5002/theft-alerts

# Watch video feed
# Open browser: http://127.0.0.1:5002/feed
```

## 📈 **Real-Time Monitoring**

The video feed shows:
- **Frame counter**: Total frames processed
- **Suspects**: Number of red-box theft suspects
- **Registered**: Number of registered customers in memory
- **QR Scan: ACTIVE**: System is ready to register new customers

## ⚙️ **Adjustable Parameters**

In `app.py` (line ~110):
```python
self.similarity_threshold = 0.55  # Lower = more sensitive matching
self.unidentified_person_timeout = 5  # Seconds before theft alert
self.alert_cooldown = 30  # Seconds between alerts for same person
```

**Tuning Tips:**
- **High false positives** (too many red boxes): 
  - Increase `unidentified_person_timeout` to 10-15 seconds
  - Lower `similarity_threshold` to 0.45 (more lenient matching)
  
- **Missing real thefts** (not detecting):
  - Decrease `unidentified_person_timeout` to 3 seconds
  - Increase `similarity_threshold` to 0.60 (stricter matching)

## 🎯 **Frontend Integration**

Your Next.js frontend should:

### **1. Display Video Feed**
```jsx
<img src="http://127.0.0.1:5002/feed" alt="Live Feed" />
```

### **2. Poll for Theft Alerts**
```javascript
setInterval(async () => {
  const response = await fetch('http://127.0.0.1:5002/theft-alerts');
  const alerts = await response.json();
  
  if (alerts.length > 0) {
    // Show admin notification
    showAlert(alerts[0]);
  }
}, 3000); // Check every 3 seconds
```

### **3. Display Alert Details**
```jsx
{alert && (
  <div className="theft-alert">
    <h3>🚨 THEFT DETECTED</h3>
    <p>Time: {alert.timestamp}</p>
    <p>Confidence: {alert.theft_confidence}</p>
    <img src={`data:image/jpeg;base64,${alert.frame_image}`} />
  </div>
)}
```

## 🔧 **Troubleshooting**

### **No bounding boxes showing**
- ✅ Check camera started: `curl http://127.0.0.1:5002/health`
- ✅ Verify YOLO loaded: Check console for "✅ Loaded YOLO model"
- ✅ Check feed: Open `http://127.0.0.1:5002/feed` in browser

### **All boxes are yellow (no green boxes)**
- Face/body embeddings not matching
- Lower `similarity_threshold` to 0.45
- Re-register customer with better lighting
- Ensure customer looks directly at camera during registration

### **No red boxes (no theft alerts)**
- Unregistered person not staying long enough
- Lower `unidentified_person_timeout` to 3 seconds
- Check console logs for "🚨 POTENTIAL THEFT" messages

### **Too many false alerts**
- Increase `unidentified_person_timeout` to 10 seconds
- Increase `similarity_threshold` to 0.60
- Register all legitimate shoppers first

## 📞 **Support**

If issues persist:
1. Check console logs for errors
2. Verify Supabase connection: `curl http://127.0.0.1:5002/health`
3. Test QR registration first before testing theft detection
4. Ensure lighting is adequate for face detection

## 🎉 **Success Indicators**

✅ **System Working Correctly:**
- Green boxes on registered customers
- Yellow boxes on unidentified persons (0-5s)
- Red boxes after 5 seconds on unidentified
- Alerts saved to `theft_alerts` table
- Console shows "🚨 POTENTIAL THEFT" messages
- Frame counter incrementing
- No errors in console

---

**Last Updated:** November 23, 2025  
**Version:** 2.0 - Unified YOLO Detection with Smart Tracking
