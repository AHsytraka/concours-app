"""
Modèles Pydantic pour la délibération et la sélection de dossiers.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum
from datetime import datetime


# ==================== ENUMS ====================

class DecisionEnum(str, Enum):
    ADMIS = "admis"
    REFUSE = "refuse"
    LISTE_ATTENTE = "liste_attente"


# ==================== CAS 1: CONCOURS ====================

class NoteConcours(BaseModel):
    """Une note d'épreuve de concours"""
    matiere: str = Field(description="Nom de la matière/épreuve")
    note: float = Field(ge=0, le=20, description="Note sur 20")
    coefficient: float = Field(default=1.0, ge=0, description="Coefficient de la matière")


class CandidatConcours(BaseModel):
    """Un candidat au concours avec ses notes"""
    id: str = Field(description="Identifiant unique du candidat")
    nom: str
    prenom: str
    notes: List[NoteConcours] = Field(description="Liste des notes aux épreuves")
    # Optionnels
    date_naissance: Optional[str] = None
    etablissement_origine: Optional[str] = None


class CriteresConcours(BaseModel):
    """Critères de délibération du concours (que l'IA doit comprendre)"""
    # Seuils
    note_eliminatoire: Optional[float] = Field(default=None, description="Note en dessous de laquelle le candidat est éliminé (ex: 5)")
    moyenne_minimum: float = Field(default=10.0, description="Moyenne minimum pour être admis")
    
    # Capacité d'accueil
    nombre_places: Optional[int] = Field(default=None, description="Nombre de places disponibles")
    
    # Critères spéciaux (texte libre que l'IA interprète)
    criteres_specifiques: Optional[str] = Field(
        default=None, 
        description="Critères spécifiques en langage naturel (ex: 'Priorité aux candidats ayant plus de 12 en maths')"
    )
    
    # Matières éliminatoires
    matieres_eliminatoires: Optional[List[str]] = Field(
        default=None,
        description="Matières où une note sous le seuil élimine le candidat"
    )


class ConcoursRequest(BaseModel):
    """Requête pour délibération de concours (1 ou plusieurs candidats)"""
    candidats: List[CandidatConcours] = Field(description="Liste des candidats (1 ou plusieurs)")
    criteres: CriteresConcours = Field(description="Critères de délibération")
    concours_id: Optional[str] = Field(default=None, description="Identifiant du concours")
    concours_nom: Optional[str] = Field(default=None, description="Nom du concours")


class ResultatCandidatConcours(BaseModel):
    """Résultat de délibération pour un candidat"""
    candidat_id: str
    nom: str
    prenom: str
    moyenne: float = Field(description="Moyenne calculée")
    rang: Optional[int] = Field(default=None, description="Rang dans le classement")
    decision: DecisionEnum
    admis: bool
    points_forts: List[str] = Field(default_factory=list)
    points_faibles: List[str] = Field(default_factory=list)
    explication: str = Field(description="Explication de la décision par l'IA")
    details_notes: Dict[str, float] = Field(description="Détail des notes par matière")


class ConcoursResponse(BaseModel):
    """Réponse de délibération de concours"""
    concours_id: Optional[str] = None
    total_candidats: int
    nombre_admis: int
    nombre_refuses: int
    nombre_liste_attente: int
    
    # Liste des admis (triée par rang)
    liste_admis: List[ResultatCandidatConcours]
    # Liste d'attente
    liste_attente: List[ResultatCandidatConcours]
    # Liste des refusés
    liste_refuses: List[ResultatCandidatConcours]
    
    # Statistiques
    moyenne_generale: float
    moyenne_admis: float
    note_dernier_admis: Optional[float] = None
    
    # Métadonnées
    timestamp: datetime
    criteres_appliques: Dict[str, Any]


# ==================== CAS 2: SELECTION DE DOSSIER ====================

class NoteReleve(BaseModel):
    """Une note du relevé de notes"""
    matiere: str
    note: float = Field(ge=0, le=20)
    coefficient: Optional[float] = 1.0
    annee: Optional[str] = None
    semestre: Optional[str] = None


class DossierCandidat(BaseModel):
    """Dossier d'un candidat pour sélection"""
    id: str = Field(description="Identifiant unique")
    nom: str
    prenom: str
    
    # Notes du relevé
    notes: List[NoteReleve] = Field(description="Notes du relevé")
    moyenne_generale: Optional[float] = Field(default=None, description="Moyenne si déjà calculée")
    
    # Informations complémentaires
    etablissement: Optional[str] = None
    filiere_origine: Optional[str] = None
    diplome: Optional[str] = None
    annee_obtention: Optional[int] = None
    mention: Optional[str] = None
    
    # Informations supplémentaires (optionnel)
    experience: Optional[str] = None
    motivation: Optional[str] = None


class CriteresSelection(BaseModel):
    """Critères de sélection de dossier (que l'IA doit comprendre)"""
    # Seuils de base
    moyenne_minimum: float = Field(default=10.0, description="Moyenne minimum requise")
    
    # Critères en langage naturel (l'IA interprète)
    criteres_texte: Optional[str] = Field(
        default=None,
        description="Critères en langage naturel (ex: 'Bonne maîtrise des mathématiques, rigueur scientifique')"
    )
    
    # Poids des matières (optionnel)
    poids_matieres: Optional[Dict[str, float]] = Field(
        default=None,
        description="Poids de chaque matière (ex: {'Mathématiques': 2, 'Physique': 1.5})"
    )
    
    # Filière cible
    filiere_cible: Optional[str] = Field(default=None, description="Filière demandée")
    
    # Nombre de places
    nombre_places: Optional[int] = None
    
    # Critères éliminatoires
    matieres_requises: Optional[List[str]] = Field(
        default=None,
        description="Matières obligatoires dans le relevé"
    )
    note_minimum_matiere: Optional[Dict[str, float]] = Field(
        default=None,
        description="Note minimum par matière (ex: {'Mathématiques': 10})"
    )


class SelectionDossierRequest(BaseModel):
    """Requête de sélection de dossier (1 ou plusieurs candidats)"""
    dossiers: List[DossierCandidat] = Field(description="Liste des dossiers (1 ou plusieurs)")
    criteres: CriteresSelection = Field(description="Critères de sélection")
    formation_id: Optional[str] = None
    formation_nom: Optional[str] = None


class AnalyseDossier(BaseModel):
    """Analyse IA d'un dossier"""
    candidat_id: str
    nom: str
    prenom: str
    
    # Résultat
    admissible: bool
    decision: DecisionEnum
    score_global: float = Field(ge=0, le=100, description="Score sur 100")
    
    # Moyenne
    moyenne_calculee: float
    moyenne_ponderee: Optional[float] = None
    
    # Analyse IA
    analyse_profil: str = Field(description="Analyse du profil par l'IA")
    points_forts: List[str]
    points_faibles: List[str]
    recommandation: str = Field(description="Recommandation de l'IA")
    
    # Adéquation avec la formation
    adequation_formation: Optional[float] = Field(default=None, ge=0, le=100, description="Score d'adéquation avec la formation")
    
    # Critères respectés/non respectés
    criteres_satisfaits: List[str]
    criteres_non_satisfaits: List[str]


class SelectionDossierResponse(BaseModel):
    """Réponse de sélection de dossiers"""
    formation_id: Optional[str] = None
    total_dossiers: int
    nombre_admissibles: int
    nombre_non_admissibles: int
    
    # Résultats par catégorie
    dossiers_admissibles: List[AnalyseDossier]
    dossiers_non_admissibles: List[AnalyseDossier]
    
    # Statistiques
    moyenne_generale_candidats: float
    score_moyen: float
    
    # Métadonnées
    timestamp: datetime
    criteres_appliques: Dict[str, Any]
