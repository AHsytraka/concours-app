package com.example.Inscription.service.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.Inscription.model.User;
import java.util.Map;

/**
 * DTO représentant les notes d'un examen pour un étudiant
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamScore {
    private Long userId;
    private User user;
    private Double totalScore; // Score total brut
    private Map<String, Double> scores; // Map subject name -> score
}
