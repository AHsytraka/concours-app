package com.example.Inscription.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for event registration
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventRegistrationRequest {
    private Long eventId;
    private String formData;
}
