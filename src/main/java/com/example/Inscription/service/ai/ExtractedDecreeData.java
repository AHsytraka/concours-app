package com.example.Inscription.service.ai;

import lombok.Data;
import com.example.Inscription.model.*;
import java.time.LocalDateTime;
import java.util.*;

@Data
public class ExtractedDecreeData {
    private String decreeNumber;
    private LocalDateTime decreeDate;
    private EventType eventType;
    private String institutionName;
    private Set<BacSeries> eligibleSeries = new HashSet<>();
    private LocalDateTime registrationStartDate;
    private LocalDateTime registrationEndDate;
    private LocalDateTime contestDate; // Optional, only for contests
    private String eventTitle;
    private String eventDescription;
    private Boolean isValid = false;
}
