"""
Test script to verify YOLO detection and bounding box display
"""
import cv2
import requests
import numpy as np
from io import BytesIO
from PIL import Image
import time

def test_video_feed():
    """Connect to video feed and display it"""
    print("🎥 Connecting to video feed...")
    print("Press 'q' to quit, 's' to capture screenshot\n")
    
    url = "http://127.0.0.1:5002/feed"
    
    # Open stream
    stream = requests.get(url, stream=True, timeout=5)
    bytes_data = b''
    
    frame_count = 0
    
    for chunk in stream.iter_content(chunk_size=1024):
        bytes_data += chunk
        
        # Find JPEG boundaries
        a = bytes_data.find(b'\xff\xd8')  # JPEG start
        b = bytes_data.find(b'\xff\xd9')  # JPEG end
        
        if a != -1 and b != -1:
            jpg = bytes_data[a:b+2]
            bytes_data = bytes_data[b+2:]
            
            # Decode image
            frame = cv2.imdecode(np.frombuffer(jpg, dtype=np.uint8), cv2.IMREAD_COLOR)
            
            if frame is not None:
                frame_count += 1
                
                # Add frame counter
                cv2.putText(frame, f"Frame: {frame_count}", (10, 30), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
                
                # Display
                cv2.imshow('Theft Detection Feed', frame)
                
                # Handle keys
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    print("Exiting...")
                    break
                elif key == ord('s'):
                    filename = f"screenshot_{int(time.time())}.jpg"
                    cv2.imwrite(filename, frame)
                    print(f"📸 Screenshot saved: {filename}")
    
    cv2.destroyAllWindows()
    print(f"\n✅ Processed {frame_count} frames")

def check_status():
    """Check service status"""
    try:
        response = requests.get("http://127.0.0.1:5002/health")
        status = response.json()
        print("\n📊 Service Status:")
        print(f"   Running: {status.get('status')}")
        print(f"   Camera Active: {status.get('camera_active')}")
        print(f"   Streaming: {status.get('streaming')}")
        print(f"   Active Customers: {status.get('active_customers')}")
        return status
    except Exception as e:
        print(f"❌ Error checking status: {e}")
        return None

if __name__ == "__main__":
    print("="*60)
    print("THEFT DETECTION - LIVE VIDEO TEST")
    print("="*60)
    
    # Check status first
    status = check_status()
    
    if not status or not status.get('streaming'):
        print("\n⚠️  Camera not streaming!")
        print("   Please start the camera first:")
        print("   Invoke-WebRequest -Uri 'http://127.0.0.1:5002/start' -Method POST")
        exit(1)
    
    print("\n✅ Camera is streaming. Opening video feed...")
    print("\nLook for:")
    print("   🟢 GREEN boxes = Registered customers")
    print("   🔴 RED boxes = Theft detected")
    print("   ⚫ GRAY boxes = Unknown persons")
    print("   Status overlay at top-left corner")
    print()
    
    try:
        test_video_feed()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
