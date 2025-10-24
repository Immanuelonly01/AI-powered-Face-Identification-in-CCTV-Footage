# AutomatedPersonSearch/backend/config.py
import os
from pathlib import Path

# --- BASE DIRECTORY ---
BASE_DIR = Path(__file__).resolve().parent

# --- FOLDER PATHS ---
UPLOAD_FOLDER = BASE_DIR / "uploads"
CROPS_FOLDER = BASE_DIR / "static" / "crops"
MODELS_FOLDER = BASE_DIR / "models"
REPORTS_FOLDER = BASE_DIR / "reports" / "generated"

# Ensure directories exist
for folder in [UPLOAD_FOLDER, CROPS_FOLDER, REPORTS_FOLDER]:
    os.makedirs(folder, exist_ok=True)

# --- MODEL PATHS (Ensure these files are downloaded to the 'models' directory) ---
YOLO_WEIGHTS_PATH = MODELS_FOLDER / "yolov5s-face.pt"
ARCFACE_WEIGHTS_PATH = MODELS_FOLDER / "arcface_mobilefacenet.pth"

# --- DEEP LEARNING THRESHOLDS ---
# Cosine Similarity: Range [-1.0, 1.0]. Tune this based on your ArcFace model's performance.
COSINE_SIMILARITY_THRESHOLD = 0.65 
# YOLO Confidence: Minimum score for a detection box to be considered a face/person.
YOLO_CONFIDENCE_THRESHOLD = 0.50

# --- DATABASE CONFIG ---
DATABASE_URL = f"sqlite:///{BASE_DIR / 'instance.db'}" 

# --- FLASK CONFIG ---
FLASK_SECRET_KEY = os.environ.get('FLASK_SECRET_KEY', 'a_secure_default_key')