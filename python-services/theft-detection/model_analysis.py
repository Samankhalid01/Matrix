#!/usr/bin/env python3
"""
Simple standalone test for model confidence analysis
"""

import cv2
import numpy as np
import tensorflow as tf
import os

# Simple imports without the app.py interference
print("Loading TensorFlow...")
print(f"TensorFlow version: {tf.__version__}")

# Load the model
print("Loading model...")
try:
    model = tf.keras.models.load_model('models/best_model.h5')
    print("✅ Model loaded successfully!")
    print(f"Model input shape: {model.input_shape}")
    print(f"Total parameters: {model.count_params():,}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    exit(1)

# Test on demo1.mp4
video_path = "videos/demo1.mp4"
print(f"\nTesting {video_path}...")

if not os.path.exists(video_path):
    print(f"❌ Video not found: {video_path}")
    # List available videos
    print("Available videos:")
    if os.path.exists("videos"):
        for f in os.listdir("videos"):
            if f.endswith(".mp4"):
                print(f"  - {f}")
    exit(1)

cap = cv2.VideoCapture(video_path)
fps = int(cap.get(cv2.CAP_PROP_FPS))
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
print(f"Video info: {total_frames} frames, {fps} FPS")

confidences = []
frame_count = 0
processed_frames = 0

while cap.isOpened() and processed_frames < 20:  # Test first 20 processed frames
    ret, frame = cap.read()
    if not ret:
        break
        
    frame_count += 1
    
    # Process every 30th frame (same as surveillance)
    if frame_count % 30 == 0:
        # Same preprocessing as app.py
        resized_frame = cv2.resize(frame, (224, 224))
        rgb_frame = cv2.cvtColor(resized_frame, cv2.COLOR_BGR2RGB)
        normalized_frame = rgb_frame.astype(np.float32) / 255.0
        img = np.expand_dims(normalized_frame, axis=0)
        
        # Get prediction
        predictions = model.predict(img, verbose=0)
        confidence = float(predictions[0][0])
        confidences.append(confidence)
        processed_frames += 1
        
        timestamp = frame_count / fps
        print(f"  Frame {frame_count} ({timestamp:.1f}s): {confidence:.4f} ({confidence*100:.1f}%)")

cap.release()

if confidences:
    avg_conf = np.mean(confidences)
    max_conf = np.max(confidences)
    min_conf = np.min(confidences)
    
    print(f"\n📊 Results:")
    print(f"   Average confidence: {avg_conf:.4f} ({avg_conf*100:.1f}%)")
    print(f"   Max confidence: {max_conf:.4f} ({max_conf*100:.1f}%)")
    print(f"   Min confidence: {min_conf:.4f} ({min_conf*100:.1f}%)")
    print(f"   Total frames tested: {len(confidences)}")
    
    print(f"\n🎯 Analysis:")
    if max_conf < 0.3:
        print("   🔴 VERY LOW confidence scores - Model may not be detecting shoplifting")
        print("   💡 Recommendation: Lower threshold to 20-30% or retrain model")
    elif max_conf < 0.5:
        print("   🟡 LOW confidence scores - Model detecting some suspicious activity")
        print("   💡 Recommendation: Lower threshold to 30-40%")
    else:
        print("   🟢 GOOD confidence scores - Model working as expected")
        
    print(f"\n🛠️ Threshold analysis:")
    for threshold in [0.1, 0.2, 0.3, 0.4, 0.5]:
        detections = sum(1 for c in confidences if c > threshold)
        percentage = (detections / len(confidences)) * 100 if confidences else 0
        print(f"   Threshold {threshold:.1f} ({threshold*100:.0f}%): {detections}/{len(confidences)} frames ({percentage:.1f}%) detected")