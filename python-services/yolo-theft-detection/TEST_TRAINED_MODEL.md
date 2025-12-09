# ✅ TRAINED THEFT DETECTION MODEL - TESTING GUIDE

## 🎯 Your Setup
- ✅ **Trained model loaded**: `models/best.pt`
- ✅ **Service running**: `http://127.0.0.1:5002`
- ✅ **Detection logic**: Direct theft detection from model

## 🔍 How It Works Now

### **With Your Trained Model (best.pt)**

**YOLO Detects TWO Classes:**
- **Class 0**: Normal person (not stealing) → **GREEN BOX**
- **Class 1**: Theft behavior detected → **RED BOX** 🚨

### **Bounding Box Colors:**

#### 🟢 **GREEN BOX** - Registered Customer (Safe)
- Person matched with registered customer in database
- Shows customer name
- No alert

#### 🔴 **RED BOX** - THEFT DETECTED! 
**Two scenarios:**

1. **Registered Customer Stealing:**
   - Shows: `"🚨 THEFT: customer_name"`
   - Alert saved with customer email
   - Admin notified

2. **Unidentified Person Stealing:**
   - Shows: `"🚨 THEFT DETECTED!"`
   - Alert saved with "UNIDENTIFIED"
   - Admin notified

#### ⚫ **GRAY BOX** - Unknown Person (Neutral)
- Person not registered
- NO theft behavior detected by model
- Just passing by or shopping normally

---

## 🧪 **Testing Steps**

### **1. Start Camera**
```powershell
curl -X POST http://127.0.0.1:5002/start
```

### **2. Register Yourself**
- Scan QR code with your email
- Wait for "✅ 10 face + 10 body" message
- You're now registered

### **3. View Live Feed**
Open browser: `http://127.0.0.1:5002/feed`

### **4. Test Scenarios**

#### **Scenario A: Normal Shopping (GREEN BOX)**
1. Stand in front of camera
2. Should see **GREEN box** with your name
3. No alerts generated
4. ✅ **Expected**: Safe customer

#### **Scenario B: Registered Customer + Theft Behavior (RED BOX)**
1. Perform the **theft behavior** your model was trained on:
   - Hiding items in pocket/bag
   - Looking around suspiciously
   - Quick grabbing motions
   - Whatever your dataset defined as "theft"

2. Should see **RED box**: `"🚨 THEFT: your_name"`
3. Alert saved to database with YOUR email
4. ✅ **Expected**: Theft alert for registered customer

#### **Scenario C: Unknown Person + Theft (RED BOX)**
1. Ask someone else (NOT registered) to perform theft behavior
2. Should see **RED box**: `"🚨 THEFT DETECTED!"`
3. Alert saved with "UNIDENTIFIED"
4. ✅ **Expected**: Theft alert for unknown person

#### **Scenario D: Unknown Person + Normal Behavior (GRAY BOX)**
1. Ask someone else (NOT registered) to just stand normally
2. Should see **GRAY box**: `"Customer"`
3. No alerts generated
4. ✅ **Expected**: Just unknown person, no theft

---

## 📊 **Checking Alerts**

### **Real-time Theft Alerts API**
```powershell
curl http://127.0.0.1:5002/theft-alerts
```

### **Database Check**
Query your `theft_alerts` table in Supabase:
```sql
SELECT 
  timestamp,
  customer_email,
  theft_confidence,
  bounding_box
FROM theft_alerts
ORDER BY timestamp DESC
LIMIT 10;
```

---

## 🎨 **Visual Indicators**

Top of video feed shows:
```
[TRAINED] Frame: 1234 | Thefts: 2 | Customers: 3
```

- **`[TRAINED]`**: Your custom model is active ✅
- **`Thefts: 2`**: Number of RED boxes (active theft detections)
- **`Customers: 3`**: Registered customers in memory

---

## ⚙️ **Model Performance Tips**

### **If Model is Too Sensitive (too many false alarms):**
The model confidence threshold is set in YOLO inference (line ~505):
```python
results = self.theft_model(frame, verbose=False, conf=0.5)
```

**Increase confidence:**
```python
results = self.theft_model(frame, verbose=False, conf=0.7)  # More strict
```

### **If Model Misses Thefts:**
**Decrease confidence:**
```python
results = self.theft_model(frame, verbose=False, conf=0.3)  # More sensitive
```

### **If Face Recognition Not Working:**
Adjust similarity threshold (line ~108):
```python
self.similarity_threshold = 0.55  # Lower = more lenient (0.45)
                                  # Higher = more strict (0.65)
```

---

## 🐛 **Troubleshooting**

### **No bounding boxes at all**
- ✅ Check camera: `curl http://127.0.0.1:5002/health`
- ✅ View feed: `http://127.0.0.1:5002/feed`
- ✅ Check console for errors

### **Only GRAY boxes, no theft detected**
- Your model might not recognize the behavior as theft
- Try performing more obvious theft actions
- Check model training data - was it trained on similar scenarios?
- Lower confidence threshold to 0.3

### **GREEN boxes not showing (not recognizing registered customers)**
- Re-register with better lighting
- Look directly at camera during registration
- Lower `similarity_threshold` to 0.45

### **Too many RED boxes (false alarms)**
- Increase confidence threshold to 0.7
- Check if model was overtrained
- Retrain with more diverse "not-theft" examples

---

## 📈 **Expected Results**

### **✅ Working Correctly:**
- 🟢 Registered customers → Green boxes
- 🔴 Theft behavior (registered) → Red box with name + alert
- 🔴 Theft behavior (unknown) → Red box with "UNKNOWN" + alert
- ⚫ Normal unknown people → Gray boxes, no alert
- Console shows: `"🎯 TRAINED THEFT DETECTION MODEL ACTIVE"`

### **❌ Issues:**
- All boxes are gray → Model not detecting theft class
- No boxes → Camera/YOLO issue
- Wrong names on green boxes → Face recognition needs tuning

---

## 🎉 **Success Checklist**

- [ ] Service shows `"[TRAINED]"` in video feed
- [ ] Console shows `"🎯 TRAINED THEFT DETECTION MODEL ACTIVE"`
- [ ] Registered customers get GREEN boxes
- [ ] Theft behavior triggers RED boxes
- [ ] Alerts saved to `theft_alerts` table
- [ ] Normal unknown people get GRAY boxes (no alert)

---

**Ready to test!** 🚀

Open the video feed and try the scenarios above. Your trained model should detect theft behavior directly!
