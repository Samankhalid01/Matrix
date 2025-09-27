#!/usr/bin/env python3
"""
Fixed model loading script that handles the batch_shape compatibility issue.
"""

import tensorflow as tf
import h5py
import json

def load_model_with_fix(model_path):
    """Load model with batch_shape fix"""
    print(f"Attempting to load model from: {model_path}")
    
    try:
        # First, try the standard loading
        model = tf.keras.models.load_model(model_path)
        print("✅ Model loaded successfully with standard method!")
        return model
        
    except TypeError as e:
        if "batch_shape" in str(e):
            print(f"❌ batch_shape error detected: {e}")
            print("🔧 Attempting compatibility fix...")
            
            # Try loading with custom objects
            try:
                model = tf.keras.models.load_model(
                    model_path, 
                    custom_objects=None, 
                    compile=False
                )
                print("✅ Model loaded with compile=False!")
                
                # Recompile the model
                model.compile(
                    optimizer='adam',
                    loss='binary_crossentropy',
                    metrics=['accuracy']
                )
                print("✅ Model recompiled successfully!")
                return model
                
            except Exception as e2:
                print(f"❌ Compatibility fix failed: {e2}")
                
                # Try loading architecture and weights separately
                try:
                    print("🔧 Attempting to load architecture and weights separately...")
                    
                    # Load the HDF5 file directly
                    with h5py.File(model_path, 'r') as f:
                        if 'model_config' in f.attrs:
                            model_config_raw = f.attrs['model_config']
                            if isinstance(model_config_raw, bytes):
                                model_config = json.loads(model_config_raw.decode('utf-8'))
                            else:
                                model_config = json.loads(model_config_raw)
                            print("📋 Model config loaded")
                            
                            # Fix batch_shape to input_shape in config
                            def fix_batch_shape(config):
                                if isinstance(config, dict):
                                    if 'batch_shape' in config and 'input_shape' not in config:
                                        batch_shape = config.pop('batch_shape')
                                        if batch_shape and len(batch_shape) > 1:
                                            config['input_shape'] = batch_shape[1:]
                                            print(f"🔧 Fixed batch_shape {batch_shape} to input_shape {batch_shape[1:]}")
                                    
                                    for key, value in config.items():
                                        if isinstance(value, dict):
                                            fix_batch_shape(value)
                                        elif isinstance(value, list):
                                            for item in value:
                                                if isinstance(item, dict):
                                                    fix_batch_shape(item)
                                
                                return config
                            
                            fixed_config = fix_batch_shape(model_config)
                            
                            # Create model from fixed config
                            model = tf.keras.models.model_from_json(json.dumps(fixed_config))
                            print("✅ Model architecture created from fixed config")
                            
                            # Load weights
                            model.load_weights(model_path)
                            print("✅ Model weights loaded successfully!")
                            
                            # Compile the model
                            model.compile(
                                optimizer='adam',
                                loss='binary_crossentropy',
                                metrics=['accuracy']
                            )
                            print("✅ Model compiled successfully!")
                            return model
                        else:
                            print("❌ No model config found in HDF5 file")
                            return None
                            
                except Exception as e3:
                    print(f"❌ Separate loading failed: {e3}")
                    return None
        else:
            print(f"❌ Unknown loading error: {e}")
            return None

if __name__ == "__main__":
    model_path = "models/best_model.h5"
    model = load_model_with_fix(model_path)
    
    if model:
        print(f"✅ Final model loaded successfully!")
        print(f"📊 Model input shape: {model.input_shape}")
        print(f"📊 Model output shape: {model.output_shape}")
        print(f"🔢 Total parameters: {model.count_params():,}")
        
        # Test prediction on a dummy input
        import numpy as np
        dummy_input = np.random.random((1, 224, 224, 3)).astype(np.float32)
        prediction = model.predict(dummy_input)
        print(f"🎯 Test prediction: {prediction[0][0]:.4f}")
    else:
        print("❌ Failed to load model with any method")