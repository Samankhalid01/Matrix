# Model Integration Examples

## 1. Data Preparation Integration

Your `data_preparation.ipynb` notebook should handle:
- Loading and preprocessing video frames
- Extracting features from surveillance footage
- Labeling theft/no-theft scenarios
- Preparing training/validation datasets

Example preprocessing pipeline:
```python
import cv2
import numpy as np
from tensorflow.keras.preprocessing.image import ImageDataGenerator

def preprocess_frame(frame):
    # Resize to model input size
    frame = cv2.resize(frame, (224, 224))
    
    # Normalize pixel values
    frame = frame.astype(np.float32) / 255.0
    
    # Add batch dimension
    return np.expand_dims(frame, axis=0)

def extract_frames_from_video(video_path, frame_interval=30):
    cap = cv2.VideoCapture(video_path)
    frames = []
    frame_count = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_count % frame_interval == 0:
            processed_frame = preprocess_frame(frame)
            frames.append(processed_frame)
            
        frame_count += 1
    
    cap.release()
    return np.vstack(frames)
```

## 2. Model Training Integration

Your `shoplifting_detection_model.ipynb` should include:
- Model architecture definition
- Training loop with validation
- Model evaluation and metrics
- Model saving as .h5 format

Example model architecture:
```python
import tensorflow as tf
from tensorflow.keras import layers, models

def create_theft_detection_model(input_shape=(224, 224, 3)):
    model = models.Sequential([
        layers.Conv2D(32, (3, 3), activation='relu', input_shape=input_shape),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.Flatten(),
        layers.Dense(64, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(1, activation='sigmoid')  # Binary classification
    ])
    
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    return model

# Train the model
model = create_theft_detection_model()
history = model.fit(
    train_dataset,
    epochs=50,
    validation_data=validation_dataset,
    callbacks=[
        tf.keras.callbacks.EarlyStopping(patience=5),
        tf.keras.callbacks.ModelCheckpoint('best_model.h5', save_best_only=True)
    ]
)
```

## 3. Integration with Flask API

The Flask app (`app.py`) expects your model to:
- Accept input shape (224, 224, 3) - adjust as needed
- Return confidence scores between 0-1
- Handle single frame predictions

To customize for your specific model:

1. **Update input preprocessing** in `process_video_frames()`:
```python
# Adjust input size to match your model
img = cv2.resize(frame, (YOUR_INPUT_WIDTH, YOUR_INPUT_HEIGHT))

# Adjust preprocessing based on your training
img = img.astype(np.float32) / 255.0  # or your normalization method
```

2. **Update prediction parsing**:
```python
# Adjust based on your model output
predictions = model.predict(img, verbose=0)
confidence = float(predictions[0][0])  # Adjust indexing as needed
```

3. **Add custom thresholds**:
```python
# Adjust confidence threshold
if confidence > YOUR_THRESHOLD:  # e.g., 0.7 instead of 0.5
    # Record detection
```

## 4. Model Output Formats

**Binary Classification:**
- Output: Single value [0.0 to 1.0]
- Usage: `confidence = predictions[0][0]`

**Object Detection (if using detection model):**
- Output: [x, y, width, height, confidence, class]
- Usage: Parse bounding boxes and confidences

**Multi-class Classification:**
- Output: [confidence_class_0, confidence_class_1, ...]
- Usage: `confidence = np.max(predictions[0])`

## 5. Testing Your Integration

1. Place your trained `best_model.h5` in `/models/` directory
2. Add test video `demo1.mp4` to `/videos/` directory
3. Run the Flask service: `python app.py`
4. Test with the demo endpoint to verify model loading and inference

The system will automatically adapt to your model's specific architecture once you provide the trained `.h5` file.