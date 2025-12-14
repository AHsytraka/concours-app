package com.example.Inscription.controller;

import com.example.Inscription.model.*;
import com.example.Inscription.repository.*;
import com.example.Inscription.service.EventService;
import com.example.Inscription.service.MailService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Main Institution Controller for university dashboard features
 */
@RestController
@RequestMapping("/api/institution")
@RequiredArgsConstructor
@Tag(name = "Institution", description = "Institution management endpoints")
@SecurityRequirement(name = "bearerAuth")
@Slf4j
public class InstitutionController {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final ExamResultRepository examResultRepository;
    private final SubjectRepository subjectRepository;
    private final EventService eventService;
    private final MailService mailService;
    private final ObjectMapper objectMapper;

    // ==================== PROFILE ====================

    @GetMapping("/profile")
    @Operation(summary = "Get institution profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            Institution institution = user.getInstitution();
            
            if (institution == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not associated with an institution");
            }

            Map<String, Object> profile = new HashMap<>();
            profile.put("id", institution.getId());
            profile.put("name", institution.getName());
            profile.put("email", institution.getEmail());
            profile.put("phone", institution.getPhoneNumber());
            profile.put("address", institution.getAddress());
            profile.put("website", institution.getWebsite());
            profile.put("description", institution.getDescription());
            profile.put("logo", institution.getLogo());

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            log.error("Error fetching profile", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/profile")
    @Operation(summary = "Update institution profile")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody Map<String, Object> data) {
        try {
            User user = getCurrentUser(authentication);
            Institution institution = user.getInstitution();
            
            if (institution == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not associated with an institution");
            }

            if (data.containsKey("name")) institution.setName((String) data.get("name"));
            if (data.containsKey("email")) institution.setEmail((String) data.get("email"));
            if (data.containsKey("phone")) institution.setPhoneNumber((String) data.get("phone"));
            if (data.containsKey("address")) institution.setAddress((String) data.get("address"));
            if (data.containsKey("website")) institution.setWebsite((String) data.get("website"));
            if (data.containsKey("description")) institution.setDescription((String) data.get("description"));

            institutionRepository.save(institution);
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        } catch (Exception e) {
            log.error("Error updating profile", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== STATISTICS ====================

    @GetMapping("/statistics")
    @Operation(summary = "Get institution statistics")
    public ResponseEntity<?> getStatistics(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            Institution institution = user.getInstitution();
            
            if (institution == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not associated with an institution");
            }

            List<Event> events = eventRepository.findByInstitutionId(institution.getId());
            List<EventRegistration> allRegistrations = new ArrayList<>();
            
            for (Event event : events) {
                allRegistrations.addAll(registrationRepository.findByEventId(event.getId()));
            }

            long activeEvents = events.stream()
                    .filter(e -> e.getIsActive() && 
                            e.getRegistrationEnd() != null && 
                            e.getRegistrationEnd().isAfter(LocalDateTime.now()))
                    .count();

            long pendingValidations = allRegistrations.stream()
                    .filter(r -> r.getStatus() == RegistrationStatus.PENDING)
                    .count();

            // Calculate admission rate and result counts
            List<ExamResult> results = new ArrayList<>();
            for (Event event : events) {
                results.addAll(examResultRepository.findByEventIdOrderByAverageDesc(event.getId()));
            }
            
            long passed = results.stream().filter(r -> r.getResultStatus() == ResultStatus.PASSED).count();
            long waitingList = results.stream().filter(r -> r.getResultStatus() == ResultStatus.WAITING_LIST).count();
            long failed = results.stream().filter(r -> r.getResultStatus() == ResultStatus.FAILED).count();
            
            double admissionRate = 0;
            if (!results.isEmpty()) {
                admissionRate = (double) passed / results.size() * 100;
            }

            // Calculate average score
            double averageScore = results.stream()
                    .filter(r -> r.getAverage() != null)
                    .mapToDouble(ExamResult::getAverage)
                    .average()
                    .orElse(0);

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalEvents", events.size());
            stats.put("activeEvents", activeEvents);
            stats.put("totalRegistrations", allRegistrations.size());
            stats.put("pendingValidations", pendingValidations);
            stats.put("admissionRate", Math.round(admissionRate * 10) / 10.0);
            stats.put("averageScore", Math.round(averageScore * 100) / 100.0);
            stats.put("passed", passed);
            stats.put("waitingList", waitingList);
            stats.put("failed", failed);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching statistics", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== EVENTS ====================

    @GetMapping("/events")
    @Operation(summary = "Get all events for institution")
    public ResponseEntity<?> getEvents(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            Institution institution = user.getInstitution();
            
            if (institution == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not associated with an institution");
            }

            List<Event> events = eventRepository.findByInstitutionId(institution.getId());
            List<Map<String, Object>> eventDtos = events.stream().map(this::mapEventToDto).collect(Collectors.toList());

            return ResponseEntity.ok(eventDtos);
        } catch (Exception e) {
            log.error("Error fetching events", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/events")
    @Operation(summary = "Create a new event")
    public ResponseEntity<?> createEvent(
            Authentication authentication,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("level") String level,
            @RequestParam("maxRegistrations") Integer maxRegistrations,
            @RequestParam(value = "registrationFee", required = false, defaultValue = "0") Integer registrationFee,
            @RequestParam(value = "examDate", required = false) String examDate,
            @RequestParam(value = "examEndDate", required = false) String examEndDate,
            @RequestParam("deadline") String deadline,
            @RequestParam(value = "locations", required = false) String locationsJson,
            @RequestParam(value = "eventType", required = false, defaultValue = "CONTEST") String eventType,
            @RequestParam(value = "subjects", required = false) String subjectsJson,
            @RequestParam(value = "decreeFile", required = false) MultipartFile decreeFile) {
        try {
            User user = getCurrentUser(authentication);
            Institution institution = user.getInstitution();
            
            if (institution == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not associated with an institution");
            }

            Event event = new Event();
            event.setInstitution(institution);
            event.setTitle(name);
            event.setDescription(description);
            event.setEventType(EventType.valueOf(eventType));
            event.setRegistrationStart(LocalDateTime.now());
            event.setRegistrationEnd(LocalDateTime.parse(deadline + "T23:59:59"));
            
            // Only set contest date and locations for CONTEST type
            if ("CONTEST".equals(eventType) && examDate != null && !examDate.isEmpty()) {
                event.setContestDate(LocalDateTime.parse(examDate + "T08:00:00"));
                
                // Set contest end date if provided
                if (examEndDate != null && !examEndDate.isEmpty()) {
                    event.setContestEndDate(LocalDateTime.parse(examEndDate + "T18:00:00"));
                }
                
                // Parse and set locations
                if (locationsJson != null && !locationsJson.isEmpty()) {
                    List<String> locationsList = objectMapper.readValue(locationsJson, 
                            new TypeReference<List<String>>() {});
                    event.setLocations(locationsList);
                }
            }
            
            event.setIsActive(true);
            event.setIsDecreeVerified(false);

            if (decreeFile != null && !decreeFile.isEmpty()) {
                event.setDecreeFile(decreeFile.getBytes());
                event.setDecreeFilename(decreeFile.getOriginalFilename());
            }

            Event savedEvent = eventRepository.save(event);

            // Save subjects
            if (subjectsJson != null && !subjectsJson.isEmpty()) {
                List<Map<String, Object>> subjectsList = objectMapper.readValue(subjectsJson, 
                        new TypeReference<List<Map<String, Object>>>() {});
                
                for (Map<String, Object> subjectData : subjectsList) {
                    String subjectName = (String) subjectData.get("name");
                    if (subjectName != null && !subjectName.isEmpty()) {
                        Subject subject = new Subject();
                        subject.setName(subjectName);
                        subject.setCoefficient(Double.valueOf(subjectData.get("coefficient").toString()));
                        subject.setEvent(savedEvent);
                        subjectRepository.save(subject);
                    }
                }
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(mapEventToDto(savedEvent));
        } catch (Exception e) {
            log.error("Error creating event", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/events/{eventId}")
    @Operation(summary = "Update an event")
    public ResponseEntity<?> updateEvent(
            Authentication authentication,
            @PathVariable Long eventId,
            @RequestBody Map<String, Object> data) {
        try {
            User user = getCurrentUser(authentication);
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));

            if (!event.getInstitution().getId().equals(user.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            if (data.containsKey("name")) event.setTitle((String) data.get("name"));
            if (data.containsKey("description")) event.setDescription((String) data.get("description"));
            if (data.containsKey("status")) {
                String status = (String) data.get("status");
                event.setIsActive("open".equals(status) || "draft".equals(status));
            }

            event.setUpdatedAt(LocalDateTime.now());
            eventRepository.save(event);

            return ResponseEntity.ok(mapEventToDto(event));
        } catch (Exception e) {
            log.error("Error updating event", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/events/{eventId}")
    @Operation(summary = "Delete an event")
    public ResponseEntity<?> deleteEvent(Authentication authentication, @PathVariable Long eventId) {
        try {
            User user = getCurrentUser(authentication);
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));

            if (!event.getInstitution().getId().equals(user.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            eventRepository.delete(event);
            return ResponseEntity.ok(Map.of("message", "Event deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting event", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/events/{eventId}/registrations")
    @Operation(summary = "Get registrations for an event")
    public ResponseEntity<?> getEventRegistrations(Authentication authentication, @PathVariable Long eventId) {
        try {
            User user = getCurrentUser(authentication);
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));

            if (!event.getInstitution().getId().equals(user.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            List<EventRegistration> registrations = registrationRepository.findByEventId(eventId);
            List<Map<String, Object>> registrationDtos = registrations.stream()
                    .map(this::mapRegistrationToDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(registrationDtos);
        } catch (Exception e) {
            log.error("Error fetching registrations", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== SELECTION DE DOSSIER ====================

    @GetMapping("/dossiers")
    @Operation(summary = "Get all dossiers (registrations) for review")
    public ResponseEntity<?> getAllDossiers(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            Institution institution = user.getInstitution();
            
            if (institution == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not associated with an institution");
            }

            List<Event> events = eventRepository.findByInstitutionId(institution.getId());
            List<Map<String, Object>> allDossiers = new ArrayList<>();

            for (Event event : events) {
                List<EventRegistration> registrations = registrationRepository.findByEventId(event.getId());
                for (EventRegistration registration : registrations) {
                    Map<String, Object> dossier = mapDossierToDto(registration, event);
                    allDossiers.add(dossier);
                }
            }

            return ResponseEntity.ok(allDossiers);
        } catch (Exception e) {
            log.error("Error fetching dossiers", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/events/{eventId}/dossiers")
    @Operation(summary = "Get dossiers for a specific event")
    public ResponseEntity<?> getEventDossiers(Authentication authentication, @PathVariable Long eventId) {
        try {
            User user = getCurrentUser(authentication);
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));

            if (!event.getInstitution().getId().equals(user.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            List<EventRegistration> registrations = registrationRepository.findByEventId(eventId);
            List<Map<String, Object>> dossiers = registrations.stream()
                    .map(r -> mapDossierToDto(r, event))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dossiers);
        } catch (Exception e) {
            log.error("Error fetching dossiers", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/dossiers/{registrationId}")
    @Operation(summary = "Get detailed dossier information")
    public ResponseEntity<?> getDossierDetail(Authentication authentication, @PathVariable Long registrationId) {
        try {
            User user = getCurrentUser(authentication);
            EventRegistration registration = registrationRepository.findById(registrationId)
                    .orElseThrow(() -> new IllegalArgumentException("Registration not found"));

            if (!registration.getEvent().getInstitution().getId().equals(user.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            Map<String, Object> dossier = mapDossierDetailToDto(registration);
            return ResponseEntity.ok(dossier);
        } catch (Exception e) {
            log.error("Error fetching dossier detail", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/dossiers/{registrationId}/validate")
    @Operation(summary = "Validate a dossier")
    public ResponseEntity<?> validateDossier(Authentication authentication, @PathVariable Long registrationId) {
        try {
            User user = getCurrentUser(authentication);
            EventRegistration registration = registrationRepository.findById(registrationId)
                    .orElseThrow(() -> new IllegalArgumentException("Registration not found"));

            if (!registration.getEvent().getInstitution().getId().equals(user.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            registration.setStatus(RegistrationStatus.APPROVED);
            registration.setUpdatedAt(LocalDateTime.now());
            registrationRepository.save(registration);

            return ResponseEntity.ok(Map.of("message", "Dossier validated successfully", "status", "validated"));
        } catch (Exception e) {
            log.error("Error validating dossier", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/dossiers/{registrationId}/reject")
    @Operation(summary = "Reject a dossier")
    public ResponseEntity<?> rejectDossier(
            Authentication authentication, 
            @PathVariable Long registrationId,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            User user = getCurrentUser(authentication);
            EventRegistration registration = registrationRepository.findById(registrationId)
                    .orElseThrow(() -> new IllegalArgumentException("Registration not found"));

            if (!registration.getEvent().getInstitution().getId().equals(user.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            registration.setStatus(RegistrationStatus.REJECTED);
            registration.setUpdatedAt(LocalDateTime.now());
            registrationRepository.save(registration);

            return ResponseEntity.ok(Map.of("message", "Dossier rejected successfully", "status", "rejected"));
        } catch (Exception e) {
            log.error("Error rejecting dossier", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/dossiers/{registrationId}/payment-receipt")
    @Operation(summary = "Download payment receipt")
    public ResponseEntity<?> downloadPaymentReceipt(Authentication authentication, @PathVariable Long registrationId) {
        try {
            User user = getCurrentUser(authentication);
            EventRegistration registration = registrationRepository.findById(registrationId)
                    .orElseThrow(() -> new IllegalArgumentException("Registration not found"));

            if (!registration.getEvent().getInstitution().getId().equals(user.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            if (registration.getPaymentReceiptFile() == null) {
                return ResponseEntity.notFound().build();
            }

            String filename = registration.getPaymentReceiptFilename() != null 
                    ? registration.getPaymentReceiptFilename() 
                    : "payment_receipt.pdf";

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(registration.getPaymentReceiptFile());
        } catch (Exception e) {
            log.error("Error downloading payment receipt", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private Map<String, Object> mapDossierToDto(EventRegistration registration, Event event) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", registration.getId());
        dto.put("status", registration.getStatus().toString().toLowerCase());
        dto.put("createdAt", registration.getCreatedAt());
        dto.put("registrationNumber", registration.getRegistrationNumber());
        dto.put("hasPaymentReceipt", registration.getPaymentReceiptFile() != null);
        dto.put("isPaymentVerified", registration.getIsPaymentVerified());
        dto.put("isFormCompleted", registration.getIsFormCompleted());
        
        // Event info
        Map<String, Object> eventDto = new HashMap<>();
        eventDto.put("id", event.getId());
        eventDto.put("name", event.getTitle());
        eventDto.put("deadline", event.getRegistrationEnd());
        dto.put("event", eventDto);
        
        // User info
        User user = registration.getUser();
        if (user != null) {
            Map<String, Object> userDto = new HashMap<>();
            userDto.put("id", user.getId());
            userDto.put("firstName", user.getFirstName());
            userDto.put("lastName", user.getLastName());
            userDto.put("email", user.getEmail());
            userDto.put("phone", user.getPhone());
            dto.put("user", userDto);
        }
        
        return dto;
    }

    private Map<String, Object> mapDossierDetailToDto(EventRegistration registration) {
        Map<String, Object> dto = mapDossierToDto(registration, registration.getEvent());
        
        // Add form data (parsed JSON)
        if (registration.getFormData() != null && !registration.getFormData().isEmpty()) {
            try {
                Map<String, Object> formData = objectMapper.readValue(registration.getFormData(), 
                        new TypeReference<Map<String, Object>>() {});
                dto.put("formData", formData);
            } catch (Exception e) {
                dto.put("formData", null);
            }
        }
        
        // Add payment info
        dto.put("paymentReference", registration.getPaymentReference());
        dto.put("paymentReceiptFilename", registration.getPaymentReceiptFilename());
        
        return dto;
    }

    // ==================== GRADES ====================

    @PostMapping("/events/{eventId}/grades")
    @Operation(summary = "Enter grades for an event")
    public ResponseEntity<?> enterGrades(
            Authentication authentication,
            @PathVariable Long eventId,
            @RequestBody Map<String, Map<String, Object>> grades) {
        try {
            User user = getCurrentUser(authentication);
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));

            if (!event.getInstitution().getId().equals(user.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            List<Subject> subjects = subjectRepository.findByEventId(eventId);

            for (Map.Entry<String, Map<String, Object>> entry : grades.entrySet()) {
                Long registrationId = Long.parseLong(entry.getKey());
                Map<String, Object> subjectGrades = entry.getValue();

                EventRegistration registration = registrationRepository.findById(registrationId)
                        .orElse(null);
                
                if (registration == null) continue;

                // Find or create exam result
                ExamResult result = examResultRepository.findByEventIdAndUserId(eventId, registration.getUser().getId())
                        .orElseGet(() -> {
                            ExamResult newResult = new ExamResult();
                            newResult.setEvent(event);
                            newResult.setUser(registration.getUser());
                            return newResult;
                        });

                // Calculate weighted average
                double totalWeighted = 0;
                double totalCoef = 0;

                for (Subject subject : subjects) {
                    Object gradeValue = subjectGrades.get(subject.getName());
                    if (gradeValue != null && !gradeValue.toString().isEmpty()) {
                        double grade = Double.parseDouble(gradeValue.toString());
                        totalWeighted += grade * subject.getCoefficient();
                        totalCoef += subject.getCoefficient();
                    }
                }

                if (totalCoef > 0) {
                    result.setAverage(totalWeighted / totalCoef);
                    result.setTotalScore(totalWeighted);
                }

                // Store individual grades as JSON
                result.setScoreData(objectMapper.writeValueAsString(subjectGrades));
                result.setResultStatus(ResultStatus.PENDING);
                examResultRepository.save(result);
            }

            return ResponseEntity.ok(Map.of("message", "Grades saved successfully"));
        } catch (Exception e) {
            log.error("Error saving grades", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== DELIBERATION & RESULTS ====================

    @PostMapping("/events/{eventId}/deliberate")
    @Operation(summary = "Process deliberation for an event")
    public ResponseEntity<?> deliberate(Authentication authentication, @PathVariable Long eventId) {
        try {
            User user = getCurrentUser(authentication);
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));

            if (!event.getInstitution().getId().equals(user.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            List<ExamResult> results = examResultRepository.findByEventIdOrderByAverageDesc(eventId);
            
            // Get max admissions (from event or default)
            int maxAdmissions = 100; // Default, should come from event

            int rank = 1;
            for (ExamResult result : results) {
                result.setRanking(rank);
                
                if (result.getAverage() != null && result.getAverage() >= 10) {
                    if (rank <= maxAdmissions) {
                        result.setResultStatus(ResultStatus.PASSED);
                    } else {
                        result.setResultStatus(ResultStatus.WAITING_LIST);
                    }
                } else {
                    result.setResultStatus(ResultStatus.FAILED);
                }
                
                examResultRepository.save(result);
                rank++;
            }

            return ResponseEntity.ok(Map.of("message", "Deliberation completed"));
        } catch (Exception e) {
            log.error("Error during deliberation", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/events/{eventId}/publish")
    @Operation(summary = "Publish results for an event")
    public ResponseEntity<?> publishResults(Authentication authentication, @PathVariable Long eventId) {
        try {
            User user = getCurrentUser(authentication);
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));

            if (!event.getInstitution().getId().equals(user.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            event.setResultsDate(LocalDateTime.now());
            eventRepository.save(event);

            // Send notification emails
            List<ExamResult> results = examResultRepository.findByEventIdOrderByAverageDesc(eventId);
            for (ExamResult result : results) {
                try {
                    String subject = "Résultats - " + event.getTitle();
                    String status = result.getResultStatus() == ResultStatus.PASSED ? "ADMIS" : 
                                   result.getResultStatus() == ResultStatus.WAITING_LIST ? "LISTE D'ATTENTE" : "NON ADMIS";
                    String body = String.format(
                            "Bonjour %s,\n\nLes résultats du concours \"%s\" sont disponibles.\n\n" +
                            "Votre résultat: %s\nMoyenne: %.2f/20\nRang: %d\n\n" +
                            "Cordialement,\n%s",
                            result.getUser().getFirstName(),
                            event.getTitle(),
                            status,
                            result.getAverage(),
                            result.getRanking(),
                            event.getInstitution().getName()
                    );
                    mailService.sendSimpleEmail(result.getUser().getEmail(), subject, body);
                } catch (Exception ex) {
                    log.warn("Failed to send email to {}", result.getUser().getEmail());
                }
            }

            return ResponseEntity.ok(Map.of("message", "Results published successfully"));
        } catch (Exception e) {
            log.error("Error publishing results", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== SUB-ACCOUNTS MANAGEMENT ====================

    @GetMapping("/subaccounts")
    @Operation(summary = "Get all sub-accounts for the institution")
    public ResponseEntity<?> getSubAccounts(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            Institution institution = user.getInstitution();
            
            if (institution == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not associated with an institution");
            }

            // Find all users with CONTEST_MANAGER role for this institution
            List<User> subAccounts = userRepository.findByInstitutionIdAndRole(
                    institution.getId(), 
                    UserRole.CONTEST_MANAGER
            );

            List<Map<String, Object>> result = subAccounts.stream().map(u -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", u.getId());
                dto.put("firstName", u.getFirstName());
                dto.put("lastName", u.getLastName());
                dto.put("email", u.getEmail());
                dto.put("phone", u.getPhone());
                dto.put("role", u.getRole().toString());
                dto.put("isActive", u.getIsActive());
                dto.put("createdAt", u.getCreatedAt());
                return dto;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error fetching sub-accounts", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/subaccounts")
    @Operation(summary = "Create a new sub-account (contest manager)")
    public ResponseEntity<?> createSubAccount(Authentication authentication, @RequestBody Map<String, String> data) {
        try {
            User currentUser = getCurrentUser(authentication);
            Institution institution = currentUser.getInstitution();
            
            if (institution == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not associated with an institution");
            }

            String email = data.get("email");
            String firstName = data.get("firstName");
            String lastName = data.get("lastName");
            String password = data.get("password");
            String phone = data.get("phone");

            // Validate required fields
            if (email == null || firstName == null || lastName == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Tous les champs obligatoires doivent être remplis"));
            }

            // Check if email already exists
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Cet email est déjà utilisé"));
            }

            // Create the sub-account with CONTEST_MANAGER role
            User subAccount = new User();
            subAccount.setEmail(email);
            subAccount.setFirstName(firstName);
            subAccount.setLastName(lastName);
            subAccount.setPassword(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode(password));
            subAccount.setPhone(phone);
            subAccount.setRole(UserRole.CONTEST_MANAGER);
            subAccount.setInstitution(institution);
            subAccount.setIsActive(true);
            subAccount.setCreatedAt(LocalDateTime.now());

            User saved = userRepository.save(subAccount);

            Map<String, Object> result = new HashMap<>();
            result.put("id", saved.getId());
            result.put("firstName", saved.getFirstName());
            result.put("lastName", saved.getLastName());
            result.put("email", saved.getEmail());
            result.put("phone", saved.getPhone());
            result.put("role", saved.getRole().toString());
            result.put("message", "Sous-compte créé avec succès");

            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            log.error("Error creating sub-account", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/subaccounts/{id}")
    @Operation(summary = "Update a sub-account")
    public ResponseEntity<?> updateSubAccount(
            Authentication authentication, 
            @PathVariable Long id, 
            @RequestBody Map<String, Object> data) {
        try {
            User currentUser = getCurrentUser(authentication);
            Institution institution = currentUser.getInstitution();
            
            if (institution == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not associated with an institution");
            }

            User subAccount = userRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Sub-account not found"));

            // Verify the sub-account belongs to the same institution
            if (!subAccount.getInstitution().getId().equals(institution.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            if (data.containsKey("firstName")) subAccount.setFirstName((String) data.get("firstName"));
            if (data.containsKey("lastName")) subAccount.setLastName((String) data.get("lastName"));
            if (data.containsKey("phone")) subAccount.setPhone((String) data.get("phone"));
            if (data.containsKey("isActive")) subAccount.setIsActive((Boolean) data.get("isActive"));
            
            // Password update (optional)
            if (data.containsKey("password") && data.get("password") != null && !((String) data.get("password")).isEmpty()) {
                subAccount.setPassword(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode((String) data.get("password")));
            }

            userRepository.save(subAccount);
            return ResponseEntity.ok(Map.of("message", "Sub-account updated successfully"));
        } catch (Exception e) {
            log.error("Error updating sub-account", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/subaccounts/{id}")
    @Operation(summary = "Delete a sub-account")
    public ResponseEntity<?> deleteSubAccount(Authentication authentication, @PathVariable Long id) {
        try {
            User currentUser = getCurrentUser(authentication);
            Institution institution = currentUser.getInstitution();
            
            if (institution == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not associated with an institution");
            }

            User subAccount = userRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Sub-account not found"));

            // Verify the sub-account belongs to the same institution
            if (!subAccount.getInstitution().getId().equals(institution.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            // Only delete CONTEST_MANAGER accounts
            if (subAccount.getRole() != UserRole.CONTEST_MANAGER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Cannot delete non-contest manager accounts");
            }

            userRepository.delete(subAccount);
            return ResponseEntity.ok(Map.of("message", "Sub-account deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting sub-account", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== HELPERS ====================

    private User getCurrentUser(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private Map<String, Object> mapEventToDto(Event event) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", event.getId());
        dto.put("name", event.getTitle());
        dto.put("description", event.getDescription());
        dto.put("status", determineEventStatus(event));
        dto.put("deadline", event.getRegistrationEnd());
        dto.put("examDate", event.getContestDate());
        dto.put("examEndDate", event.getContestEndDate());
        dto.put("resultsPublished", event.getResultsDate() != null);
        
        // Get registration count
        List<EventRegistration> registrations = registrationRepository.findByEventId(event.getId());
        dto.put("registrations", registrations.size());
        dto.put("maxRegistrations", 100); // Default, should come from event
        
        // Get subjects
        List<Subject> subjects = subjectRepository.findByEventId(event.getId());
        dto.put("subjects", subjects.stream().map(s -> Map.of(
                "name", s.getName(),
                "coefficient", s.getCoefficient()
        )).collect(Collectors.toList()));
        
        return dto;
    }

    private String determineEventStatus(Event event) {
        if (event.getResultsDate() != null) return "completed";
        if (!event.getIsActive()) return "draft";
        if (event.getRegistrationEnd() != null && event.getRegistrationEnd().isBefore(LocalDateTime.now())) {
            return "closed";
        }
        return "open";
    }

    private Map<String, Object> mapRegistrationToDto(EventRegistration registration) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", registration.getId());
        dto.put("status", registration.getStatus().toString().toLowerCase());
        dto.put("createdAt", registration.getCreatedAt());
        
        User user = registration.getUser();
        if (user != null) {
            Map<String, Object> userDto = new HashMap<>();
            userDto.put("id", user.getId());
            userDto.put("firstName", user.getFirstName());
            userDto.put("lastName", user.getLastName());
            userDto.put("email", user.getEmail());
            dto.put("user", userDto);
        }
        
        return dto;
    }
}
