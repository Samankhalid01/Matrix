#!/usr/bin/env python3
"""
Advanced model loading script with TensorFlow compatibility fixes
Attempts multiple strategies to load best_model.h5
"""

import sys
import os
import warnings

# Suppress warnings
warnings.filterwarnings('ignore')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

print("🔧 Advanced Model Loading Test")
print("=" * 50)

try:
    import tensorflow as tf
    print(f"✅ TensorFlow {tf.__version__} imported")
    
    # Set compatibility mode for older models
    tf.config.run_functions_eagerly(True)
    
    from tensorflow import keras
    import numpy as np
    
    model_path = "models/best_model.h5"
    
    print(f"📁 Attempting to load: {model_path}")
    
    # Strategy 1: Direct load with compile=False
    print("\n🎯 Strategy 1: Load with compile=False")
    try:
        model = keras.models.load_model(model_path, compile=False)
        print("✅ Model loaded successfully!")
        
        # Recompile with current TensorFlow
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        print("✅ Model recompiled successfully!")
        
        # Test the model
        test_input = np.random.random((1, 224, 224, 3))
        prediction = model.predict(test_input, verbose=0)
        print(f"✅ Test prediction: {prediction[0][0]:.6f}")
        
        # Save working model
        model.save("models/working_model.h5")
        print("✅ Saved as working_model.h5")
        
        print("🎉 SUCCESS: Original model loaded and working!")
        sys.exit(0)
        
    except Exception as e:
        print(f"❌ Strategy 1 failed: {e}")
    
    # Strategy 2: Load weights only
    print("\n🎯 Strategy 2: Load weights into new architecture")
    try:
        # Create a simple CNN architecture
        model = keras.Sequential([
            keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
            keras.layers.MaxPooling2D((2, 2)),
            keras.layers.Conv2D(64, (3, 3), activation='relu'),
            keras.layers.MaxPooling2D((2, 2)),
            keras.layers.Conv2D(128, (3, 3), activation='relu'),
            keras.layers.MaxPooling2D((2, 2)),
            keras.layers.GlobalAveragePooling2D(),
            keras.layers.Dense(256, activation='relu'),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(64, activation='relu'),
            keras.layers.Dense(1, activation='sigmoid')
        ])
        
        # Try to load weights
        model.load_weights(model_path)
        print("✅ Weights loaded successfully!")
        
        # Compile
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        
        # Test
        test_input = np.random.random((1, 224, 224, 3))
        prediction = model.predict(test_input, verbose=0)
        print(f"✅ Test prediction: {prediction[0][0]:.6f}")
        
        print("🎉 SUCCESS: Model weights loaded!")
        sys.exit(0)
        
    except Exception as e:
        print(f"❌ Strategy 2 failed: {e}")
    
    # Strategy 3: Custom objects
    print("\n🎯 Strategy 3: Load with custom objects")
    try:
        # Define custom objects for compatibility
        def custom_relu(x):
            return tf.nn.relu(x)
            
        def custom_sigmoid(x):
            return tf.nn.sigmoid(x)
        
        custom_objects = {
            'relu': custom_relu,
            'sigmoid': custom_sigmoid
        }
        
        model = keras.models.load_model(model_path, custom_objects=custom_objects, compile=False)
        print("✅ Model loaded with custom objects!")
        
        # Recompile
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        
        # Test
        test_input = np.random.random((1, 224, 224, 3))
        prediction = model.predict(test_input, verbose=0)
        print(f"✅ Test prediction: {prediction[0][0]:.6f}")
        
        print("🎉 SUCCESS: Custom objects approach worked!")
        sys.exit(0)
        
    except Exception as e:
        print(f"❌ Strategy 3 failed: {e}")
    
    # Strategy 4: TensorFlow 1.x compatibility
    print("\n🎯 Strategy 4: TensorFlow 1.x compatibility mode")
    try:
        import tensorflow.compat.v1 as tf1
        tf1.disable_v2_behavior()
        
        # Try loading in v1 mode
        with tf1.Session() as sess:
            model = keras.models.load_model(model_path, compile=False)
            print("✅ Model loaded in TF1 compatibility mode!")
        
        print("🎉 SUCCESS: TF1 compatibility worked!")
        sys.exit(0)
        
    except Exception as e:
        print(f"❌ Strategy 4 failed: {e}")
    
    print("\n❌ All strategies failed. The model may need to be retrained with current TensorFlow version.")
    
except Exception as e:
    print(f"❌ Fatal error: {e}")
    sys.exit(1)