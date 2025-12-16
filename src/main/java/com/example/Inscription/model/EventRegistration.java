package com.example.Inscription.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_registrations")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"registrations", "institution", "password"})
    private User user;
    
    @ManyToOne(optional = false)
    @JoinColumn(name = "event_id")
    @JsonIgnoreProperties({"registrations", "registrationNumbers"})
    private Event event;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus status = RegistrationStatus.PENDING;
    
    @Column(name = "registration_number")
    private String registrationNumber;
    
    @Column(name = "form_data")
    private String formData; // JSON format
    
    @Column(name = "payment_receipt_file")
    private byte[] paymentReceiptFile;
    
    @Column(name = "payment_receipt_filename")
    private String paymentReceiptFilename;
    
    @Column(name = "payment_reference")
    private String paymentReference;
    
    @Column(name = "is_payment_verified", nullable = false)
    private Boolean isPaymentVerified = false;
    
    @Column(name = "is_form_completed", nullable = false)
    private Boolean isFormCompleted = false;
    
    @Column(name = "is_summons_sent", nullable = false)
    private Boolean isSummonsSent = false;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
