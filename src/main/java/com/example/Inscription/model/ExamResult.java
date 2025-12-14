package com.example.Inscription.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_results")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExamResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne(optional = false)
    @JoinColumn(name = "event_id")
    private Event event;
    
    @Column(name = "exam_date")
    private LocalDateTime examDate;
    
    @Column(name = "score_data")
    private String scoreData; // JSON format {subjectId: score, ...}
    
    @Column(nullable = false)
    private Double totalScore;
    
    @Column(nullable = false)
    private Double average;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResultStatus resultStatus;
    
    @Column(name = "ranking")
    private Integer ranking;
    
    @Column(name = "is_on_waitlist", nullable = false)
    private Boolean isOnWaitlist = false;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
