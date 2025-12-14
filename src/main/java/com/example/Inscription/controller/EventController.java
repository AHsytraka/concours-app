package com.example.Inscription.controller;

import com.example.Inscription.model.*;
import com.example.Inscription.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Public Events Controller
 */
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Tag(name = "Events", description = "Public event endpoints")
public class EventController {
    
    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final ExamResultRepository examResultRepository;
    
    @GetMapping("/active")
    @Operation(summary = "Get active events", description = "Get list of events currently open for registration")
    public ResponseEntity<List<Event>> getActiveEvents() {
        List<Event> events = eventRepository.findByIsActiveTrue();
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/by-institution/{institutionId}")
    @Operation(summary = "Get events by institution", description = "Get all events for a specific institution")
    public ResponseEntity<List<Event>> getEventsByInstitution(@PathVariable Long institutionId) {
        List<Event> events = eventRepository.findByInstitutionId(institutionId);
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/{eventId}")
    @Operation(summary = "Get event details", description = "Get detailed information about an event")
    public ResponseEntity<?> getEventDetails(@PathVariable Long eventId) {
        return eventRepository.findById(eventId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{eventId}/registration-count")
    @Operation(summary = "Get registration count", description = "Get number of registrations for an event")
    public ResponseEntity<?> getRegistrationCount(@PathVariable Long eventId) {
        long count = registrationRepository.findByEventId(eventId).size();
        return ResponseEntity.ok("Total registrations: " + count);
    }

    @GetMapping("/{eventId}/results")
    @Operation(summary = "Get event results", description = "Get published results for an event")
    public ResponseEntity<?> getEventResults(@PathVariable Long eventId) {
        Event event = eventRepository.findById(eventId).orElse(null);
        if (event == null) {
            return ResponseEntity.notFound().build();
        }

        // Only return results if they've been published
        if (event.getResultsDate() == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<ExamResult> results = examResultRepository.findByEventIdOrderByAverageDesc(eventId);
        List<Map<String, Object>> resultDtos = results.stream().map(r -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", r.getId());
            dto.put("rank", r.getRanking());
            dto.put("average", r.getAverage());
            dto.put("status", mapResultStatus(r.getResultStatus()));
            
            if (r.getUser() != null) {
                Map<String, Object> user = new HashMap<>();
                user.put("firstName", r.getUser().getFirstName());
                user.put("lastName", r.getUser().getLastName());
                dto.put("user", user);
            }
            
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(resultDtos);
    }

    private String mapResultStatus(ResultStatus status) {
        if (status == null) return "pending";
        if (status == ResultStatus.PASSED) return "admitted";
        if (status == ResultStatus.WAITING_LIST) return "waitlist";
        if (status == ResultStatus.FAILED) return "rejected";
        return "pending";
    }
}
