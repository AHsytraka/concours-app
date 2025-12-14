package com.example.Inscription.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "deliberation_rules")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeliberationRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(optional = false)
    @JoinColumn(name = "institution_id")
    private Institution institution;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType eventType; // CONTEST or SELECTION
    
    @Column(nullable = false)
    private String ruleName; // e.g., "Règles Concours 2024-2025"
    
    @Column(nullable = false)
    private Double passingScore = 10.0; // Note minimale pour réussir (ex: 10/20)
    
    @Column(nullable = false)
    private Double minAverage = 10.0; // Moyenne minimale requise
    
    @Column(nullable = false)
    private Integer maxWaitlistPercentage = 20; // % d'étudiants en liste d'attente
    
    @Column(name = "use_weighted_average", nullable = false)
    private Boolean useWeightedAverage = true; // Utiliser les coefficients
    
    @Column(name = "ranking_algorithm")
    private String rankingAlgorithm = "AVERAGE_DESC"; // AVERAGE_DESC, SCORE_DESC, CUSTOM
    
    @Column(name = "custom_criteria")
    private String customCriteria; // JSON pour critères personnalisés
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // Pour les sélections de dossiers
    @Column(name = "selection_criteria")
    private String selectionCriteria; // JSON avec critères d'évaluation des dossiers
    
    @Column(name = "min_selection_score")
    private Double minSelectionScore = 50.0; // Score minimum pour sélection (%)
}
