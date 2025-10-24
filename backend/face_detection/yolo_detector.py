# AutomatedPersonSearch/backend/face_detection/yolo_detector.py
import cv2
import torch
from ultralytics import YOLO # Import the modern YOLO wrapper
from ..config import YOLO_WEIGHTS_PATH, YOLO_CONFIDENCE_THRESHOLD

class YOLOFaceDetector:
    def __init__(self):
        # Determine the device (GPU if available, otherwise CPU)
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        # 1. Load the Model
        # YOLOv5s-face.pt is a custom weight file trained for face detection.
        try:
            self.model = YOLO(str(YOLO_WEIGHTS_PATH))
            print(f"YOLOv5s-Face model loaded on {self.device}.")
        except Exception as e:
            print(f"ERROR: Failed to load YOLO model from {YOLO_WEIGHTS_PATH}. Check file path and integrity.")
            self.model = None

    def detect_faces(self, frame):
        """
        Runs YOLOv5s inference on a single video frame.
        
        Args:
            frame (numpy.ndarray): The current video frame (BGR format).
        
        Returns:
            list: A list of dictionaries, each containing bbox, confidence, and the cropped image.
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

# The instance of this class is initialized in video_utils.py.