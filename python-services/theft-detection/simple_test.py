#!/usr/bin/env python3
"""
Simple approach - load model with compile=False and recompile
"""
import tensorflow as tf
import cv2
import numpy as np
import os

def load_model_simple():
    """Load model with compile=False approach"""
    try:
        print("🔄 Loading model with compile=False...")
        model = tf.keras.models.load_model('models/best_model.h5', compile=False)
        
        # Recompile the model
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        
        print("✅ Model loaded and recompiled successfully!")
        print(f"📊 Input shape: {model.input_shape}")
        print(f"📈 Output shape: {model.output_shape}")
        return model
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_with_demo1(model):
    """Test model with demo1.mp4"""
    if not model:
        return
        
    video_path = "videos/demo1.mp4"
    if not os.path.exists(video_path):
        print(f"❌ Video not found: {video_path}")
        return
        
    print(f"🔄 Testing with {video_path}...")
    
    cap = cv2.VideoCapture(video_path)
    detections = 0
    frame_count = 0
    
    while cap.isOpened() and frame_count < 150:  # Test first 150 frames
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_count += 1
        
        # Process every 15th frame
        if frame_count % 15 == 0:
            # **CORRECT PREPROCESSING - same as notebook**
            # Resize frame
            resized_frame = cv2.resize(frame, (224, 224))
            # **CRITICAL: Convert BGR to RGB**
            rgb_frame = cv2.cvtColor(resized_frame, cv2.COLOR_BGR2RGB)
            # Normalize to [0,1]
            normalized_frame = rgb_frame.astype(np.float32) / 255.0
            # Add batch dimension
            input_frame = np.expand_dims(normalized_frame, axis=0)
            
            # Make prediction
            prediction = model.predict(input_frame, verbose=0)
            confidence = float(prediction[0][0])
            
            print(f"🔍 Frame {frame_count}: Confidence = {confidence:.4f} ({confidence*100:.1f}%)")
            
            if confidence > 0.6:  # 60% threshold
                detections += 1
                print(f"🚨 THEFT DETECTED at frame {frame_count}!")
    
    cap.release()
    
    print(f"\n📊 RESULTS for {video_path}:")
    print(f"   Total frames tested: {frame_count}")
    print(f"   Detections: {detections}")
    if detections > 0:
        print(f"   🚨 SHOPLIFTING DETECTED!")
    else:
        print(f"   ✅ No theft detected")

if __name__ == "__main__":
    model = load_model_simple()
    test_with_demo1(model)