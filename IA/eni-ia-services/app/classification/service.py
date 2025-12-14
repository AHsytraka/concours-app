"""
Service de classification de documents.
"""

from fastapi import UploadFile
from .predict import predict_from_bytes
from .schemas import ClassifiedDocument
import os


# Extensions de fichiers supportées
SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".pdf"}


async def classify_document(file: UploadFile) -> ClassifiedDocument:
    """
    Pipeline de classification de document:
    - Validation du fichier
    - Classification LayoutLMv3 (arrete/relever)
    
    Args:
        file: fichier uploadé (image)
        
    Returns:
        ClassifiedDocument avec la prédiction
    """
    
    # Validation de l'extension
    filename = file.filename or "unknown"
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in SUPPORTED_EXTENSIONS:
        return ClassifiedDocument(
            filename=filename,
            predicted_class="unknown",
            confidence=0.0,
            raw_text="",
            metadata={"error": f"Extension non supportée: {ext}"},
            errors=[{"type": "validation", "message": f"Extensions supportées: {SUPPORTED_EXTENSIONS}"}]
        )
    
    # Lecture du contenu
    content = await file.read()
    
    try:
        # Classification avec LayoutLMv3
        result = predict_from_bytes(content)
        
        return ClassifiedDocument(
            filename=filename,
            predicted_class=result["label"],
            confidence=result["confidence"],
            raw_text="",  # Pas d'extraction OCR pour l'instant
            metadata={
                "probabilities": result["probabilities"],
                "file_size": len(content),
                "file_type": ext
            },
            errors=[]
        )
        
    except Exception as e:
        return ClassifiedDocument(
            filename=filename,
            predicted_class="error",
            confidence=0.0,
            raw_text="",
            metadata={},
            errors=[{"type": "prediction", "message": str(e)}]
        )


async def classify_document_batch(files: list[UploadFile]) -> list[ClassifiedDocument]:
    """
    Classification de plusieurs documents en batch.
    
    Args:
        files: liste de fichiers uploadés
        
    Returns:
        Liste de ClassifiedDocument
    """
    results = []
    for file in files:
        result = await classify_document(file)
        results.append(result)
    return results
