package com.example.Inscription.controller;

import com.example.Inscription.model.*;
import com.example.Inscription.repository.*;
import com.example.Inscription.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Public Events Controller
 */
@RestController
@RequestMapping("/api/institution/events")
@RequiredArgsConstructor
@Tag(name = "Institution Events", description = "Institution-managed event endpoints")
public class EventManagementController {
    
    private final EventRepository eventRepository;
    private final EventService eventService;
    private final EventRegistrationRepository registrationRepository;
    
    @GetMapping("/active")
    @Operation(summary = "Get active events", description = "Get list of events currently open for registration")
    public ResponseEntity<List<Event>> getActiveEvents() {
        List<Event> events = eventService.getActiveEvents();
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
}
