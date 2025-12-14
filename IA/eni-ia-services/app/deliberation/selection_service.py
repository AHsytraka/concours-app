"""
Service de sélection de dossier pour le Cas 2: Sélection sur dossier
- Reçoit les données du relevé de notes
- Analyse intelligemment selon les critères fournis
- Détermine l'admissibilité avec explications
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from .schemas import (
    SelectionDossierRequest, SelectionDossierResponse,
    DossierCandidat, CriteresSelection, AnalyseDossier,
    DecisionEnum
)

logger = logging.getLogger(__name__)


class SelectionDossierService:
    """Service de sélection de dossiers"""
    
    def __init__(self):
        self.history = []
        
        # Mapping de mots-clés pour comprendre les critères textuels
        self.keywords_mapping = {
            "mathematiques": ["math", "maths", "mathématique", "mathématiques", "algebre", "analyse", "geometrie"],
            "physique": ["physique", "phys", "mecanique", "optique", "electricite"],
            "informatique": ["informatique", "info", "programmation", "algorithme", "code", "dev"],
            "francais": ["francais", "français", "litterature", "expression", "redaction"],
            "anglais": ["anglais", "english", "langue"],
            "chimie": ["chimie", "chim"],
            "biologie": ["biologie", "bio", "svt"],
            "economie": ["economie", "eco", "gestion", "comptabilite"],
        }
        
        # Mapping des qualités recherchées
        self.qualites_mapping = {
            "rigueur": ["rigueur", "rigoureux", "précision", "précis", "méthodique"],
            "creativite": ["créativité", "créatif", "innovation", "innovant", "original"],
            "logique": ["logique", "raisonnement", "analytique", "analyse"],
            "autonomie": ["autonomie", "autonome", "indépendant"],
            "travail_equipe": ["équipe", "collaboration", "collaboratif", "groupe"],
        }
    
    def analyser_dossiers(self, request: SelectionDossierRequest) -> SelectionDossierResponse:
        """
        Analyse une liste de dossiers selon les critères fournis.
        
        Processus:
        1. Calcul des moyennes
        2. Analyse des critères textuels avec IA
        3. Évaluation de l'adéquation avec la formation
        4. Génération des décisions avec explications
        """
        logger.info(f"Début analyse dossiers: {len(request.dossiers)} dossiers")
        
        analyses = []
        
        # 1. Analyse de chaque dossier
        for dossier in request.dossiers:
            analyse = self._analyser_dossier(dossier, request.criteres)
            analyses.append(analyse)
        
        # 2. Tri par score décroissant
        analyses.sort(key=lambda x: x.score_global, reverse=True)
        
        # 3. Application du nombre de places si défini
        if request.criteres.nombre_places:
            analyses = self._appliquer_limite_places(analyses, request.criteres.nombre_places)
        
        # 4. Séparation par admissibilité
        admissibles = [a for a in analyses if a.admissible]
        non_admissibles = [a for a in analyses if not a.admissible]
        
        # 5. Statistiques
        moyennes = [a.moyenne_calculee for a in analyses]
        scores = [a.score_global for a in analyses]
        
        response = SelectionDossierResponse(
            formation_id=request.formation_id,
            total_dossiers=len(analyses),
            nombre_admissibles=len(admissibles),
            nombre_non_admissibles=len(non_admissibles),
            dossiers_admissibles=admissibles,
            dossiers_non_admissibles=non_admissibles,
            moyenne_generale_candidats=round(sum(moyennes) / len(moyennes), 2) if moyennes else 0,
            score_moyen=round(sum(scores) / len(scores), 2) if scores else 0,
            timestamp=datetime.now(),
            criteres_appliques=self._format_criteres(request.criteres)
        )
        
        # Sauvegarde
        self.history.append({
            "timestamp": datetime.now(),
            "formation_id": request.formation_id,
            "total": len(analyses),
            "admissibles": len(admissibles)
        })
        
        logger.info(f"Analyse terminée: {len(admissibles)} admissibles / {len(analyses)} dossiers")
        
        return response
    
    def _analyser_dossier(self, dossier: DossierCandidat, criteres: CriteresSelection) -> AnalyseDossier:
        """Analyse un dossier individuellement"""
        
        # 1. Calcul des moyennes
        moyenne_simple = self._calculer_moyenne_simple(dossier)
        moyenne_ponderee = self._calculer_moyenne_ponderee(dossier, criteres)
        
        # 2. Calcul du score global (0-100)
        score_global = self._calculer_score_global(dossier, criteres, moyenne_simple, moyenne_ponderee)
        
        # 3. Vérification des critères
        criteres_satisfaits, criteres_non_satisfaits = self._verifier_criteres(dossier, criteres)
        
        # 4. Analyse du profil
        points_forts, points_faibles = self._analyser_profil(dossier, criteres)
        
        # 5. Analyse de l'adéquation avec la formation
        adequation = self._calculer_adequation_formation(dossier, criteres)
        
        # 6. Décision d'admissibilité
        admissible = self._determiner_admissibilite(
            moyenne_simple, moyenne_ponderee, score_global, 
            criteres, criteres_non_satisfaits
        )
        
        # 7. Génération des explications
        analyse_profil = self._generer_analyse_profil(dossier, criteres, points_forts, points_faibles)
        recommandation = self._generer_recommandation(admissible, score_global, criteres_non_satisfaits, dossier)
        
        return AnalyseDossier(
            candidat_id=dossier.id,
            nom=dossier.nom,
            prenom=dossier.prenom,
            admissible=admissible,
            decision=DecisionEnum.ADMIS if admissible else DecisionEnum.REFUSE,
            score_global=round(score_global, 1),
            moyenne_calculee=round(moyenne_simple, 2),
            moyenne_ponderee=round(moyenne_ponderee, 2) if moyenne_ponderee else None,
            analyse_profil=analyse_profil,
            points_forts=points_forts,
            points_faibles=points_faibles,
            recommandation=recommandation,
            adequation_formation=round(adequation, 1) if adequation else None,
            criteres_satisfaits=criteres_satisfaits,
            criteres_non_satisfaits=criteres_non_satisfaits
        )
    
    def _calculer_moyenne_simple(self, dossier: DossierCandidat) -> float:
        """Calcule la moyenne simple"""
        if dossier.moyenne_generale is not None:
            return dossier.moyenne_generale
        
        if not dossier.notes:
            return 0
        
        total = sum(n.note * (n.coefficient or 1) for n in dossier.notes)
        coeffs = sum(n.coefficient or 1 for n in dossier.notes)
        
        return total / coeffs if coeffs > 0 else 0
    
    def _calculer_moyenne_ponderee(self, dossier: DossierCandidat, criteres: CriteresSelection) -> Optional[float]:
        """Calcule la moyenne pondérée selon les poids définis dans les critères"""
        if not criteres.poids_matieres or not dossier.notes:
            return None
        
        total = 0
        coeffs = 0
        
        for note in dossier.notes:
            # Cherche le poids de la matière
            poids = 1.0
            matiere_lower = note.matiere.lower()
            
            for matiere_critere, poids_critere in criteres.poids_matieres.items():
                if matiere_critere.lower() in matiere_lower or matiere_lower in matiere_critere.lower():
                    poids = poids_critere
                    break
            
            coeff = (note.coefficient or 1) * poids
            total += note.note * coeff
            coeffs += coeff
        
        return total / coeffs if coeffs > 0 else None
    
    def _calculer_score_global(self, dossier: DossierCandidat, criteres: CriteresSelection,
                               moyenne_simple: float, moyenne_ponderee: Optional[float]) -> float:
        """Calcule un score global sur 100"""
        
        # Base: moyenne sur 20 convertie en score sur 100
        score_base = (moyenne_ponderee or moyenne_simple) * 5  # Note/20 * 5 = Score/100
        
        # Bonus/malus selon le profil
        bonus = 0
        
        # Bonus mention
        if dossier.mention:
            mentions_bonus = {
                "très bien": 10,
                "bien": 7,
                "assez bien": 4,
                "passable": 0
            }
            for mention, points in mentions_bonus.items():
                if mention in dossier.mention.lower():
                    bonus += points
                    break
        
        # Bonus adéquation critères textuels
        if criteres.criteres_texte:
            adequation_bonus = self._evaluer_adequation_criteres_texte(dossier, criteres.criteres_texte)
            bonus += adequation_bonus
        
        score_final = min(100, max(0, score_base + bonus))
        return score_final
    
    def _evaluer_adequation_criteres_texte(self, dossier: DossierCandidat, criteres_texte: str) -> float:
        """Évalue l'adéquation du dossier avec les critères textuels"""
        
        bonus = 0
        criteres_lower = criteres_texte.lower()
        
        # Recherche des matières mentionnées dans les critères
        for matiere_standard, keywords in self.keywords_mapping.items():
            for keyword in keywords:
                if keyword in criteres_lower:
                    # Cherche cette matière dans les notes du candidat
                    for note in dossier.notes:
                        note_matiere_lower = note.matiere.lower()
                        if any(kw in note_matiere_lower for kw in keywords):
                            if note.note >= 14:
                                bonus += 3
                            elif note.note >= 12:
                                bonus += 1
                            elif note.note < 8:
                                bonus -= 2
                            break
                    break
        
        return min(10, max(-10, bonus))  # Limiter entre -10 et +10
    
    def _verifier_criteres(self, dossier: DossierCandidat, criteres: CriteresSelection) -> tuple:
        """Vérifie quels critères sont satisfaits ou non"""
        
        satisfaits = []
        non_satisfaits = []
        
        # Vérification moyenne minimum
        moyenne = self._calculer_moyenne_simple(dossier)
        if moyenne >= criteres.moyenne_minimum:
            satisfaits.append(f"Moyenne >= {criteres.moyenne_minimum} ({moyenne:.2f})")
        else:
            non_satisfaits.append(f"Moyenne < {criteres.moyenne_minimum} ({moyenne:.2f})")
        
        # Vérification matières requises
        if criteres.matieres_requises:
            matieres_presentes = [n.matiere.lower() for n in dossier.notes]
            for matiere_requise in criteres.matieres_requises:
                found = any(matiere_requise.lower() in m for m in matieres_presentes)
                if found:
                    satisfaits.append(f"Matière {matiere_requise} présente")
                else:
                    non_satisfaits.append(f"Matière {matiere_requise} absente")
        
        # Vérification notes minimum par matière
        if criteres.note_minimum_matiere:
            for matiere, note_min in criteres.note_minimum_matiere.items():
                for note in dossier.notes:
                    if matiere.lower() in note.matiere.lower():
                        if note.note >= note_min:
                            satisfaits.append(f"{matiere} >= {note_min} ({note.note})")
                        else:
                            non_satisfaits.append(f"{matiere} < {note_min} ({note.note})")
                        break
        
        return satisfaits, non_satisfaits
    
    def _analyser_profil(self, dossier: DossierCandidat, criteres: CriteresSelection) -> tuple:
        """Analyse les points forts et faibles du dossier"""
        
        points_forts = []
        points_faibles = []
        
        # Analyse des notes
        for note in dossier.notes:
            if note.note >= 16:
                points_forts.append(f"Excellence en {note.matiere} ({note.note}/20)")
            elif note.note >= 14:
                points_forts.append(f"Très bon niveau en {note.matiere} ({note.note}/20)")
            elif note.note < 8:
                points_faibles.append(f"Lacunes en {note.matiere} ({note.note}/20)")
            elif note.note < 10:
                points_faibles.append(f"Niveau insuffisant en {note.matiere} ({note.note}/20)")
        
        # Analyse mention
        if dossier.mention:
            if "très bien" in dossier.mention.lower():
                points_forts.insert(0, f"Mention Très Bien")
            elif "bien" in dossier.mention.lower():
                points_forts.insert(0, f"Mention Bien")
        
        # Analyse des critères spécifiques
        if criteres.criteres_texte:
            self._analyser_adequation_criteres(dossier, criteres.criteres_texte, points_forts, points_faibles)
        
        return points_forts[:5], points_faibles[:5]
    
    def _analyser_adequation_criteres(self, dossier: DossierCandidat, criteres_texte: str, 
                                       points_forts: List, points_faibles: List):
        """Analyse l'adéquation avec les critères textuels"""
        
        criteres_lower = criteres_texte.lower()
        
        # Détection des matières prioritaires
        for matiere_standard, keywords in self.keywords_mapping.items():
            for keyword in keywords:
                if keyword in criteres_lower:
                    # Cette matière est importante pour la formation
                    for note in dossier.notes:
                        if any(kw in note.matiere.lower() for kw in keywords):
                            if note.note >= 12:
                                points_forts.append(f"Bon profil pour le critère '{matiere_standard}' demandé")
                            elif note.note < 10:
                                points_faibles.append(f"Profil à améliorer pour '{matiere_standard}' demandé")
                            break
                    break
    
    def _calculer_adequation_formation(self, dossier: DossierCandidat, criteres: CriteresSelection) -> Optional[float]:
        """Calcule le score d'adéquation avec la formation cible"""
        
        if not criteres.filiere_cible and not criteres.criteres_texte:
            return None
        
        score = 50  # Score de base
        
        # Analyse basée sur la filière cible
        if criteres.filiere_cible:
            filiere_lower = criteres.filiere_cible.lower()
            
            # Déterminer les matières importantes pour cette filière
            matieres_importantes = self._detecter_matieres_filiere(filiere_lower)
            
            for note in dossier.notes:
                note_matiere_lower = note.matiere.lower()
                for matiere_importante in matieres_importantes:
                    if matiere_importante in note_matiere_lower:
                        if note.note >= 14:
                            score += 15
                        elif note.note >= 12:
                            score += 8
                        elif note.note >= 10:
                            score += 2
                        else:
                            score -= 10
                        break
        
        return min(100, max(0, score))
    
    def _detecter_matieres_filiere(self, filiere: str) -> List[str]:
        """Détecte les matières importantes pour une filière"""
        
        filieres_matieres = {
            "informatique": ["math", "info", "physique", "algo"],
            "medecine": ["bio", "chimie", "physique", "svt"],
            "commerce": ["math", "eco", "anglais", "francais"],
            "ingenieur": ["math", "physique", "chimie", "info"],
            "droit": ["francais", "histoire", "philo", "anglais"],
            "sciences": ["math", "physique", "chimie", "bio"],
        }
        
        for filiere_type, matieres in filieres_matieres.items():
            if filiere_type in filiere:
                return matieres
        
        return ["math", "francais"]  # Par défaut
    
    def _determiner_admissibilite(self, moyenne_simple: float, moyenne_ponderee: Optional[float],
                                   score_global: float, criteres: CriteresSelection,
                                   criteres_non_satisfaits: List[str]) -> bool:
        """Détermine si le candidat est admissible"""
        
        # Critères éliminatoires (matières requises absentes, notes minimum non atteintes)
        criteres_eliminatoires = [c for c in criteres_non_satisfaits if "absente" in c or "Matière" in c]
        if criteres_eliminatoires:
            return False
        
        # Vérification moyenne minimum
        moyenne_ref = moyenne_ponderee if moyenne_ponderee else moyenne_simple
        if moyenne_ref < criteres.moyenne_minimum:
            return False
        
        # Score global suffisant (seuil à 50/100)
        if score_global < 50:
            return False
        
        return True
    
    def _appliquer_limite_places(self, analyses: List[AnalyseDossier], nombre_places: int) -> List[AnalyseDossier]:
        """Applique la limite de places aux dossiers admissibles"""
        
        admis_count = 0
        for analyse in analyses:
            if analyse.admissible:
                if admis_count < nombre_places:
                    admis_count += 1
                else:
                    # Plus de places disponibles
                    analyse.admissible = False
                    analyse.decision = DecisionEnum.LISTE_ATTENTE
                    analyse.recommandation += " (Placé en liste d'attente, limite de places atteinte)"
        
        return analyses
    
    def _generer_analyse_profil(self, dossier: DossierCandidat, criteres: CriteresSelection,
                                points_forts: List[str], points_faibles: List[str]) -> str:
        """Génère une analyse textuelle du profil"""
        
        moyenne = self._calculer_moyenne_simple(dossier)
        nom_complet = f"{dossier.prenom} {dossier.nom}"
        
        parties = [f"Le dossier de {nom_complet} présente une moyenne de {moyenne:.2f}/20."]
        
        if moyenne >= 14:
            parties.append("C'est un excellent dossier académique.")
        elif moyenne >= 12:
            parties.append("Le dossier montre un bon niveau académique.")
        elif moyenne >= 10:
            parties.append("Le niveau académique est correct mais pourrait être amélioré.")
        else:
            parties.append("Le niveau académique est insuffisant pour cette formation.")
        
        if points_forts:
            parties.append(f"Points forts identifiés: {points_forts[0].lower()}.")
        
        if points_faibles:
            parties.append(f"Points d'attention: {points_faibles[0].lower()}.")
        
        if criteres.criteres_texte:
            parties.append(f"Évaluation basée sur les critères: '{criteres.criteres_texte[:100]}...'")
        
        return " ".join(parties)
    
    def _generer_recommandation(self, admissible: bool, score: float, 
                                criteres_non_satisfaits: List[str], dossier: DossierCandidat) -> str:
        """Génère une recommandation finale"""
        
        if admissible:
            if score >= 80:
                return "Dossier fortement recommandé pour admission. Profil excellent correspondant aux attentes."
            elif score >= 65:
                return "Dossier recommandé pour admission. Bon profil avec quelques axes d'amélioration possibles."
            else:
                return "Dossier recevable. Admission possible sous réserve des autres candidatures."
        else:
            raisons = ", ".join(criteres_non_satisfaits[:2]) if criteres_non_satisfaits else "score insuffisant"
            return f"Dossier non retenu: {raisons}. Nous encourageons le candidat à renforcer son profil."
    
    def _format_criteres(self, criteres: CriteresSelection) -> Dict[str, Any]:
        """Formate les critères pour la réponse"""
        return {
            "moyenne_minimum": criteres.moyenne_minimum,
            "criteres_texte": criteres.criteres_texte,
            "poids_matieres": criteres.poids_matieres,
            "filiere_cible": criteres.filiere_cible,
            "nombre_places": criteres.nombre_places,
            "matieres_requises": criteres.matieres_requises,
            "note_minimum_matiere": criteres.note_minimum_matiere
        }


# Instance globale du service
selection_service = SelectionDossierService()
