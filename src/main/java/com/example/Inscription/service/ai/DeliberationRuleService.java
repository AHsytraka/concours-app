package com.example.Inscription.service.ai;

import com.example.Inscription.model.EventType;
import com.example.Inscription.model.Institution;
import com.example.Inscription.repository.DeliberationRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Service de gestion des règles de délibération par établissement
 * Permet la création, modification et duplication des règles
 */
@Service
@RequiredArgsConstructor
@Transactional
public class DeliberationRuleService {
    
    private final DeliberationRuleRepository ruleRepository;
    
    /**
     * Obtenir les règles actives pour un type d'événement
     */
    public List<com.example.Inscription.model.DeliberationRule> getActiveRulesForEvent(
            Long institutionId, EventType eventType) {
        return ruleRepository.findByInstitutionIdAndEventTypeAndIsActiveTrue(institutionId, eventType)
                .stream()
                .toList();
    }
    
    /**
     * Créer une nouvelle règle de délibération
     */
    public com.example.Inscription.model.DeliberationRule createRule(
            Institution institution,
            EventType eventType,
            String ruleName,
            Double passingScore,
            Double minAverage,
            Integer maxWaitlistPercentage,
            Boolean useWeightedAverage,
            String rankingAlgorithm) {
        
        com.example.Inscription.model.DeliberationRule rule = new com.example.Inscription.model.DeliberationRule();
        rule.setInstitution(institution);
        rule.setEventType(eventType);
        rule.setRuleName(ruleName);
        rule.setPassingScore(passingScore);
        rule.setMinAverage(minAverage);
        rule.setMaxWaitlistPercentage(maxWaitlistPercentage);
        rule.setUseWeightedAverage(useWeightedAverage);
        rule.setRankingAlgorithm(rankingAlgorithm);
        rule.setIsActive(true);
        
        return ruleRepository.save(rule);
    }
    
    /**
     * Récupérer les règles précédentes d'un établissement pour un type d'événement
     */
    public List<com.example.Inscription.model.DeliberationRule> getPreviousRulesForProposal(
            Long institutionId, EventType eventType) {
        return ruleRepository.findByInstitutionIdAndEventType(institutionId, eventType);
    }
}
