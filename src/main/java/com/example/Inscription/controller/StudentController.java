package com.example.Inscription.controller;

import com.example.Inscription.model.*;
import com.example.Inscription.repository.*;
import com.example.Inscription.service.StudentEventRegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

/**
 * Student Profile Controller
 */
@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@Tag(name = "Student", description = "Student profile and data endpoints")
@SecurityRequirement(name = "bearerAuth")
public class StudentController {
    
    private final UserRepository userRepository;
    private final InscriptionRepository inscriptionRepository;
    private final DocumentRepository documentRepository;
    private final StudentEventRegistrationService studentEventRegistrationService;
    private final EventRepository eventRepository;
    
    @GetMapping("/profile")
    @Operation(summary = "Get student profile", description = "Get current student's profile information")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            Map<String, Object> profile = new HashMap<>();
            profile.put("id", user.getId());
            profile.put("email", user.getEmail());
            profile.put("firstName", user.getFirstName());
            profile.put("lastName", user.getLastName());
            profile.put("cin", user.getCin());
            profile.put("phone", user.getPhone());
            profile.put("birthDate", user.getBirthDate());
            profile.put("birthPlace", user.getBirthPlace());
            profile.put("address", user.getAddress());
            profile.put("bacEntries", user.getBacEntries());
            profile.put("bacSeries", user.getBacSeries());
            profile.put("bacYear", user.getBacYear());
            profile.put("highSchool", user.getHighSchool());
            profile.put("averageGrade", user.getAverageGrade());
            profile.put("createdAt", user.getCreatedAt());
            
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/transcript")
    @Operation(summary = "Get student transcript", description = "Get student's uploaded transcript/relevé de notes")
    public ResponseEntity<?> getTranscript(Authentication authentication) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            // Check if user has transcript stored directly
            if (user.getTranscriptFile() != null && user.getTranscriptFile().length > 0) {
                return ResponseEntity.ok()
                        .header("Content-Disposition", "inline; filename=\"" + user.getTranscriptFilename() + "\"")
                        .header("Content-Type", getContentType(user.getTranscriptFilename()))
                        .body(user.getTranscriptFile());
            }
            
            return ResponseEntity.ok(Map.of("message", "No transcript found"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/transcript/info")
    @Operation(summary = "Get student transcript info", description = "Get info about student's uploaded transcript")
    public ResponseEntity<?> getTranscriptInfo(Authentication authentication) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            if (user.getTranscriptFile() != null && user.getTranscriptFile().length > 0) {
                Map<String, Object> result = new HashMap<>();
                result.put("hasTranscript", true);
                result.put("fileName", user.getTranscriptFilename());
                result.put("url", "/api/student/transcript");
                return ResponseEntity.ok(result);
            }
            
            return ResponseEntity.ok(Map.of("hasTranscript", false, "message", "No transcript found"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/transcript")
    @Operation(summary = "Upload student transcript", description = "Upload or update student's transcript/relevé de notes")
    public ResponseEntity<?> uploadTranscript(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            user.setTranscriptFile(file.getBytes());
            user.setTranscriptFilename(file.getOriginalFilename());
            userRepository.save(user);
            
            return ResponseEntity.ok(Map.of(
                "message", "Transcript uploaded successfully",
                "fileName", file.getOriginalFilename()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    private String getContentType(String filename) {
        if (filename == null) return "application/octet-stream";
        String lower = filename.toLowerCase();
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".gif")) return "image/gif";
        return "application/octet-stream";
    }
    
    @PutMapping("/profile")
    @Operation(summary = "Update student profile", description = "Update current student's profile information")
    public ResponseEntity<?> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, Object> updates) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            // Update allowed fields
            if (updates.containsKey("phone")) {
                user.setPhone((String) updates.get("phone"));
            }
            if (updates.containsKey("address")) {
                user.setAddress((String) updates.get("address"));
            }
            
            userRepository.save(user);
            
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    // ==================== EVENT REGISTRATION ENDPOINTS ====================
    
    @GetMapping("/available-events")
    @Operation(summary = "Get available events for student", description = "Get list of available concours/events filtered by student's bac series")
    public ResponseEntity<?> getAvailableEvents(Authentication authentication) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            List<Event> events = eventRepository.findAll();
            List<Map<String, Object>> result = new java.util.ArrayList<>();
            
            for (Event event : events) {
                if (event.getIsActive() && !event.getContestDate().isBefore(LocalDateTime.now())) {
                    Map<String, Object> eventMap = new HashMap<>();
                    eventMap.put("id", event.getId());
                    eventMap.put("title", event.getTitle());
                    eventMap.put("description", event.getDescription());
                    eventMap.put("level", event.getLevel());
                    eventMap.put("registrationStart", event.getRegistrationStart());
                    eventMap.put("registrationEnd", event.getRegistrationEnd());
                    eventMap.put("contestDate", event.getContestDate());
                    eventMap.put("locations", event.getLocations());
                    eventMap.put("maxAdmissions", event.getMaxAdmissions());
                    eventMap.put("eligibleSeries", event.getEligibleSeries());
                    eventMap.put("registrationsOpen", event.getRegistrationsOpen());
                    
                    boolean isEligible = isStudentEligibleForEvent(user, event);
                    eventMap.put("isEligible", isEligible);
                    
                    result.add(eventMap);
                }
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/events/{eventId}/register")
    @Operation(summary = "Register student for event", description = "Register student for a concours with document uploads")
    public ResponseEntity<?> registerForEvent(
            Authentication authentication,
            @PathVariable Long eventId,
            @RequestParam("numeroBordereau") String numeroBordereau,
            @RequestParam("releveFile") MultipartFile releveFile,
            @RequestParam("bordereauFile") MultipartFile bordereauFile) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));
            
            // Validate file types
            if (!isValidFileType(releveFile.getContentType())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid releve de note file type. Must be PDF, JPG, or PNG"));
            }
            if (!isValidFileType(bordereauFile.getContentType())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid bordereau file type. Must be PDF, JPG, or PNG"));
            }
            
            // Validate numeroBordereau
            if (numeroBordereau == null || numeroBordereau.trim().length() < 3) {
                return ResponseEntity.badRequest().body(Map.of("message", "Numero bordereau must be at least 3 characters"));
            }
            
            // Register student for event
            StudentEventRegistration registration = new StudentEventRegistration();
            registration.setUser(user);
            registration.setEvent(event);
            registration.setNumeroBordereau(numeroBordereau);
            registration.setReleveDeNoteFile(releveFile.getBytes());
            registration.setReleveDeNoteFilename(releveFile.getOriginalFilename());
            registration.setBordereauFile(bordereauFile.getBytes());
            registration.setBordereauFilename(bordereauFile.getOriginalFilename());
            registration.setStatus(RegistrationStatus.PENDING);
            registration.setIsEligible(isStudentEligibleForEvent(user, event));
            registration.setCreatedAt(LocalDateTime.now());
            
            StudentEventRegistration saved = studentEventRegistrationService.registerForEvent(registration);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration submitted successfully");
            response.put("registrationId", saved.getId());
            response.put("status", saved.getStatus());
            
            return ResponseEntity.ok(response);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error registering for event: " + e.getMessage()));
        }
    }
    
    @GetMapping("/event-registrations")
    @Operation(summary = "Get student's event registrations", description = "Get list of all events student has registered for")
    public ResponseEntity<?> getStudentRegistrations(Authentication authentication) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            List<StudentEventRegistration> registrations = studentEventRegistrationService.getStudentRegistrations(user.getId());
            List<Map<String, Object>> result = new java.util.ArrayList<>();
            
            for (StudentEventRegistration reg : registrations) {
                Map<String, Object> regMap = new HashMap<>();
                regMap.put("id", reg.getId());
                regMap.put("eventId", reg.getEvent().getId());
                regMap.put("eventTitle", reg.getEvent().getTitle());
                regMap.put("eventDate", reg.getEvent().getContestDate());
                regMap.put("status", reg.getStatus());
                regMap.put("isEligible", reg.getIsEligible());
                regMap.put("isReleveVerified", reg.getIsReleveVerified());
                regMap.put("isBordereauVerified", reg.getIsBordereauVerified());
                regMap.put("isConvocationSent", reg.getIsConvocationSent());
                regMap.put("createdAt", reg.getCreatedAt());
                result.add(regMap);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/event-registrations/{registrationId}")
    @Operation(summary = "Get registration details", description = "Get details of a specific event registration")
    public ResponseEntity<?> getRegistrationDetails(
            Authentication authentication,
            @PathVariable Long registrationId) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            StudentEventRegistration registration = studentEventRegistrationService.getRegistrationById(registrationId);
            
            // Verify ownership
            if (!registration.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", registration.getId());
            response.put("eventId", registration.getEvent().getId());
            response.put("eventTitle", registration.getEvent().getTitle());
            response.put("status", registration.getStatus());
            response.put("numeroBordereau", registration.getNumeroBordereau());
            response.put("isEligible", registration.getIsEligible());
            response.put("isReleveVerified", registration.getIsReleveVerified());
            response.put("isBordereauVerified", registration.getIsBordereauVerified());
            response.put("isConvocationSent", registration.getIsConvocationSent());
            response.put("createdAt", registration.getCreatedAt());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    // ==================== HELPER METHODS ====================
    
    private boolean isStudentEligibleForEvent(User user, Event event) {
        if (event.getEligibleSeries() == null || event.getEligibleSeries().isEmpty()) {
            return true; // No series restriction
        }
        return event.getEligibleSeries().contains(user.getBacSeries());
    }
    
    private boolean isValidFileType(String contentType) {
        if (contentType == null) return false;
        return contentType.equals("application/pdf") ||
                contentType.equals("image/jpeg") ||
                contentType.equals("image/png");
    }
}
