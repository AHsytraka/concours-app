package com.example.Inscription.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "events")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType eventType;
    
    @ManyToOne(optional = false)
    @JoinColumn(name = "institution_id")
    private Institution institution;
    
    @Column(name = "registration_start", nullable = false)
    private LocalDateTime registrationStart;
    
    @Column(name = "registration_end", nullable = false)
    private LocalDateTime registrationEnd;
    
    @Column(name = "contest_date")
    private LocalDateTime contestDate;
    
    @Column(name = "contest_end_date")
    private LocalDateTime contestEndDate;
    
    @Column(name = "results_date")
    private LocalDateTime resultsDate;
    
    @Column(name = "decree_file")
    private byte[] decreeFile;
    
    @Column(name = "decree_filename")
    private String decreeFilename;
    
    @Column(name = "is_decree_verified", nullable = false)
    private Boolean isDecreeVerified = false;
    
    @ElementCollection
    @CollectionTable(name = "event_eligible_series", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "bac_series")
    @Enumerated(EnumType.STRING)
    private Set<BacSeries> eligibleSeries = new HashSet<>();
    
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private Set<Subject> subjects = new HashSet<>();
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "registration_form_id")
    private RegistrationForm registrationForm;
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "summons_template_id")
    private SummonsTemplate summonsTemplate;
    
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private Set<EventRegistration> registrations = new HashSet<>();
    
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private Set<RegistrationNumber> registrationNumbers = new HashSet<>();
    
    @ManyToOne
    @JoinColumn(name = "deliberation_rule_id")
    private DeliberationRule deliberationRule;
    
    @ElementCollection
    @CollectionTable(name = "event_locations", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "location")
    private List<String> locations = new ArrayList<>();
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
