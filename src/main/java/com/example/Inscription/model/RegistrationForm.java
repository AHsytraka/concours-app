package com.example.Inscription.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Table(name = "registration_forms")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationForm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(mappedBy = "registrationForm")
    private Event event;
    
    @OneToMany(mappedBy = "registrationForm", cascade = CascadeType.ALL)
    private Set<RegistrationFormField> fields = new HashSet<>();
}
