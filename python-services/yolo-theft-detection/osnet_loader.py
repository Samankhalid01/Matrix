# Minimal torchreid model loader without engine dependencies
import torch
import torch.nn as nn
import sys
import os

def load_osnet_model(device='cpu'):
    """Load OSNet model without importing torchreid engine (avoids tensorboard)"""
    try:
        # Direct import from torchreid models (skip __init__ that loads engine)
        import importlib.util
        import site
        
        # Find torchreid package location
        for path in site.getsitepackages():
            osnet_path = os.path.join(path, 'torchreid', 'reid', 'models', 'osnet.py')
            if os.path.exists(osnet_path):
                # Load module directly
                spec = importlib.util.spec_from_file_location("osnet_module", osnet_path)
                osnet_module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(osnet_module)
                
                # Build model
                model = osnet_module.osnet_x0_25(num_classes=1000, pretrained=True)
                model = model.to(device).eval()
                print("✅ OSNet model loaded successfully")
                return model
        
        raise FileNotFoundError("Could not find torchreid osnet model")
        
    except Exception as e:
        print(f"❌ Error loading OSNet: {e}")
        print("⚠️ Using simple ReID fallback")
        # Return a simple dummy model if torchreid fails
        return None
