"""
Prétraitement des images pour LayoutLMv3.
"""

import torch
from PIL import Image
from typing import Dict, Union
from io import BytesIO
import os


def preprocess_document_image(
    image: Union[str, bytes, Image.Image],
    processor,
    device: str,
    max_length: int = 512
) -> Dict[str, torch.Tensor]:
    """
    Prépare une image de document pour LayoutLMv3.

    Args:
        image: chemin vers l'image, bytes ou objet PIL Image
        processor: AutoProcessor LayoutLMv3
        device: device (cuda/cpu)
        max_length: taille max du token input

    Returns:
        Dict[str, torch.Tensor]: inputs formatés pour le modèle LayoutLMv3
    """

    # Charger l'image selon le type d'entrée
    if isinstance(image, str):
        if os.path.exists(image):
            pil_image = Image.open(image).convert("RGB")
        else:
            raise FileNotFoundError(f"Image non trouvée: {image}")
    elif isinstance(image, bytes):
        pil_image = Image.open(BytesIO(image)).convert("RGB")
    elif isinstance(image, Image.Image):
        pil_image = image.convert("RGB")
    else:
        raise ValueError(f"Type d'image non supporté: {type(image)}")

    # Encoder avec le processor
    encoding = processor(
        pil_image,
        truncation=True,
        padding="max_length",
        max_length=max_length,
        return_tensors="pt"
    )

    return {k: v.to(device) for k, v in encoding.items()}


def preprocess_document_text(
    text: str,
    tokenizer,
    device: str,
    max_length: int = 512
) -> Dict[str, torch.Tensor]:
    """
    Prépare le texte extrait pour LayoutLMv3 (sans image).

    Args:
        text: texte brut extrait du document
        tokenizer: tokenizer LayoutLMv3
        device: device (cuda/cpu)
        max_length: taille max du token input

    Returns:
        Dict[str, torch.Tensor]: inputs formatés pour le modèle LayoutLMv3
    """

    encoding = tokenizer(
        text,
        truncation=True,
        padding="max_length",
        max_length=max_length,
        return_tensors="pt"
    )

    return {k: v.to(device) for k, v in encoding.items()}
