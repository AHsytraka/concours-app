package com.example.Inscription.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Stores relever de notes (academic records) for students per Baccalauréat series
 * Students can have multiple uploads for different series they obtained
 */
@Entity
@Table(name = "student_releve_de_notes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "bac_series"})
})
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentReleveDeNotes {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password", "releveDeNotes"})
    private User student;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "bac_series")
    private BacSeries bacSeries;
    
    @Column(nullable = false)
    @Lob
    private byte[] fileContent;
    
    @Column(nullable = false)
    private String filename;
    
    @Column(name = "file_type")
    private String fileType; // e.g., "application/pdf", "image/jpeg"
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "upload_date", nullable = false)
    private LocalDateTime uploadDate;
    
    @Column(name = "verified", nullable = false)
    private Boolean verified = false;
    
    @Column(name = "verified_by")
    private String verifiedBy; // Email of admin who verified
    
    @Column(name = "verified_date")
    private LocalDateTime verifiedDate;
    
    @Column(columnDefinition = "TEXT")
    private String verificationNotes;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (uploadDate == null) {
            uploadDate = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
