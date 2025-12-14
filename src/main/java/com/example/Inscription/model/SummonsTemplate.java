package com.example.Inscription.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "summons_templates")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SummonsTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(mappedBy = "summonsTemplate")
    private Event event;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String templateContent; // HTML template
    
    @Column
    private String subject = "Convocation - Inscription Confirmée";
}
