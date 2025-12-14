"""
Routes API pour la délibération de concours et la sélection de dossiers.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, List, Any

from .schemas import (
    ConcoursRequest, ConcoursResponse,
    SelectionDossierRequest, SelectionDossierResponse,
    DossierCandidat, CriteresSelection
)
from .concours_service import concours_service
from .selection_service import selection_service

router = APIRouter()


# ==================== CAS 1: CONCOURS ====================

@router.post("/concours/deliberation", response_model=ConcoursResponse, tags=["Concours"])
async def deliberer_concours(request: ConcoursRequest):
    """
    ## Cas 1: Délibération de Concours
    
    Traite la délibération d'un concours avec 1 ou plusieurs candidats.
    
    ### Processus:
    1. Reçoit les notes des candidats
    2. Calcule les moyennes pondérées
    3. Applique les critères de délibération intelligemment
    4. Retourne la liste des admis classés
    
    ### Exemple de requête:
    ```json
    {
        "candidats": [
            {
                "id": "C001",
                "nom": "Rakoto",
                "prenom": "Jean",
                "notes": [
                    {"matiere": "Mathématiques", "note": 15, "coefficient": 4},
                    {"matiere": "Physique", "note": 12, "coefficient": 3},
                    {"matiere": "Français", "note": 14, "coefficient": 2}
                ]
            }
        ],
        "criteres": {
            "moyenne_minimum": 10,
            "nombre_places": 50,
            "note_eliminatoire": 5,
            "criteres_specifiques": "Priorité aux candidats ayant plus de 12 en mathématiques"
        }
    }
    ```
    """
    try:
        result = concours_service.deliberer(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la délibération: {str(e)}")


@router.post("/concours/saisie-notes", tags=["Concours"])
async def saisir_notes(candidats: List[Dict[str, Any]]):
    """
    Endpoint simplifié pour saisir les notes de plusieurs candidats.
    
    ### Format d'entrée:
    ```json
    [
        {
            "id": "C001",
            "nom": "Rakoto",
            "prenom": "Jean",
            "notes": {
                "Mathématiques": 15,
                "Physique": 12
            }
        }
    ]
    ```
    
    Retourne les candidats formatés pour l'API de délibération.
    """
    try:
        candidats_formated = []
        for c in candidats:
            notes_list = []
            if isinstance(c.get("notes"), dict):
                for matiere, note in c["notes"].items():
                    notes_list.append({
                        "matiere": matiere,
                        "note": note,
                        "coefficient": 1.0
                    })
            elif isinstance(c.get("notes"), list):
                notes_list = c["notes"]
            
            candidats_formated.append({
                "id": c.get("id", ""),
                "nom": c.get("nom", ""),
                "prenom": c.get("prenom", ""),
                "notes": notes_list
            })
        
        return {
            "status": "success",
            "candidats_enregistres": len(candidats_formated),
            "candidats": candidats_formated,
            "next_step": "Utilisez POST /api/v1/deliberation/concours/deliberation avec ces données"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur de format: {str(e)}")


# ==================== CAS 2: SELECTION DE DOSSIER ====================

@router.post("/selection/analyser", response_model=SelectionDossierResponse, tags=["Sélection Dossier"])
async def analyser_dossiers(request: SelectionDossierRequest):
    """
    ## Cas 2: Sélection de Dossier
    
    Analyse intelligemment les dossiers selon les critères fournis.
    
    ### Processus:
    1. Reçoit les données des relevés de notes
    2. Analyse selon les critères (texte compris par l'IA)
    3. Détermine l'admissibilité avec explication
    
    ### Exemple de requête:
    ```json
    {
        "dossiers": [
            {
                "id": "D001",
                "nom": "Razafy",
                "prenom": "Marie",
                "notes": [
                    {"matiere": "Mathématiques", "note": 14},
                    {"matiere": "Informatique", "note": 16},
                    {"matiere": "Physique", "note": 12}
                ],
                "mention": "Bien",
                "etablissement": "Université Antananarivo"
            }
        ],
        "criteres": {
            "moyenne_minimum": 12,
            "criteres_texte": "Bonne maîtrise des mathématiques et de l'informatique, rigueur scientifique",
            "filiere_cible": "Master Informatique",
            "poids_matieres": {"Mathématiques": 2, "Informatique": 2, "Physique": 1}
        }
    }
    ```
    """
    try:
        result = selection_service.analyser_dossiers(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse: {str(e)}")


@router.post("/selection/evaluer-un", tags=["Sélection Dossier"])
async def evaluer_un_dossier(dossier: Dict[str, Any], criteres: Dict[str, Any]):
    """
    Évalue un seul dossier rapidement.
    
    ### Entrée simplifiée:
    ```json
    {
        "dossier": {
            "id": "D001",
            "nom": "Test",
            "prenom": "Candidat",
            "notes": [{"matiere": "Maths", "note": 14}]
        },
        "criteres": {
            "moyenne_minimum": 10,
            "criteres_texte": "Bon niveau en sciences"
        }
    }
    ```
    """
    try:
        dossier_obj = DossierCandidat(**dossier)
        criteres_obj = CriteresSelection(**criteres)
        
        request = SelectionDossierRequest(
            dossiers=[dossier_obj],
            criteres=criteres_obj
        )
        
        result = selection_service.analyser_dossiers(request)
        
        # Retourne directement l'analyse du dossier unique
        if result.dossiers_admissibles:
            return result.dossiers_admissibles[0]
        else:
            return result.dossiers_non_admissibles[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")
