package com.example.Inscription.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for student registration with academic data
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentRegistrationRequest {
    private String firstName;
    private String lastName;
    private String cin;
    private String email;
    private String password;
    private String passwordConfirm;
    private String bacSeries;
    private Integer bacYear;
}
