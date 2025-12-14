"""
Service de délibération pour le Cas 1: Concours
- Reçoit les notes des candidats
- Calcule les moyennes
- Applique les critères de délibération intelligemment
- Retourne la liste des admis
"""

from typing import List, Dict, Any
from datetime import datetime
import logging

from .schemas import (
    ConcoursRequest, ConcoursResponse, 
    CandidatConcours, CriteresConcours, ResultatCandidatConcours,
    DecisionEnum
)

logger = logging.getLogger(__name__)


class ConcoursDeliberationService:
    """Service de délibération pour les concours"""
    
    def __init__(self):
        self.history = []
    
    def deliberer(self, request: ConcoursRequest) -> ConcoursResponse:
        """
        Traite la délibération d'un concours complet.
        
        Processus:
        1. Calcul des moyennes pour chaque candidat
        2. Vérification des critères éliminatoires
        3. Classement des candidats
        4. Application des critères de sélection
        5. Génération des décisions avec explications
        """
        logger.info(f"Début délibération concours: {len(request.candidats)} candidats")
        
        resultats = []
        
        # 1. Traitement de chaque candidat
        for candidat in request.candidats:
            resultat = self._evaluer_candidat(candidat, request.criteres)
            resultats.append(resultat)
        
        # 2. Tri par moyenne décroissante
        resultats.sort(key=lambda x: x.moyenne, reverse=True)
        
        # 3. Attribution des rangs et décisions finales
        resultats = self._attribuer_decisions(resultats, request.criteres)
        
        # 4. Séparation par catégorie
        liste_admis = [r for r in resultats if r.decision == DecisionEnum.ADMIS]
        liste_attente = [r for r in resultats if r.decision == DecisionEnum.LISTE_ATTENTE]
        liste_refuses = [r for r in resultats if r.decision == DecisionEnum.REFUSE]
        
        # 5. Calcul des statistiques
        moyennes = [r.moyenne for r in resultats]
        moyenne_generale = sum(moyennes) / len(moyennes) if moyennes else 0
        
        moyennes_admis = [r.moyenne for r in liste_admis]
        moyenne_admis = sum(moyennes_admis) / len(moyennes_admis) if moyennes_admis else 0
        
        note_dernier_admis = liste_admis[-1].moyenne if liste_admis else None
        
        # 6. Construction de la réponse
        response = ConcoursResponse(
            concours_id=request.concours_id,
            total_candidats=len(resultats),
            nombre_admis=len(liste_admis),
            nombre_refuses=len(liste_refuses),
            nombre_liste_attente=len(liste_attente),
            liste_admis=liste_admis,
            liste_attente=liste_attente,
            liste_refuses=liste_refuses,
            moyenne_generale=round(moyenne_generale, 2),
            moyenne_admis=round(moyenne_admis, 2),
            note_dernier_admis=note_dernier_admis,
            timestamp=datetime.now(),
            criteres_appliques=self._format_criteres(request.criteres)
        )
        
        # Sauvegarde dans l'historique
        self.history.append({
            "timestamp": datetime.now(),
            "concours_id": request.concours_id,
            "total": len(resultats),
            "admis": len(liste_admis)
        })
        
        logger.info(f"Délibération terminée: {len(liste_admis)} admis / {len(resultats)} candidats")
        
        return response
    
    def _evaluer_candidat(self, candidat: CandidatConcours, criteres: CriteresConcours) -> ResultatCandidatConcours:
        """Évalue un candidat individuellement"""
        
        # Calcul de la moyenne pondérée
        total_points = 0
        total_coefficients = 0
        details_notes = {}
        
        for note in candidat.notes:
            total_points += note.note * note.coefficient
            total_coefficients += note.coefficient
            details_notes[note.matiere] = note.note
        
        moyenne = total_points / total_coefficients if total_coefficients > 0 else 0
        moyenne = round(moyenne, 2)
        
        # Analyse des points forts/faibles
        points_forts, points_faibles = self._analyser_profil(candidat.notes, moyenne, criteres)
        
        # Vérification des critères éliminatoires
        est_elimine, raison_elimination = self._verifier_elimination(candidat, criteres)
        
        # Génération de l'explication
        explication = self._generer_explication(
            candidat, moyenne, points_forts, points_faibles, 
            est_elimine, raison_elimination, criteres
        )
        
        # Décision préliminaire (sera ajustée après classement)
        if est_elimine:
            decision = DecisionEnum.REFUSE
            admis = False
        elif moyenne >= criteres.moyenne_minimum:
            decision = DecisionEnum.ADMIS  # Temporaire, sera ajusté
            admis = True
        else:
            decision = DecisionEnum.REFUSE
            admis = False
        
        return ResultatCandidatConcours(
            candidat_id=candidat.id,
            nom=candidat.nom,
            prenom=candidat.prenom,
            moyenne=moyenne,
            rang=None,  # Sera défini après le tri
            decision=decision,
            admis=admis,
            points_forts=points_forts,
            points_faibles=points_faibles,
            explication=explication,
            details_notes=details_notes
        )
    
    def _verifier_elimination(self, candidat: CandidatConcours, criteres: CriteresConcours) -> tuple:
        """Vérifie si le candidat est éliminé selon les critères"""
        
        # Note éliminatoire globale
        if criteres.note_eliminatoire is not None:
            for note in candidat.notes:
                if note.note < criteres.note_eliminatoire:
                    # Vérifier si c'est une matière éliminatoire
                    if criteres.matieres_eliminatoires:
                        if note.matiere in criteres.matieres_eliminatoires:
                            return True, f"Note éliminatoire en {note.matiere}: {note.note}/20 (seuil: {criteres.note_eliminatoire})"
                    else:
                        # Toutes les matières sont éliminatoires
                        return True, f"Note éliminatoire en {note.matiere}: {note.note}/20 (seuil: {criteres.note_eliminatoire})"
        
        return False, None
    
    def _analyser_profil(self, notes: List, moyenne: float, criteres: CriteresConcours) -> tuple:
        """Analyse le profil du candidat pour identifier forces et faiblesses"""
        
        points_forts = []
        points_faibles = []
        
        for note in notes:
            if note.note >= 14:
                points_forts.append(f"Excellente performance en {note.matiere} ({note.note}/20)")
            elif note.note >= 12:
                points_forts.append(f"Bonne maîtrise de {note.matiere} ({note.note}/20)")
            elif note.note < 8:
                points_faibles.append(f"Difficultés en {note.matiere} ({note.note}/20)")
            elif note.note < 10:
                points_faibles.append(f"Niveau insuffisant en {note.matiere} ({note.note}/20)")
        
        # Analyse de la moyenne
        if moyenne >= 16:
            points_forts.insert(0, f"Excellent niveau général (moyenne: {moyenne}/20)")
        elif moyenne >= 14:
            points_forts.insert(0, f"Très bon niveau général (moyenne: {moyenne}/20)")
        elif moyenne >= 12:
            points_forts.insert(0, f"Bon niveau général (moyenne: {moyenne}/20)")
        elif moyenne < 10:
            points_faibles.insert(0, f"Moyenne insuffisante ({moyenne}/20)")
        
        # Analyse des critères spécifiques si fournis
        if criteres.criteres_specifiques:
            self._analyser_criteres_specifiques(notes, criteres.criteres_specifiques, points_forts, points_faibles)
        
        return points_forts[:5], points_faibles[:5]  # Limiter à 5 max
    
    def _analyser_criteres_specifiques(self, notes: List, criteres_texte: str, points_forts: List, points_faibles: List):
        """Analyse les critères spécifiques en langage naturel"""
        
        criteres_lower = criteres_texte.lower()
        
        # Recherche de mots-clés pour comprendre les critères
        for note in notes:
            matiere_lower = note.matiere.lower()
            
            # Si la matière est mentionnée dans les critères
            if matiere_lower in criteres_lower or any(keyword in matiere_lower for keyword in ['math', 'physique', 'info', 'français']):
                # Vérifier si une note minimale est attendue
                if 'priorité' in criteres_lower or 'important' in criteres_lower or 'requis' in criteres_lower:
                    if note.note >= 12:
                        points_forts.append(f"Répond au critère prioritaire en {note.matiere}")
                    elif note.note < 10:
                        points_faibles.append(f"Ne répond pas au critère prioritaire en {note.matiere}")
    
    def _attribuer_decisions(self, resultats: List[ResultatCandidatConcours], criteres: CriteresConcours) -> List[ResultatCandidatConcours]:
        """Attribue les décisions finales et les rangs après classement"""
        
        # Attribution des rangs
        for i, resultat in enumerate(resultats):
            resultat.rang = i + 1
        
        # Si nombre de places défini
        if criteres.nombre_places is not None:
            places = criteres.nombre_places
            liste_attente_size = min(places // 2, 10)  # Liste d'attente = 50% des places max 10
            
            for i, resultat in enumerate(resultats):
                # Si déjà éliminé (note éliminatoire ou moyenne insuffisante), reste refusé
                if resultat.decision == DecisionEnum.REFUSE:
                    resultat.explication += f" Classé(e) {resultat.rang}/{len(resultats)}."
                    continue
                
                if i < places:
                    resultat.decision = DecisionEnum.ADMIS
                    resultat.admis = True
                    resultat.explication += f" Classé(e) {resultat.rang}/{len(resultats)}, admis(e) dans les {places} places."
                elif i < places + liste_attente_size and resultat.moyenne >= criteres.moyenne_minimum:
                    resultat.decision = DecisionEnum.LISTE_ATTENTE
                    resultat.admis = False
                    resultat.explication += f" Classé(e) {resultat.rang}/{len(resultats)}, placé(e) en liste d'attente."
                else:
                    resultat.decision = DecisionEnum.REFUSE
                    resultat.admis = False
                    resultat.explication += f" Classé(e) {resultat.rang}/{len(resultats)}, non retenu(e) faute de places."
        else:
            # Pas de limite de places, admission basée sur la moyenne minimum
            for resultat in resultats:
                if resultat.moyenne >= criteres.moyenne_minimum and resultat.decision != DecisionEnum.REFUSE:
                    resultat.decision = DecisionEnum.ADMIS
                    resultat.admis = True
                else:
                    resultat.decision = DecisionEnum.REFUSE
                    resultat.admis = False
        
        return resultats
    
    def _generer_explication(self, candidat: CandidatConcours, moyenne: float, 
                            points_forts: List[str], points_faibles: List[str],
                            est_elimine: bool, raison_elimination: str,
                            criteres: CriteresConcours) -> str:
        """Génère une explication en langage naturel de la décision"""
        
        nom_complet = f"{candidat.prenom} {candidat.nom}"
        
        if est_elimine:
            return f"{nom_complet} est éliminé(e). {raison_elimination}."
        
        explication_parts = [f"{nom_complet} obtient une moyenne de {moyenne}/20."]
        
        if moyenne >= criteres.moyenne_minimum:
            if moyenne >= 16:
                explication_parts.append("Excellent dossier, très au-dessus du seuil d'admission.")
            elif moyenne >= 14:
                explication_parts.append("Très bon dossier, confortablement au-dessus du seuil.")
            elif moyenne >= 12:
                explication_parts.append("Bon dossier, au-dessus du seuil d'admission.")
            else:
                explication_parts.append("Dossier recevable, au-dessus du seuil minimum.")
        else:
            deficit = criteres.moyenne_minimum - moyenne
            explication_parts.append(f"Moyenne insuffisante, {deficit:.1f} points sous le seuil requis de {criteres.moyenne_minimum}.")
        
        if points_forts:
            explication_parts.append(f"Points forts: {points_forts[0].lower()}.")
        
        if points_faibles:
            explication_parts.append(f"Point d'attention: {points_faibles[0].lower()}.")
        
        return " ".join(explication_parts)
    
    def _format_criteres(self, criteres: CriteresConcours) -> Dict[str, Any]:
        """Formate les critères pour la réponse"""
        return {
            "moyenne_minimum": criteres.moyenne_minimum,
            "note_eliminatoire": criteres.note_eliminatoire,
            "nombre_places": criteres.nombre_places,
            "matieres_eliminatoires": criteres.matieres_eliminatoires,
            "criteres_specifiques": criteres.criteres_specifiques
        }


# Instance globale du service
concours_service = ConcoursDeliberationService()
