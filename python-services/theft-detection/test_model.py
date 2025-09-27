#!/usr/bin/env python3
"""
Test script to verify model loading and preprocessing matches notebook
"""
import tensorflow as tf
import cv2
import numpy as np
import os

def test_model_loading():
    """Test if model loads correctly"""
    try:
        print("🔄 Testing model loading...")
        model = tf.keras.models.load_model('models/best_model.h5')
        print("✅ Model loaded successfully!")
        print(f"📊 Input shape: {model.input_shape}")
        print(f"📈 Output shape: {model.output_shape}")
        return model
    except Exception as e:
        print(f"❌ Model loading failed: {e}")
        return None

def test_preprocessing(model, video_path="videos/demo1.mp4"):
    """Test preprocessing pipeline matches notebook"""
    if not model:
        print("❌ No model available for testing")
        return
        
    if not os.path.exists(video_path):
        print(f"❌ Video file not found: {video_path}")
        return
        
    print(f"🔄 Testing preprocessing with: {video_path}")
    
    cap = cv2.VideoCapture(video_path)
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        print("❌ Could not read frame from video")
        return
        
    print(f"📹 Original frame shape: {frame.shape}")
    
    # **CORRECT PREPROCESSING - same as notebook**
    # Resize frame
    resized_frame = cv2.resize(frame, (224, 224))
    print(f"📐 Resized shape: {resized_frame.shape}")
    
    # **CRITICAL: Convert BGR to RGB**
    rgb_frame = cv2.cvtColor(resized_frame, cv2.COLOR_BGR2RGB)
    print(f"🌈 RGB frame shape: {rgb_frame.shape}")
    
    # Normalize to [0,1]
    normalized_frame = rgb_frame.astype(np.float32) / 255.0
    print(f"📊 Normalized range: [{normalized_frame.min():.3f}, {normalized_frame.max():.3f}]")
    
    # Add batch dimension
    input_frame = np.expand_dims(normalized_frame, axis=0)
    print(f"📦 Batch shape: {input_frame.shape}")
    
    # Make prediction
    try:
        prediction = model.predict(input_frame, verbose=0)
        confidence = float(prediction[0][0])
        print(f"🧠 Model prediction: {confidence:.4f} ({confidence*100:.1f}%)")
        
        if confidence > 0.6:
            print("🚨 THEFT DETECTED!")
        else:
            print("✅ Normal activity")
            
    except Exception as e:
        print(f"❌ Prediction failed: {e}")

if __name__ == "__main__":
    print("🔍 Testing Matrix Theft Detection Model...")
    model = test_model_loading()
    test_preprocessing(model)