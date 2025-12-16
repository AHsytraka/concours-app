package com.example.Inscription.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "grade_entries", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"event_id", "subject_id", "user_id"})
})
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GradeEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(optional = false)
    @JoinColumn(name = "event_id")
    private Event event;
    
    @ManyToOne(optional = false)
    @JoinColumn(name = "subject_id")
    private Subject subject;
    
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User subaccount; // The subaccount that entered the grades
    
    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id")
    private User student; // The student who took the exam
    
    @Column(nullable = false)
    private Double score; // The grade/score out of 20
    
    @Column(name = "status", nullable = false)
    private String status = "SUBMITTED"; // SUBMITTED, VERIFIED, REJECTED
    
    @Column(name = "verified_by")
    private Long verifiedByUserId; // The university admin who verified
    
    @Column(columnDefinition = "TEXT")
    private String verificationNotes; // Notes from verification
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @Column
    private LocalDateTime verifiedAt;
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
