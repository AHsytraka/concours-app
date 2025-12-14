package com.example.Inscription.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "institutions")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Institution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column
    private String acronym;
    
    @Column
    private String type;
    
    @Column(name = "registration_number")
    private String registrationNumber;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column
    private String address;
    
    @Column
    private String city;
    
    @Column
    private String country;
    
    @Column
    private String phoneNumber;
    
    @Column
    private String email;
    
    @Column
    private String website;
    
    @Column
    private String logo;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @OneToMany(mappedBy = "institution", cascade = CascadeType.ALL)
    private Set<User> users = new HashSet<>();
    
    @OneToMany(mappedBy = "institution", cascade = CascadeType.ALL)
    private Set<Event> events = new HashSet<>();
}
