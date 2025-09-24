# 🔧 Theft Detection Integration Setup Guide

## 📁 **Project Structure Created**

Your project now has the following structure for theft detection:

```
Matrix/matrix/
├── python-services/
│   └── theft-detection/
│       ├── app.py                 # Flask API service
│       ├── requirements.txt       # Python dependencies
│       ├── README.md             # Service documentation
│       ├── videos/               # Upload folder for videos
│       ├── models/               # Folder for your ML model
│       └── notebooks/            # Jupyter notebooks
│           ├── data_preparation.ipynb
│           └── shoplifting_detection_model.ipynb
├── public/
│   └── videos/                   # Public video folder
└── src/app/
    ├── admin/
    │   └── theft-detection/
    │       └── page.jsx          # New theft detection UI
    └── api/
        └── theft-detection/
            ├── route.js          # Main upload/status endpoint
            ├── status/[jobId]/   # Status checking
            ├── results/[jobId]/  # Results retrieval
            └── demo/             # Demo processing
```

## 🎯 **Next Steps**

### **Step 1: Copy Your Files**
Copy the following files from your Testvideo folder:
1. Copy `demo1.mp4` to → `Matrix/matrix/python-services/theft-detection/videos/`
2. Copy `best_model.h5` to → `Matrix/matrix/python-services/theft-detection/models/`

**Note:** Your notebooks are already organized:
- `data_preparation.ipynb` → `python-services/theft-detection/notebooks/`
- `shoplifting_detection_model.ipynb` → `python-services/theft-detection/notebooks/`

### **Step 2: Install Python Dependencies**
Open a new terminal in the `python-services/theft-detection/` directory:

```bash
cd python-services/theft-detection
pip install -r requirements.txt
```

**Note:** If you get "ModuleNotFoundError", use the virtual environment Python:
```bash
& "E:\Eighth_Semester\FYP-2\Folder\.venv\Scripts\python.exe" -m pip install -r requirements.txt
```

### **Step 3: Start the Python Service**
In the same directory, run:

```bash
python app.py
```

**Or if using the virtual environment:**
```bash
& "E:\Eighth_Semester\FYP-2\Folder\.venv\Scripts\python.exe" app.py
```

This will start the Flask service on `http://localhost:5000`

### **Step 4: Start Next.js (if not running)**
In your main project directory:

```bash
npm run dev
```

Your Next.js app will run on `http://localhost:3000`

### **Step 5: Test the System**
1. Visit `http://localhost:3000/admin/theft-detection`
2. You should see:
   - **Service Status**: Online/Offline indicator
   - **Upload Video**: Drag & drop interface
   - **Quick Demo**: Button to test with demo1.mp4

## 🔄 **How It Works**

### **Upload Flow:**
1. User uploads video via Next.js interface
2. Next.js forwards to Python Flask service
3. Flask processes video with your ML model
4. Results are returned and displayed

### **Demo Flow:**
1. Click "Run Demo Analysis"
2. Python service processes demo1.mp4
3. Real-time progress updates
4. Results displayed with risk analysis

### **API Integration:**
- **POST** `/api/theft-detection` → Upload video
- **GET** `/api/theft-detection/status/[jobId]` → Check processing status
- **GET** `/api/theft-detection/results/[jobId]` → Get analysis results
- **POST** `/api/theft-detection/demo` → Process demo video

## 🎨 **Features Included**

✅ **Drag & Drop Video Upload**
✅ **Real-time Processing Status**
✅ **Risk Level Analysis (High/Medium/Low)**
✅ **Detailed Detection Timeline**
✅ **Downloadable JSON Reports**
✅ **Service Health Monitoring**
✅ **Demo Video Testing**

## ⚠️ **Important Notes**

1. **Model Path**: Make sure `best_model.h5` is in the `models/` folder
2. **Video Path**: Demo video should be in the `videos/` folder
3. **Dependencies**: Install TensorFlow and other packages before running
4. **Ports**: Python runs on :5000, Next.js on :3000
5. **File Size**: Video uploads limited to 100MB
6. **Model Format**: Updated to use Keras/TensorFlow (.h5) instead of PyTorch (.pt)

## 🐛 **Troubleshooting**

**Service shows "Offline":**
- Check if Python Flask service is running
- Verify no port 5000 conflicts

**"Model not found" error:**
- Ensure `best_model.h5` is in `python-services/theft-detection/models/`

**Demo doesn't work:**
- Make sure `demo1.mp4` is in `python-services/theft-detection/videos/`

**Upload fails:**
- Check file size (<100MB)
- Verify video format is supported (mp4, avi, mov, mkv, wmv)

## 🚀 **Ready to Go!**

Once you've completed these steps, your theft detection system will be fully integrated with your existing Matrix retail system. The AI-powered analysis will work seamlessly with your product management and admin dashboard.