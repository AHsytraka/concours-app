"""
Modèles Pydantic pour les réponses de classification.
"""

from pydantic import BaseModel, Field
from typing import Dict, Any, List


class LayoutLMv3Prediction(BaseModel):
    """Classe représentant une prédiction d'un modèle LayoutLMv3."""
    
    label: str = Field(..., description="Classe prédite")
    confidence: float = Field(..., description="Score de confiance entre 0 et 1")


class ClassifiedDocument(BaseModel):
    """Modèle de réponse pour la classification de documents."""
    
    filename: str = Field(..., description="Nom original du fichier")
    predicted_class: str = Field(..., description="Classe prédite")
    confidence: float = Field(..., description="Score entre 0 et 1")
    raw_text: str = Field(..., description="Texte extrait utilisé pour la classification")
    metadata: Dict[str, Any] = Field(default={}, description="Métadonnées du document")
    errors: List[Dict[str, Any]] = Field(default=[], description="Erreurs éventuelles")

    model_config = {
        "json_schema_extra": {
            "example": {
                "filename": "document.png",
                "predicted_class": "arrete",
                "confidence": 0.92,
                "raw_text": "",
                "metadata": {
                    "probabilities": {"arrete": 0.92, "relever": 0.08},
                    "file_size": 150000,
                    "file_type": ".png"
                },
                "errors": []
            }
        }
    }
