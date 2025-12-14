package com.example.Inscription.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "users")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @Column(unique = true)
    private String cin;
    
    @Column(name = "birth_date")
    private String birthDate;
    
    @Column(name = "birth_place")
    private String birthPlace;
    
    @Column(name = "phone")
    private String phone;
    
    @Column(name = "address")
    private String address;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "bac_series")
    private BacSeries bacSeries;
    
    @Column(name = "bac_year")
    private Integer bacYear;
    
    @Column(name = "bac_entries", columnDefinition = "TEXT")
    private String bacEntries;
    
    @Column(name = "high_school")
    private String highSchool;
    
    @Column(name = "average_grade")
    private Double averageGrade;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @ManyToOne
    @JoinColumn(name = "institution_id")
    private Institution institution;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<EventRegistration> eventRegistrations = new HashSet<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<ExamResult> examResults = new HashSet<>();
}
