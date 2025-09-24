# Theft Detection Python Service

This service provides REST API endpoints for video-based theft detection using TensorFlow/Keras.

## Setup

1. **Install Dependencies**:
```bash
cd python-services/theft-detection
pip install -r requirements.txt
```

2. **Add Your Model and Data**:
- Copy your `best_model.h5` file to the `models/` directory
- Copy your test videos to the `videos/` directory
- Your notebooks are in the `notebooks/` directory:
  - `data_preparation.ipynb` - Data preprocessing and preparation
  - `shoplifting_detection_model.ipynb` - Model training and evaluation

3. **Start the Service**:
```bash
python app.py
```

The service will run on `http://localhost:5000`

## Project Structure

```
theft-detection/
├── app.py                              # Flask API service
├── requirements.txt                    # Python dependencies
├── README.md                          # This file
├── models/
│   └── best_model.h5                  # Your trained Keras model
├── videos/
│   └── demo1.mp4                      # Test videos
└── notebooks/
    ├── data_preparation.ipynb         # Data preprocessing
    └── shoplifting_detection_model.ipynb # Model training
```

## API Endpoints

### Health Check
- **GET** `/health` - Check if service is running and model is loaded

### Video Processing
- **POST** `/upload` - Upload video for theft detection
- **GET** `/status/{job_id}` - Get processing status
- **GET** `/results/{job_id}` - Get detection results
- **POST** `/demo` - Process demo video (demo1.mp4)

### File Serving
- **GET** `/videos/{filename}` - Serve video files

## Response Format

### Upload Response
```json
{
  "job_id": "uuid-string",
  "status": "uploaded",
  "message": "Video uploaded successfully. Processing started."
}
```

### Results Response
```json
{
  "status": "completed",
  "detections": [
    {
      "frame": 120,
      "timestamp": 4.0,
      "confidence": 0.87,
      "bbox": [100, 200, 150, 300]
    }
  ],
  "total_frames": 1800,
  "risk_level": "High|Medium|Low",
  "confidence_avg": 0.75,
  "detection_count": 15,
  "processed_at": "2024-01-01T12:00:00"
}
```

## Integration with Next.js

The Next.js backend will communicate with this service through API routes in `src/app/api/theft-detection/`.