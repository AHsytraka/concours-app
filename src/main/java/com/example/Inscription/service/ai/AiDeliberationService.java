package com.example.Inscription.service.ai;

import com.example.Inscription.model.*;
import com.example.Inscription.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service de délibération pour traiter les résultats d'examen et sélection de dossiers
 * Applique les règles d'établissement pour le classement et les critères de réussite
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AiDeliberationService {
    
    private final ExamResultRepository examResultRepository;
    private final DeliberationRuleRepository ruleRepository;
    private final EventRepository eventRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * Délibérer un concours avec calcul de notes et application des règles
     */
    public DeliberationResult deliberateContest(Long eventId, List<ExamScore> examScores) throws Exception {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        
        if (event.getEventType() != EventType.CONTEST) {
            throw new IllegalArgumentException("This event is not a contest");
        }
        
        // Récupérer les règles de délibération de l'établissement
        DeliberationRule rules = ruleRepository.findByInstitutionIdAndEventTypeAndIsActiveTrue(
                event.getInstitution().getId(), 
                EventType.CONTEST
        ).orElseThrow(() -> new IllegalArgumentException("No deliberation rules configured for this institution"));
        
        List<ExamResult> results = new ArrayList<>();
        int totalProcessed = 0;
        int totalPassed = 0;
        int totalFailed = 0;
        
        // Traiter chaque score d'examen
        for (ExamScore score : examScores) {
            ExamResult result = examResultRepository.findByUserIdAndEventId(score.getUserId(), eventId)
                    .orElse(new ExamResult());
            
            // Calculer la note moyenne
            Double average = calculateAverage(score, event, rules);
            result.setTotalScore(score.getTotalScore());
            result.setAverage(average);
            result.setScoreData(objectMapper.writeValueAsString(score));
            
            // Appliquer la règle de réussite
            boolean passed = average >= rules.getPassingScore();
            result.setResultStatus(passed ? ResultStatus.PASSED : ResultStatus.FAILED);
            result.setUser(score.getUser());
            result.setEvent(event);
            
            results.add(result);
            totalProcessed++;
            if (passed) totalPassed++;
            else totalFailed++;
        }
        
        // Classer les étudiants selon l'algorithme configuré
        classifyResults(results, rules);
        
        // Identifier les candidats en liste d'attente
        assignWaitlist(results, rules);
        
        // Sauvegarder les résultats
        for (ExamResult result : results) {
            examResultRepository.save(result);
        }
        
        DeliberationResult deliberationResult = new DeliberationResult();
        deliberationResult.setIsPassed(totalPassed > 0);
        deliberationResult.setTotalProcessed(totalProcessed);
        deliberationResult.setTotalPassed(totalPassed);
        deliberationResult.setTotalFailed(totalFailed);
        deliberationResult.setDetails("Délibération complétée: " + totalPassed + " réussis, " + totalFailed + " échoués");
        
        return deliberationResult;
    }
    
    /**
     * Évaluer les dossiers pour une sélection et classer les candidats
     */
    public SelectionResult evaluateFileSelection(Long eventId) throws Exception {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        
        if (event.getEventType() != EventType.SELECTION) {
            throw new IllegalArgumentException("This event is not a selection");
        }
        
        DeliberationRule rules = ruleRepository.findByInstitutionIdAndEventTypeAndIsActiveTrue(
                event.getInstitution().getId(),
                EventType.SELECTION
        ).orElseThrow(() -> new IllegalArgumentException("No deliberation rules configured for this institution"));
        
        // TODO: Implémenter l'évaluation IA des dossiers
        // Cela nécessiterait une intégration avec un modèle de notation ML
        // Pour l'instant, retourner un placeholder
        
        SelectionResult result = new SelectionResult();
        result.setIsPassed(false);
        result.setEvaluationDetails("Évaluation des dossiers non implémentée - requiert intégration IA");
        
        return result;
    }
    
    /**
     * Calculer la moyenne en fonction de la règle (moyenne simple ou pondérée)
     */
    private Double calculateAverage(ExamScore score, Event event, DeliberationRule rules) {
        if (rules.getUseWeightedAverage() && !event.getSubjects().isEmpty()) {
            return calculateWeightedAverage(score, event);
        } else {
            return calculateSimpleAverage(score);
        }
    }
    
    /**
     * Calculer la moyenne pondérée par les coefficients des matières
     */
    private Double calculateWeightedAverage(ExamScore score, Event event) {
        double totalWeightedScore = 0;
        double totalCoefficient = 0;
        
        Map<String, Double> scoreMap = score.getScores();
        
        for (Subject subject : event.getSubjects()) {
            Double subjectScore = scoreMap.getOrDefault(subject.getName(), 0.0);
            totalWeightedScore += subjectScore * subject.getCoefficient();
            totalCoefficient += subject.getCoefficient();
        }
        
        return totalCoefficient > 0 ? totalWeightedScore / totalCoefficient : 0.0;
    }
    
    /**
     * Calculer une simple moyenne arithmétique
     */
    private Double calculateSimpleAverage(ExamScore score) {
        if (score.getScores().isEmpty()) return 0.0;
        return score.getScores().values().stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
    }
    
    /**
     * Classer les résultats selon l'algorithme configuré
     */
    private void classifyResults(List<ExamResult> results, DeliberationRule rules) {
        String algorithm = rules.getRankingAlgorithm() != null ? rules.getRankingAlgorithm() : "AVERAGE_DESC";
        
        switch (algorithm) {
            case "AVERAGE_DESC":
                // Trier par moyenne décroissante
                results.sort((a, b) -> Double.compare(b.getAverage(), a.getAverage()));
                break;
            case "SCORE_DESC":
                // Trier par score total décroissant
                results.sort((a, b) -> Double.compare(b.getTotalScore(), a.getTotalScore()));
                break;
            case "CUSTOM":
                // Appliquer les critères personnalisés (JSON)
                applyCustomCriteria(results, rules);
                break;
        }
        
        // Assigner les rangs
        for (int i = 0; i < results.size(); i++) {
            results.get(i).setRanking(i + 1);
        }
    }
    
    /**
     * Appliquer des critères de classement personnalisés
     */
    private void applyCustomCriteria(List<ExamResult> results, DeliberationRule rules) {
        try {
            // Parser les critères JSON custom si fournis
            if (rules.getCustomCriteria() != null && !rules.getCustomCriteria().isEmpty()) {
                // Implémenter la logique de tri custom
                // Pour maintenant, utiliser le tri par moyenne par défaut
                results.sort((a, b) -> Double.compare(b.getAverage(), a.getAverage()));
            }
        } catch (Exception e) {
            // Fallback à tri par moyenne en cas d'erreur
            results.sort((a, b) -> Double.compare(b.getAverage(), a.getAverage()));
        }
    }
    
    /**
     * Identifier et marquer les candidats en liste d'attente
     */
    private void assignWaitlist(List<ExamResult> results, DeliberationRule rules) {
        int totalResults = results.size();
        int passedCount = (int) results.stream()
                .filter(r -> r.getResultStatus() == ResultStatus.PASSED)
                .count();
        
        int waitlistCount = Math.round(totalResults * rules.getMaxWaitlistPercentage() / 100f);
        
        // Marquer les candidats ayant échoué mais proches de la limite comme en attente
        int waitlistAssigned = 0;
        for (ExamResult result : results) {
            if (result.getResultStatus() == ResultStatus.FAILED && waitlistAssigned < waitlistCount) {
                result.setIsOnWaitlist(true);
                waitlistAssigned++;
            }
        }
    }
    
    /**
     * Récupérer les règles de délibération précédentes pour les proposer pour les futurs événements
     */
    public List<DeliberationRule> getPreviousRules(Long institutionId, EventType eventType) {
        return ruleRepository.findByInstitutionIdAndEventType(institutionId, eventType);
    }
    
    /**
     * Dupliquer une règle précédente pour un nouvel événement
     */
    public DeliberationRule duplicatePreviousRule(Long institutionId, Long previousRuleId, String newRuleName) throws Exception {
        DeliberationRule previousRule = ruleRepository.findById(previousRuleId)
                .orElseThrow(() -> new IllegalArgumentException("Previous rule not found"));
        
        if (!previousRule.getInstitution().getId().equals(institutionId)) {
            throw new IllegalArgumentException("Rule does not belong to this institution");
        }
        
        DeliberationRule newRule = new DeliberationRule();
        newRule.setInstitution(previousRule.getInstitution());
        newRule.setEventType(previousRule.getEventType());
        newRule.setRuleName(newRuleName);
        newRule.setPassingScore(previousRule.getPassingScore());
        newRule.setMinAverage(previousRule.getMinAverage());
        newRule.setMaxWaitlistPercentage(previousRule.getMaxWaitlistPercentage());
        newRule.setUseWeightedAverage(previousRule.getUseWeightedAverage());
        newRule.setRankingAlgorithm(previousRule.getRankingAlgorithm());
        newRule.setCustomCriteria(previousRule.getCustomCriteria());
        newRule.setSelectionCriteria(previousRule.getSelectionCriteria());
        newRule.setMinSelectionScore(previousRule.getMinSelectionScore());
        newRule.setIsActive(true);
        
        return ruleRepository.save(newRule);
    }
}
