package com.example.Inscription.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_event_registrations")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentEventRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"eventRegistrations", "institution", "password"})
    private User user;
    
    @ManyToOne(optional = false)
    @JoinColumn(name = "event_id")
    @JsonIgnoreProperties({"registrations", "registrationNumbers"})
    private Event event;
    
    @ManyToOne
    @JoinColumn(name = "releve_de_notes_id")
    @JsonIgnoreProperties({"student", "fileContent"})
    private StudentReleveDeNotes releveDeNotesRecord;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "bac_series_used")
    private BacSeries bacSeriesUsed; // Which Bac series was used for this registration
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus status = RegistrationStatus.PENDING;
    
    // Releve de note (transcript file)
    @Column(name = "releve_de_note_file")
    private byte[] releveDeNoteFile;
    
    @Column(name = "releve_de_note_filename")
    private String releveDeNoteFilename;
    
    // Bordereau de versement (payment receipt)
    @Column(name = "bordereau_file")
    private byte[] bordereauFile;
    
    @Column(name = "bordereau_filename")
    private String bordereauFilename;
    
    // Numero du bordereau (payment reference number) - REQUIRED FIELD
    @Column(name = "numero_bordereau", nullable = false)
    private String numeroBordereau;
    
    @Column(name = "is_releve_verified", nullable = false)
    private Boolean isReleveVerified = false;
    
    @Column(name = "is_bordereau_verified", nullable = false)
    private Boolean isBordereauVerified = false;
    
    @Column(name = "is_eligible", nullable = false)
    private Boolean isEligible = false; // Verified that student has correct bac series
    
    @Column(name = "is_convocation_sent", nullable = false)
    private Boolean isConvocationSent = false;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
