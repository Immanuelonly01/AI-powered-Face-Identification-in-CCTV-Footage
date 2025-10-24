# AutomatedPersonSearch/backend/video_processing/video_utils.py
import cv2
import time
import os
from ..face_detection.yolo_detector import YOLOFaceDetector
from ..face_embedding.arcface_embed import ArcFaceEmbedder
from ..similarity_matching.cosine_match import calculate_cosine_similarity, check_match
from ..database_module import log_detection
from ..config import CROPS_FOLDER

# Initialize models globally (once)
detector = YOLOFaceDetector()
embedder = ArcFaceEmbedder()

def get_reference_embedding(ref_image_path):
    """Loads reference image, detects face, and generates its embedding."""
    ref_img = cv2.imread(ref_image_path)
    if ref_img is None:
        raise FileNotFoundError("Reference image could not be loaded.")
        
    # Detect face in reference image (essential for proper alignment/cropping)
    detections = detector.detect_faces(ref_img)
    if not detections:
        raise ValueError("No face detected in the reference image. Please use a clear face image.")
        
    # Use the highest confidence detection
    best_det = max(detections, key=lambda x: x['confidence'])
    ref_face_crop = best_det['cropped_img'] 
    
    return embedder.generate_embedding(ref_face_crop)

def process_video_and_search(video_path, ref_embedding, video_filename):
    """Processes video frame-by-frame for person search."""
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise IOError(f"Cannot open video file: {video_path}")

    frame_count = 0
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    match_results = []
    
    # Unique identifier for the current video session's crops
    session_id = f"{video_filename.split('.')[0]}_{int(time.time())}"
    current_crops_dir = CROPS_FOLDER / session_id
    os.makedirs(current_crops_dir, exist_ok=True)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        current_time_sec = frame_count / fps
        
        # 1. Detect Faces
        detections = detector.detect_faces(frame)

        for det in detections:
            # 2. Generate Embedding
            det_embedding = embedder.generate_embedding(det['cropped_img'])
            
            # 3. Match Embeddings
            similarity = calculate_cosine_similarity(ref_embedding, det_embedding)
            
            if check_match(similarity):
                # 4. Log and Save Match
                crop_filename = f"frame_{frame_count}_sim_{similarity:.4f}.jpg"
                # Use a forward slash path for URL access consistency
                crop_relative_path = os.path.join("static/crops", session_id, crop_filename).replace(os.path.sep, '/') 
                crop_full_path = current_crops_dir / crop_filename
                
                cv2.imwrite(str(crop_full_path), det['cropped_img'])

                # Log to DB
                log_data = {
                    'video_filename': video_filename,
                    'frame_number': frame_count,
                    'timestamp': current_time_sec,
                    'similarity': similarity,
                    'image_path': crop_relative_path
                }
                log_entry = log_detection(log_data)
                
                # Format result for API response (Frontend)
                match_results.append({
                    'id': log_entry.id,
                    'frame_number': log_entry.frame_number,
                    'timestamp': f"{log_entry.timestamp:.2f} s",
                    'similarity': f"{log_entry.similarity:.4f}",
                    'image_url': f"/{log_entry.image_path}" # URL starts from Flask's root/static
                })

        frame_count += 1
    
    cap.release()
    return match_results