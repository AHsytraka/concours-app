"""
Module de prédiction pour la classification de documents.
"""

import torch
import torch.nn.functional as F
from PIL import Image
from typing import Dict, Union
from io import BytesIO

from .model import layoutlmv3_instance
from .preprocess import preprocess_document_image


def predict_document(image: Union[str, bytes, Image.Image]) -> Dict[str, Union[str, float, Dict]]:
    """
    Effectue une prédiction LayoutLMv3 sur une image de document.

    Args:
        image: chemin vers l'image, bytes ou objet PIL Image

    Returns:
        Dict contenant:
            - label: classe prédite (arrete/relever)
            - confidence: score de confiance
            - probabilities: dict des probabilités par classe
    """

    model = layoutlmv3_instance.get_model()
    processor = layoutlmv3_instance.get_processor()
    device = layoutlmv3_instance.get_device()
    id2label = layoutlmv3_instance.get_labels()

    # Prétraitement de l'image
    inputs = preprocess_document_image(image, processor, device)

    # Prédiction
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits

        probs = F.softmax(logits, dim=1)[0]
        confidence, predicted_class = torch.max(probs, dim=0)

    # Construire le dict des probabilités
    probabilities = {
        id2label[i]: float(probs[i]) for i in range(len(id2label))
    }

    return {
        "label": id2label[int(predicted_class)],
        "confidence": float(confidence),
        "probabilities": probabilities
    }


def predict_from_bytes(file_bytes: bytes) -> Dict[str, Union[str, float, Dict]]:
    """
    Prédiction à partir de bytes bruts (pour l'API).

    Args:
        file_bytes: contenu du fichier en bytes

    Returns:
        Dict avec label, confidence et probabilities
    """
    return predict_document(file_bytes)


def predict_from_path(image_path: str) -> Dict[str, Union[str, float, Dict]]:
    """
    Prédiction à partir d'un chemin de fichier.

    Args:
        image_path: chemin vers l'image

    Returns:
        Dict avec label, confidence et probabilities
    """
    return predict_document(image_path)
