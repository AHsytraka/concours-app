package com.example.Inscription.controller;

import com.example.Inscription.model.*;
import com.example.Inscription.repository.*;
import com.example.Inscription.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Institution Administration Controller
 */
@RestController
@RequestMapping("/api/institution/admin")
@RequiredArgsConstructor
@Tag(name = "Institution Admin", description = "Institution administration endpoints")
@SecurityRequirement(name = "bearerAuth")
public class InstitutionAdminController {
    
    private final EventService eventService;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    
    @PostMapping("/create-event")
    @Operation(summary = "Create event from decree", description = "Create a new event by uploading institutional decree")
    public ResponseEntity<?> createEventFromDecree(
            Authentication authentication,
            @RequestParam("decreeFile") MultipartFile decreeFile) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            if (user.getInstitution() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not associated with an institution");
            }
            
            Event event = eventService.createEventFromDecree(
                    user.getInstitution().getId(),
                    decreeFile.getBytes(),
                    decreeFile.getOriginalFilename()
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(event);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/my-events")
    @Operation(summary = "Get institution events", description = "Get all events for my institution")
    public ResponseEntity<?> getMyInstitutionEvents(Authentication authentication) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            if (user.getInstitution() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not associated with an institution");
            }
            
            List<Event> events = eventRepository.findByInstitutionId(user.getInstitution().getId());
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/event/{eventId}/registrations")
    @Operation(summary = "Get event registrations", description = "Get all registrations for an event")
    public ResponseEntity<?> getEventRegistrations(
            Authentication authentication,
            @PathVariable Long eventId) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));
            
            if (!event.getInstitution().getId().equals(user.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }
            
            List<EventRegistration> registrations = registrationRepository.findByEventId(eventId);
            return ResponseEntity.ok(registrations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/event/{eventId}/close-registrations")
    @Operation(summary = "Close registrations", description = "Close registration period for an event")
    public ResponseEntity<?> closeRegistrations(
            Authentication authentication,
            @PathVariable Long eventId) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));
            
            if (!event.getInstitution().getId().equals(user.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }
            
            eventService.closeRegistrations(eventId);
            return ResponseEntity.ok("Registrations closed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
