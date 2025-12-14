package com.example.Inscription.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "registration_form_fields")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationFormField {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String fieldName;
    
    @Column(nullable = false)
    private String fieldLabel;
    
    @Column
    private String fieldType; // text, email, number, date, select, textarea
    
    @Column(nullable = false)
    private Boolean isRequired = true;
    
    @Column(nullable = false)
    private Boolean isAutoFilled = false;
    
    @Column(name = "auto_filled_from")
    private String autoFilledFrom; // firstName, lastName, email, etc.
    
    @Column(name = "field_order")
    private Integer fieldOrder;
    
    @ManyToOne(optional = false)
    @JoinColumn(name = "registration_form_id")
    private RegistrationForm registrationForm;
}
