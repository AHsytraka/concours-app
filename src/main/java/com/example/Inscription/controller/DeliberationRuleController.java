package com.example.Inscription.controller;

import com.example.Inscription.model.*;
import com.example.Inscription.repository.*;
import com.example.Inscription.service.ai.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller pour la gestion des règles de délibération et processus de délibération
 */
@RestController
@RequestMapping("/api/institution/deliberation")
@RequiredArgsConstructor
@Tag(name = "Deliberation Management", description = "Endpoints for managing deliberation rules and processes")
@SecurityRequirement(name = "bearerAuth")
public class DeliberationRuleController {
    
    private final DeliberationRuleRepository ruleRepository;
    private final DeliberationRuleService ruleService;
    private final DeliberationService deliberationService;
    private final ClassificationService classificationService;
    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final EventRepository eventRepository;
    
    /**
     * Récupérer les règles actives de délibération pour un type d'événement
     */
    @GetMapping("/rules/{eventType}")
    @Operation(summary = "Get active deliberation rules", 
               description = "Get deliberation rules for the institution for a specific event type")
    public ResponseEntity<?> getActiveRules(
            Authentication authentication,
            @PathVariable String eventType) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            if (user.getInstitution() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not associated with an institution");
            }
            
            EventType type = EventType.valueOf(eventType.toUpperCase());
            Optional<DeliberationRule> ruleOpt = ruleRepository.findByInstitutionIdAndEventTypeAndIsActiveTrue(
                    user.getInstitution().getId(), type);
            
            if (ruleOpt.isPresent()) {
                return ResponseEntity.ok(java.util.Collections.singletonList(ruleOpt.get()));
            } else {
                return ResponseEntity.ok(java.util.Collections.emptyList());
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * Récupérer les règles précédentes pour proposer lors de création d'un nouvel événement
     */
    @GetMapping("/previous-rules/{eventType}")
    @Operation(summary = "Get previous deliberation rules",
               description = "Get previous rules to propose for future events")
    public ResponseEntity<?> getPreviousRules(
            Authentication authentication,
            @PathVariable String eventType) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            if (user.getInstitution() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not associated with an institution");
            }
            
            EventType type = EventType.valueOf(eventType.toUpperCase());
            List<DeliberationRule> previousRules = ruleService.getPreviousRulesForProposal(
                    user.getInstitution().getId(), type);
            
            return ResponseEntity.ok(previousRules);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * Créer une nouvelle règle de délibération
     */
    @PostMapping("/rules/create")
    @Operation(summary = "Create deliberation rule", description = "Create a new deliberation rule for the institution")
    public ResponseEntity<?> createRule(
            Authentication authentication,
            @RequestBody DeliberationRuleRequest request) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            if (user.getInstitution() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not associated with an institution");
            }
            
            DeliberationRule newRule = ruleService.createRule(
                    user.getInstitution(),
                    request.getEventType(),
                    request.getRuleName(),
                    request.getPassingScore(),
                    request.getMinAverage(),
                    request.getMaxWaitlistPercentage(),
                    request.getUseWeightedAverage(),
                    request.getRankingAlgorithm()
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(newRule);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * Dupliquer une règle précédente
     */
    @PostMapping("/rules/duplicate/{previousRuleId}")
    @Operation(summary = "Duplicate previous rule",
               description = "Create a new rule by duplicating a previous one")
    public ResponseEntity<?> duplicateRule(
            Authentication authentication,
            @PathVariable Long previousRuleId,
            @RequestParam String newRuleName) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            if (user.getInstitution() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not associated with an institution");
            }
            
            DeliberationRule newRule = deliberationService.duplicatePreviousRule(
                    user.getInstitution().getId(), previousRuleId, newRuleName);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(newRule);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * Deliberer un concours - calculer les résultats et classements
     */
    @PostMapping("/deliberate-contest/{eventId}")
    @Operation(summary = "Deliberate contest results",
               description = "Process exam scores and apply deliberation rules for a contest")
    public ResponseEntity<?> deliberateContest(
            Authentication authentication,
            @PathVariable Long eventId,
            @RequestBody List<ExamScore> examScores) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));
            
            if (!event.getInstitution().getId().equals(user.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }
            
            DeliberationResult result = deliberationService.deliberateContest(eventId, examScores);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * Classer les résultats
     */
    @GetMapping("/classify-results/{eventId}")
    @Operation(summary = "Classify results",
               description = "Classify exam results into acceptance categories")
    public ResponseEntity<?> classifyResults(
            Authentication authentication,
            @PathVariable Long eventId) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));
            
            if (!event.getInstitution().getId().equals(user.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }
            
            if (event.getDeliberationRule() == null) {
                return ResponseEntity.badRequest().body("No deliberation rule assigned to this event");
            }
            
            ClassificationService.ClassificationResult classification = 
                    classificationService.classifyResults(eventId, event.getDeliberationRule());
            
            return ResponseEntity.ok(classification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * Classer par tranches de notes
     */
    @GetMapping("/classify-by-brackets/{eventId}")
    @Operation(summary = "Classify by score brackets",
               description = "Classify results into score brackets (excellent, good, pass, fail, etc.)")
    public ResponseEntity<?> classifyByBrackets(
            Authentication authentication,
            @PathVariable Long eventId) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));
            
            if (!event.getInstitution().getId().equals(user.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }
            
            ClassificationService.ScoreBracketClassification classification =
                    classificationService.classifyByScoreBrackets(eventId);
            
            return ResponseEntity.ok(classification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * Request DTO pour création de règle
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class DeliberationRuleRequest {
        private EventType eventType;
        private String ruleName;
        private Double passingScore;
        private Double minAverage;
        private Integer maxWaitlistPercentage;
        private Boolean useWeightedAverage;
        private String rankingAlgorithm;
    }
}
