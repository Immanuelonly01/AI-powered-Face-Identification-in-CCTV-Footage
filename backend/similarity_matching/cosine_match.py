# AutomatedPersonSearch/backend/similarity_matching/cosine_match.py
from sklearn.metrics.pairwise import cosine_similarity
from ..config import COSINE_SIMILARITY_THRESHOLD
import numpy as np

def calculate_cosine_similarity(embed1, embed2):
    """Calculates cosine similarity between two L2-normalized embeddings."""
    # Check for empty or zero vectors
    if embed1.ndim == 1:
        embed1 = embed1.reshape(1, -1)
    if embed2.ndim == 1:
        embed2 = embed2.reshape(1, -1)

    # Ensure embeddings are non-empty
    if embed1.shape[1] == 0 or embed2.shape[1] == 0:
        return 0.0

    similarity = cosine_similarity(embed1, embed2)[0][0]
    return similarity

def check_match(similarity):
    """Checks if the similarity score meets the project's required threshold."""
    is_match = similarity >= COSINE_SIMILARITY_THRESHOLD
    return is_match