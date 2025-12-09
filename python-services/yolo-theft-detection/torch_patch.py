"""
Fix for PyTorch 2.6+ model loading issue
Monkey-patches ultralytics to use weights_only=False
"""
import torch

# Save original torch.load
_original_torch_load = torch.load

def patched_torch_load(*args, **kwargs):
    """Patched torch.load that sets weights_only=False for YOLO models"""
    # Force weights_only=False for compatibility with YOLO models
    kwargs['weights_only'] = False
    return _original_torch_load(*args, **kwargs)

# Apply patch
torch.load = patched_torch_load

print("✅ PyTorch load patched: weights_only=False (YOLO models will load)")
