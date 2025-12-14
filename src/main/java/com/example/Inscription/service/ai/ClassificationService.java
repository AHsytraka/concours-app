package com.example.Inscription.service.ai;

import com.example.Inscription.model.*;
import com.example.Inscription.repository.ExamResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service de classification automatique des résultats
 * Utilise les règles de délibération pour classer et segmenter les candidats
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ClassificationService {
    
    private final ExamResultRepository examResultRepository;
    
    /**
     * Classifier les résultats en catégories (Accepté, Attente, Rejeté)
     */
    public ClassificationResult classifyResults(Long eventId, DeliberationRule rule) {
        List<ExamResult> allResults = examResultRepository.findByEventIdOrderByAverageDesc(eventId);
        
        List<ExamResult> accepted = new ArrayList<>();
        List<ExamResult> waitlist = new ArrayList<>();
        List<ExamResult> rejected = new ArrayList<>();
        
        for (ExamResult result : allResults) {
            if (result.getResultStatus() == ResultStatus.PASSED && !result.getIsOnWaitlist()) {
                accepted.add(result);
            } else if (result.getIsOnWaitlist()) {
                waitlist.add(result);
            } else {
                rejected.add(result);
            }
        }
        
        ClassificationResult classificationResult = new ClassificationResult();
        classificationResult.setAcceptedCount(accepted.size());
        classificationResult.setWaitlistCount(waitlist.size());
        classificationResult.setRejectedCount(rejected.size());
        classificationResult.setAcceptedList(accepted);
        classificationResult.setWaitlistList(waitlist);
        classificationResult.setRejectedList(rejected);
        
        // Calculer les statistiques
        double totalCount = allResults.size();
        classificationResult.setAcceptanceRate(totalCount > 0 ? (accepted.size() / totalCount) * 100 : 0);
        classificationResult.setWaitlistRate(totalCount > 0 ? (waitlist.size() / totalCount) * 100 : 0);
        classificationResult.setRejectionRate(totalCount > 0 ? (rejected.size() / totalCount) * 100 : 0);
        
        // Statistiques sur les scores
        if (!allResults.isEmpty()) {
            Double avgScore = allResults.stream()
                    .mapToDouble(ExamResult::getAverage)
                    .average()
                    .orElse(0.0);
            Double maxScore = allResults.stream()
                    .mapToDouble(ExamResult::getAverage)
                    .max()
                    .orElse(0.0);
            Double minScore = allResults.stream()
                    .mapToDouble(ExamResult::getAverage)
                    .min()
                    .orElse(0.0);
            
            classificationResult.setAverageScore(avgScore);
            classificationResult.setMaxScore(maxScore);
            classificationResult.setMinScore(minScore);
        }
        
        return classificationResult;
    }
    
    /**
     * Classer par moyenne dans différentes tranches
     */
    public ScoreBracketClassification classifyByScoreBrackets(Long eventId) {
        List<ExamResult> results = examResultRepository.findByEventIdOrderByAverageDesc(eventId);
        
        ScoreBracketClassification classification = new ScoreBracketClassification();
        
        // Définir les tranches de notes
        classification.setExcellent(results.stream()
                .filter(r -> r.getAverage() >= 16)
                .collect(Collectors.toList()));
        
        classification.setVeryGood(results.stream()
                .filter(r -> r.getAverage() >= 14 && r.getAverage() < 16)
                .collect(Collectors.toList()));
        
        classification.setGood(results.stream()
                .filter(r -> r.getAverage() >= 12 && r.getAverage() < 14)
                .collect(Collectors.toList()));
        
        classification.setPassable(results.stream()
                .filter(r -> r.getAverage() >= 10 && r.getAverage() < 12)
                .collect(Collectors.toList()));
        
        classification.setFailing(results.stream()
                .filter(r -> r.getAverage() < 10)
                .collect(Collectors.toList()));
        
        classification.setTotalCount(results.size());
        
        return classification;
    }
    
    /**
     * DTO pour les résultats de classification
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ClassificationResult {
        private int acceptedCount;
        private int waitlistCount;
        private int rejectedCount;
        private double acceptanceRate;
        private double waitlistRate;
        private double rejectionRate;
        private Double averageScore;
        private Double maxScore;
        private Double minScore;
        private List<ExamResult> acceptedList;
        private List<ExamResult> waitlistList;
        private List<ExamResult> rejectedList;
    }
    
    /**
     * DTO pour classification par tranches de notes
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ScoreBracketClassification {
        private List<ExamResult> excellent;      // >= 16/20
        private List<ExamResult> veryGood;       // 14-16
        private List<ExamResult> good;           // 12-14
        private List<ExamResult> passable;       // 10-12
        private List<ExamResult> failing;        // < 10
        private int totalCount;
    }
}
