package com.example.Inscription.service.ai;

import lombok.Data;

@Data
public class DeliberationResult {
    private Boolean isPassed;
    private Double totalScore;
    private Double average;
    private Integer ranking;
    private Boolean isOnWaitlist = false;
    private String details;
    private Integer totalProcessed;
    private Integer totalPassed;
    private Integer totalFailed;
}
