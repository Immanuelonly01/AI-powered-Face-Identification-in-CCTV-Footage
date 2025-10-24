# AutomatedPersonSearch/backend/face_embedding/arcface_embed.py
import torch
import torch.nn as nn
from torchvision import transforms
import numpy as np
import cv2
from ..config import ARCFACE_WEIGHTS_PATH

# 🚨 UPDATED LINE: Import the real architecture class from the file you created
from .mobilefacenet_arch import MobileFaceNet 

# --------------------------------------------------------------------------------
# NOTE: The placeholder class 'MobileFaceNet' that was previously here has been 
# DELETED and replaced by the import from 'mobilefacenet_arch.py'. 
# Ensure you have deleted the old placeholder class definition in this file!
# --------------------------------------------------------------------------------

# --- FACE EMBEDDER CLASS ---
class ArcFaceEmbedder:
    def __init__(self):
        self.embedding_size = 512 # Standard ArcFace embedding size
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Initialize the model using the imported MobileFaceNet class
        self.model = MobileFaceNet(embedding_size=self.embedding_size).to(self.device)
        
        try:
            # Load weights. strict=False might be needed if the model head was customized
            self.model.load_state_dict(torch.load(ARCFACE_WEIGHTS_PATH, map_location=self.device), strict=False)
            print(f"ArcFace (MobileFaceNet) model loaded on {self.device} from: {ARCFACE_WEIGHTS_PATH}")
        except Exception as e:
            print(f"!! WARNING: Could not load ArcFace weights. Running with uninitialized model. Error: {e}")
            # If loading fails, the model uses default random weights, which will fail detection.

        self.model.eval() # Set model to evaluation mode (disables dropout, BN updates)

        # Standard face recognition transformation (112x112, normalization)
        self.transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize((112, 112)),
            transforms.ToTensor(),
            # Normalization parameters typically used for deep face recognition models
            transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
        ])

    def generate_embedding(self, cropped_img):
        """Generates a normalized 512D embedding vector for a face crop."""
        if cropped_img.size == 0:
            return np.zeros(self.embedding_size)
            
        # Convert OpenCV BGR to PyTorch/PIL RGB format
        img_rgb = cv2.cvtColor(cropped_img, cv2.COLOR_BGR2RGB)
        
        # Apply transformation to get the input tensor [1, 3, 112, 112]
        tensor = self.transform(img_rgb).unsqueeze(0).to(self.device)

        with torch.no_grad():
            # Pass the tensor through the model to get the embedding
            embedding = self.model(tensor).cpu().numpy().flatten()
            
        # L2-normalize the embedding vector (critical for accurate cosine similarity)
        norm = np.linalg.norm(embedding)
        return embedding / norm if norm != 0 else embedding