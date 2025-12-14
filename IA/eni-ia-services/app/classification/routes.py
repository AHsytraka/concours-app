"""
Routes API pour la classification de documents.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List

from .service import classify_document, classify_document_batch
from .schemas import ClassifiedDocument

router = APIRouter()


@router.post("/classify/", response_model=ClassifiedDocument)
async def classify(file: UploadFile = File(...)):
    """
    Classifie un document en utilisant LayoutLMv3.
    
    ## Catégories supportées:
    - **arrete**: Arrêtés administratifs
    - **relever**: Relevés de notes ou documents similaires
    
    ## Formats acceptés:
    - PNG, JPG, JPEG
    
    Returns:
        ClassifiedDocument avec la classe prédite et le score de confiance
    """
    try:
        result = await classify_document(file)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/classify/batch", response_model=List[ClassifiedDocument])
async def classify_batch(files: List[UploadFile] = File(...)):
    """
    Classifie plusieurs documents en batch.
    
    Args:
        files: Liste d'images de documents
        
    Returns:
        Liste de ClassifiedDocument
    """
    try:
        results = await classify_document_batch(files)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/labels")
async def get_labels():
    """
    Retourne les labels de classification disponibles.
    """
    return {
        "labels": ["arrete", "relever"],
        "descriptions": {
            "arrete": "Arrêtés administratifs (décisions officielles)",
            "relever": "Relevés de notes ou documents académiques"
        }
    }
