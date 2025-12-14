package com.example.Inscription.service.ai;

import lombok.Data;

@Data
public class SelectionResult {
    private Boolean isPassed;
    private Integer ranking;
    private Boolean isOnWaitlist = false;
    private Double scorePercentage;
    private String evaluationDetails;
}
