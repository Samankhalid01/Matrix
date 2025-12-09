"""
Verify the trained model classes and test detection
"""
import torch_patch  # Fix PyTorch 2.6+ model loading

from ultralytics import YOLO
import cv2

def check_model():
    print("="*60)
    print("VERIFYING THEFT DETECTION MODEL")
    print("="*60)
    
    model_path = "models/best.pt"
    
    try:
        print(f"\n📦 Loading model: {model_path}")
        model = YOLO(model_path)
        
        print("\n✅ Model loaded successfully!\n")
        print(f"📊 Model Info:")
        print(f"   Classes: {model.names}")
        print(f"   Number of classes: {len(model.names)}")
        
        # Expected: {0: 'person', 1: 'theft'}
        print("\n🎯 Expected classes:")
        print("   Class 0: Normal person (should trigger GREEN/GRAY box)")
        print("   Class 1: Theft behavior (should trigger RED box)")
        
        print("\n" + "="*60)
        print("Testing with camera frame...")
        print("="*60)
        
        # Test with webcam
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("❌ Cannot open camera")
            return
        
        ret, frame = cap.read()
        cap.release()
        
        if not ret:
            print("❌ Cannot read frame")
            return
        
        print(f"\n📸 Frame captured: {frame.shape}")
        
        # Run inference with low confidence
        print("\n🔍 Running YOLO detection (conf=0.3)...")
        results = model(frame, verbose=False, conf=0.3)
        
        detection_count = 0
        for r in results:
            detection_count += len(r.boxes)
            print(f"\n   Detected {len(r.boxes)} objects:")
            
            for box in r.boxes:
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                class_name = model.names[cls]
                
                print(f"      Class {cls} ({class_name}): conf={conf:.2f}, bbox=({x1},{y1})-({x2},{y2})")
        
        if detection_count == 0:
            print("\n   ⚠️  NO DETECTIONS!")
            print("   This might be why bounding boxes don't appear.")
            print("\n   Possible reasons:")
            print("   1. No person in frame")
            print("   2. Confidence threshold too high")
            print("   3. Model not trained properly")
            print("\n   Try lowering confidence threshold or ensure person is visible")
        else:
            print(f"\n✅ Model is detecting! Found {detection_count} objects")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_model()
