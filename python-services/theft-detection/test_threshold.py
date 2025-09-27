import requests
import json

# Test with the new calibrated threshold (18%)
test_url = 'http://localhost:5000/process-surveillance-video'
test_data = {
    'video_path': 'videos/238c62ef-4290-43fe-8283-8e8f202c7f70_demo1.mp4',
    'camera_id': 'TEST_CAM_01'
}

try:
    response = requests.post(test_url, json=test_data)
    result = response.json()
    print('\n🎯 TESTING WITH 18% THRESHOLD:')
    print(f"Status: {result.get('status', 'Unknown')}")
    print(f"Total Detections: {result.get('total_detections', 0)}")
    print(f"Max Confidence: {result.get('max_confidence', 0):.3f}")
    print(f"Alert Triggered: {'YES' if result.get('alert_triggered', False) else 'NO'}")
    
    if result.get('detections'):
        print(f"\nDetection Details:")
        for i, det in enumerate(result['detections'][:3]):  # Show first 3
            print(f"  Frame {det['frame']}: {det['confidence']:.3f}")
            
except Exception as e:
    print(f'Error testing: {e}')