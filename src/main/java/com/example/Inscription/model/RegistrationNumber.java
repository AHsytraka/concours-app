package com.example.Inscription.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "registration_numbers")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationNumber {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(optional = false)
    @JoinColumn(name = "event_id")
    private Event event;
    
    @OneToOne(optional = true)
    @JoinColumn(name = "event_registration_id")
    private EventRegistration eventRegistration;
    
    @Column(nullable = false, unique = true)
    private String registrationNumber;
    
    @Column(nullable = false)
    private Boolean isUsed = false;
    
    @Column(name = "custom_format")
    private String customFormat; // e.g., "INST-2025-{number}"
}
