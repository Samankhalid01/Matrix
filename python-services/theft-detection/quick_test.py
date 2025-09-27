#!/usr/bin/env python3
"""
Quick test to check model confidence scores on shoplifting videos.
This will help us understand what threshold we should use.
"""

import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras
import os

def test_model_on_video(video_path, model, max_frames=100):
    """Test model on a video and return confidence distribution"""
    print(f"🔍 Testing model on: {video_path}")
    
    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    confidences = []
    frame_count = 0
    
    while cap.isOpened() and len(confidences) < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_count += 1
        
        # Process every 30th frame
        if frame_count % 30 == 0:
            # Same preprocessing as in app.py
            resized_frame = cv2.resize(frame, (224, 224))
            rgb_frame = cv2.cvtColor(resized_frame, cv2.COLOR_BGR2RGB)
            normalized_frame = rgb_frame.astype(np.float32) / 255.0
            img = np.expand_dims(normalized_frame, axis=0)
            
            # Get prediction
            predictions = model.predict(img, verbose=0)
            confidence = float(predictions[0][0])
            confidences.append(confidence)
            
            timestamp = frame_count / fps
            print(f"  Frame {frame_count} ({timestamp:.1f}s): {confidence:.4f} ({confidence*100:.1f}%)")
    
    cap.release()
    
    if confidences:
        avg_conf = np.mean(confidences)
        max_conf = np.max(confidences)
        min_conf = np.min(confidences)
        
        print(f"📊 Results for {os.path.basename(video_path)}:")
        print(f"   Average confidence: {avg_conf:.4f} ({avg_conf*100:.1f}%)")
        print(f"   Max confidence: {max_conf:.4f} ({max_conf*100:.1f}%)")
        print(f"   Min confidence: {min_conf:.4f} ({min_conf*100:.1f}%)")
        print(f"   Total frames tested: {len(confidences)}")
        
        # Count how many frames would be detected at different thresholds
        thresholds = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
        for threshold in thresholds:
            detections = sum(1 for c in confidences if c > threshold)
            percentage = (detections / len(confidences)) * 100
            print(f"   Threshold {threshold:.1f}: {detections}/{len(confidences)} frames ({percentage:.1f}%) would be detected")
    
    return confidences

if __name__ == "__main__":
    # Load the model
    print("🔄 Loading model...")
    try:
        model = keras.models.load_model('models/best_model.h5')
        print("✅ Model loaded successfully!")
        print(f"📊 Model input shape: {model.input_shape}")
        print(f"🔢 Total parameters: {model.count_params():,}")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        exit(1)
    
    # Test on demo1.mp4 (you mentioned this contains shoplifting)
    video_path = "videos/demo1.mp4"
    if os.path.exists(video_path):
        confidences = test_model_on_video(video_path, model, max_frames=50)
        
        print(f"\n🎯 ANALYSIS:")
        print(f"If this video contains shoplifting but max confidence is < 50%,")
        print(f"then either:")
        print(f"1. The model needs recalibration (lower threshold)")
        print(f"2. The model was trained differently than expected")
        print(f"3. The preprocessing doesn't match training")
        
    else:
        print(f"❌ Video not found: {video_path}")
        print("Available videos:")
        if os.path.exists("videos"):
            for f in os.listdir("videos"):
                if f.endswith(".mp4"):
                    print(f"  - {f}")