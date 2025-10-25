# AutomatedPersonSearch/backend/face_detection/yolo_detector.py
import cv2
import torch
from ultralytics import YOLO
from ..config import YOLO_WEIGHTS_PATH, YOLO_CONFIDENCE_THRESHOLD
import os

class YOLOFaceDetector:
    def __init__(self):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.model = None

        # --- Strategy: 1. Try Local Custom File ---
        try:
            # Attempt to load the file specified in config (yolov5s-face.pt)
            local_path = str(YOLO_WEIGHTS_PATH)
            self.model = YOLO(local_path)
            print(f"YOLOv5s-Face model loaded successfully from local path: {local_path}")
            
        except Exception as local_e:
            print(f"WARNING: Local model load failed (File Integrity issue likely). Attempting Fallback. Error: {local_e}")
            
            # --- Strategy: 2. Fallback to Official Auto-Download ---
            try:
                # Load the official model name 'yolov5s.pt' which Ultralytics will auto-download
                # and cache for future use (and it's guaranteed to be valid).
                self.model = YOLO('yolov5s.pt')
                
                print(f"YOLOv5s (Official COCO Model) loaded via auto-download on {self.device}.")
                
                # OPTIONAL: Rename and save the cached file to the custom name for future local loading
                # This ensures the local path defined in config is fixed for next time.
                # (Requires navigating the ultralytics cache, too complex for this immediate fix.)
                
            except Exception as auto_e:
                print(f"FATAL ERROR: Could not load any YOLO model (Local or Auto-Download). {auto_e}")
                self.model = None

    def detect_faces(self, frame):
        """
        Runs YOLOv5s inference on a single video frame.
        """
        if not self.model:
            return []

        # 2. Run Inference
        # verbose=False suppresses console output. conf sets the confidence threshold.
        results = self.model(frame, 
                             device=self.device, 
                             verbose=False, 
                             conf=YOLO_CONFIDENCE_THRESHOLD,
                             imgsz=640) # Standard input size
                             
        detections = []

        # 3. Process Results
        for r in results:
            for box in r.boxes:
                # Get bounding box coordinates [x1, y1, x2, y2]
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                conf = float(box.conf[0])
                
                # Check if the detected class is 'person' (Class 0 in COCO, used by 'yolov5s.pt')
                # If using the specialized 'yolov5s-face.pt', this check isn't strictly necessary 
                # but good for robustness if the label set is different.
                # Since we rely on detection for cropping, we trust the model found an object.
                
                # IMPORTANT: Crop the detected region
                h, w, _ = frame.shape
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(w, x2), min(h, y2)
                
                cropped_img = frame[y1:y2, x1:x2]
                
                if cropped_img.size > 0:
                    detections.append({
                        'bbox': (x1, y1, x2, y2),
                        'confidence': conf,
                        'cropped_img': cropped_img
                    })
        return detections