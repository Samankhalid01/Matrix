#!/usr/bin/env python3
"""
Simple model loading fix for batch_shape compatibility issue
"""
import tensorflow as tf
import h5py
import json
import tempfile
import shutil
import os

def fix_and_load_model(model_path):
    """Fix batch_shape issue and load model"""
    try:
        print("🔧 Attempting to fix batch_shape compatibility issue...")
        
        # Create a temporary copy of the model file
        temp_path = model_path + '.temp'
        shutil.copy2(model_path, temp_path)
        
        # Read and modify the model configuration
        with h5py.File(temp_path, 'r+') as f:
            if 'model_config' in f.attrs:
                # Get the model config
                config_str = f.attrs['model_config']
                if isinstance(config_str, bytes):
                    config_str = config_str.decode('utf-8')
                
                config = json.loads(config_str)
                
                # Fix batch_shape to input_shape in the config
                modified = False
                if 'config' in config and 'layers' in config['config']:
                    for layer in config['config']['layers']:
                        if 'config' in layer and 'batch_shape' in layer['config']:
                            batch_shape = layer['config'].pop('batch_shape')
                            if batch_shape and len(batch_shape) > 1:
                                layer['config']['input_shape'] = batch_shape[1:]
                                print(f"🔧 Fixed layer {layer.get('name', 'unknown')}: converted batch_shape to input_shape")
                                modified = True
                
                if modified:
                    # Write the corrected config back
                    corrected_config = json.dumps(config).encode('utf-8')
                    del f.attrs['model_config']
                    f.attrs['model_config'] = corrected_config
                    print("✅ Model config corrected!")
        
        # Try to load the corrected model
        model = tf.keras.models.load_model(temp_path)
        
        # Clean up temp file
        os.remove(temp_path)
        
        return model
        
    except Exception as e:
        # Clean up temp file if it exists
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise e

if __name__ == "__main__":
    try:
        model = fix_and_load_model('models/best_model.h5')
        print("✅ Model loaded successfully!")
        print(f"📊 Input shape: {model.input_shape}")
        print(f"📈 Output shape: {model.output_shape}")
        
        # Save the fixed model
        model.save('models/best_model_fixed.h5')
        print("💾 Fixed model saved as best_model_fixed.h5")
        
    except Exception as e:
        print(f"❌ Error: {e}")