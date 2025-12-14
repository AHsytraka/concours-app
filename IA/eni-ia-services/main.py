"""
ENI IA Services - API Unifiée
===============================

API FastAPI unifiant les services IA de l'ENI:
- Classification de Documents (LayoutLMv3)
- Délibération Intelligente de Concours
- Sélection de Dossiers

Chaque module fonctionne indépendamment mais partage la même base applicative.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

# Import des routers
from app.classification.routes import router as classification_router
from app.deliberation.routes import router as deliberation_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestion du cycle de vie de l'application.
    Charge les modèles au démarrage.
    """
    print("[INFO] Initialisation des services ENI IA...")
    
    # Chargement du modèle de classification
    try:
        from app.classification.model import layoutlmv3_instance
        print(f"[INFO] Modèle LayoutLMv3 chargé sur: {layoutlmv3_instance.get_device()}")
        print(f"[INFO] Labels de classification: {layoutlmv3_instance.get_labels()}")
    except Exception as e:
        print(f"[WARN] Modèle de classification non disponible: {e}")
    
    # Initialisation des services de délibération
    print("[INFO] Services de délibération initialisés")
    
    yield
    print("[INFO] Fermeture des services ENI IA...")


# Création de l'application FastAPI
app = FastAPI(
    title="ENI IA Services",
    description="""
    ## API Unifiée des Services IA de l'ENI
    
    Cette API regroupe plusieurs services intelligents:
    
    ### 🔍 Classification de Documents (`/api/v1/classification/`)
    - Classification automatique de documents administratifs
    - Types supportés: Arrêtés, Relevés de notes
    - Utilise LayoutLMv3 pour l'analyse visuelle
    
    ### 📊 Délibération de Concours (`/api/v1/deliberation/concours/`)
    - Saisie des notes de candidats
    - Calcul automatique des moyennes
    - Délibération intelligente selon les critères définis
    - Génération de la liste des admis
    
    ### 📁 Sélection de Dossiers (`/api/v1/deliberation/selection/`)
    - Analyse intelligente des relevés de notes
    - Évaluation selon critères personnalisables
    - Détermination d'admissibilité avec explications
    
    ---
    
    Chaque module fonctionne indépendamment et peut être utilisé séparément.
    """,
    version="1.0.0",
    lifespan=lifespan
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enregistrement des routes
app.include_router(classification_router, prefix="/api/v1/classification", tags=["Classification"])
app.include_router(deliberation_router, prefix="/api/v1/deliberation", tags=["Délibération"])


@app.get("/")
async def root():
    """
    Endpoint racine - Informations sur l'API ENI IA Services.
    """
    return {
        "message": "ENI IA Services - API Unifiée",
        "version": "1.0.0",
        "docs": "/docs",
        "services": {
            "classification": {
                "description": "Classification de documents (arrete/relever)",
                "endpoints": {
                    "classify": "/api/v1/classification/classify/",
                    "batch": "/api/v1/classification/classify/batch",
                    "labels": "/api/v1/classification/labels"
                }
            },
            "deliberation": {
                "description": "Délibération intelligente de concours",
                "endpoints": {
                    "deliberation": "/api/v1/deliberation/concours/deliberation",
                    "saisie_notes": "/api/v1/deliberation/concours/saisie-notes"
                }
            },
            "selection": {
                "description": "Sélection de dossiers",
                "endpoints": {
                    "analyser": "/api/v1/deliberation/selection/analyser",
                    "evaluer_un": "/api/v1/deliberation/selection/evaluer-un"
                }
            }
        }
    }


@app.get("/health")
async def health_check():
    """
    Vérification de l'état de tous les services.
    """
    status = {
        "status": "healthy",
        "services": {}
    }
    
    # Vérification du modèle de classification
    try:
        from app.classification.model import layoutlmv3_instance
        model_loaded = layoutlmv3_instance.get_model() is not None
        status["services"]["classification"] = {
            "status": "healthy" if model_loaded else "degraded",
            "model_loaded": model_loaded,
            "device": layoutlmv3_instance.get_device() if model_loaded else None
        }
    except Exception as e:
        status["services"]["classification"] = {
            "status": "unavailable",
            "error": str(e)
        }
    
    # Service de délibération (toujours disponible)
    status["services"]["deliberation"] = {"status": "healthy"}
    status["services"]["selection"] = {"status": "healthy"}
    
    return status


@app.get("/model/info")
async def model_info():
    """
    Informations sur les modèles chargés.
    """
    info = {}
    
    try:
        from app.classification.model import layoutlmv3_instance
        model = layoutlmv3_instance.get_model()
        if model:
            info["classification"] = {
                "model_name": "LayoutLMv3",
                "num_labels": layoutlmv3_instance.num_labels,
                "labels": layoutlmv3_instance.get_labels(),
                "device": layoutlmv3_instance.get_device(),
                "parameters": sum(p.numel() for p in model.parameters()),
                "trainable_parameters": sum(p.numel() for p in model.parameters() if p.requires_grad)
            }
    except Exception as e:
        info["classification"] = {"error": str(e)}
    
    return info


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
