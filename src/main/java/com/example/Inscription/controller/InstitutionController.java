package com.example.Inscription.controller;

import com.example.Inscription.model.*;
import com.example.Inscription.repository.*;
import com.example.Inscription.service.EventService;
import com.example.Inscription.service.MailService;
import com.example.Inscription.service.StudentEventRegistrationService;
import com.example.Inscription.service.DeliberationService;
import com.example.Inscription.service.ai.IADeliberationClient;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.RequestParam;

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
    private final DeliberationRuleRepository deliberationRuleRepository;
    private final RegistrationNumberRepository registrationNumberRepository;
    private final GradeEntryRepository gradeEntryRepository;
    private final EventService eventService;
    private final MailService mailService;
    private final StudentEventRegistrationService studentEventRegistrationService;
    private final DeliberationService deliberationService;
    private final ObjectMapper objectMapper;
    private final IADeliberationClient iaDeliberationClient;
    
    @PersistenceContext
    private EntityManager entityManager;

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
            profile.put("acronym", institution.getAcronym());
            profile.put("type", institution.getType());
            profile.put("registrationNumber", institution.getRegistrationNumber());
            profile.put("email", institution.getEmail());
            profile.put("phone", institution.getPhoneNumber());
            profile.put("address", institution.getAddress());
            profile.put("city", institution.getCity());
            profile.put("country", institution.getCountry());
            profile.put("website", institution.getWebsite());
            profile.put("description", institution.getDescription());
            profile.put("logo", institution.getLogo());
            profile.put("hasAuthorizationDoc", institution.getAuthorizationFile() != null && institution.getAuthorizationFile().length > 0);
            profile.put("authorizationFilename", institution.getAuthorizationFilename());
            profile.put("isAuthorizationVerified", institution.getIsAuthorizationVerified());

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

    @GetMapping("/authorization-document")
    @Operation(summary = "Get institution authorization document")
    public ResponseEntity<?> getAuthorizationDocument(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            Institution institution = user.getInstitution();
            
            if (institution == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not associated with an institution");
            }

            if (institution.getAuthorizationFile() == null || institution.getAuthorizationFile().length == 0) {
                return ResponseEntity.notFound().build();
            }

            String filename = institution.getAuthorizationFilename() != null 
                    ? institution.getAuthorizationFilename() 
                    : "authorization.pdf";
            
            String contentType = getContentType(filename);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(institution.getAuthorizationFile());
        } catch (Exception e) {
            log.error("Error fetching authorization document", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/authorization-document")
    @Operation(summary = "Upload institution authorization document")
    public ResponseEntity<?> uploadAuthorizationDocument(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        try {
            User user = getCurrentUser(authentication);
            Institution institution = user.getInstitution();
            
            if (institution == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not associated with an institution");
            }

            institution.setAuthorizationFile(file.getBytes());
            institution.setAuthorizationFilename(file.getOriginalFilename());
            institution.setIsAuthorizationVerified(false); // Reset verification when new doc uploaded
            institutionRepository.save(institution);

            return ResponseEntity.ok(Map.of(
                "message", "Document uploaded successfully",
                "filename", file.getOriginalFilename()
            ));
        } catch (Exception e) {
            log.error("Error uploading authorization document", e);
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
    @Transactional(readOnly = true)
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

    @GetMapping("/events/{eventId}")
    @Operation(summary = "Get a single event by ID")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getEventById(Authentication authentication, @PathVariable Long eventId) {
        try {
            User user = getCurrentUser(authentication);
            Institution institution = user.getInstitution();
            
            if (institution == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not associated with an institution");
            }

            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));

            // Verify event belongs to this institution
            if (!event.getInstitution().getId().equals(institution.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            return ResponseEntity.ok(mapEventToDto(event));
        } catch (Exception e) {
            log.error("Error fetching event", e);
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
            @RequestParam(value = "deliberationRules", required = false) String deliberationRulesJson,
            @RequestParam(value = "eligibleSeries", required = false) String eligibleSeriesJson,
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
            event.setLevel(level);
            event.setMaxAdmissions(maxRegistrations); // Nombre de places (admissions après délibération)
            event.setRegistrationFee(registrationFee != null ? registrationFee.doubleValue() : 0.0);
            event.setEventType(EventType.valueOf(eventType));
            event.setRegistrationStart(LocalDateTime.now());
            event.setRegistrationEnd(LocalDateTime.parse(deadline + "T23:59:59"));
            
            // Parse and set eligible series
            if (eligibleSeriesJson != null && !eligibleSeriesJson.isEmpty()) {
                List<String> seriesList = objectMapper.readValue(eligibleSeriesJson, 
                        new TypeReference<List<String>>() {});
                Set<BacSeries> series = seriesList.stream()
                        .map(BacSeries::valueOf)
                        .collect(Collectors.toSet());
                event.setEligibleSeries(series);
            }
            
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

            // Save deliberation rules
            if (deliberationRulesJson != null && !deliberationRulesJson.isEmpty()) {
                Map<String, Object> rulesData = objectMapper.readValue(deliberationRulesJson, 
                        new TypeReference<Map<String, Object>>() {});
                
                DeliberationRule rule = new DeliberationRule();
                rule.setInstitution(institution);
                rule.setEventType(EventType.valueOf(eventType));
                rule.setRuleName("Règles " + name);
                
                // Common rules
                if (rulesData.get("moyenneMinimum") != null) {
                    rule.setMinAverage(Double.valueOf(rulesData.get("moyenneMinimum").toString()));
                    rule.setPassingScore(Double.valueOf(rulesData.get("moyenneMinimum").toString()));
                }
                if (rulesData.get("waitlistPercentage") != null) {
                    rule.setMaxWaitlistPercentage(Integer.valueOf(rulesData.get("waitlistPercentage").toString()));
                }
                
                // Contest-specific rules
                if ("CONTEST".equals(eventType)) {
                    Map<String, Object> customCriteria = new HashMap<>();
                    if (rulesData.get("noteEliminatoire") != null) {
                        customCriteria.put("note_eliminatoire", Double.valueOf(rulesData.get("noteEliminatoire").toString()));
                    }
                    if (rulesData.get("criteresSpecifiques") != null) {
                        customCriteria.put("criteres_specifiques", rulesData.get("criteresSpecifiques"));
                    }
                    if (rulesData.get("matieresEliminatoires") != null) {
                        customCriteria.put("matieres_eliminatoires", rulesData.get("matieresEliminatoires"));
                    }
                    customCriteria.put("nombre_places", maxRegistrations);
                    rule.setCustomCriteria(objectMapper.writeValueAsString(customCriteria));
                    rule.setUseWeightedAverage(true);
                } else {
                    // Selection-specific rules
                    Map<String, Object> selectionCriteria = new HashMap<>();
                    if (rulesData.get("criteresTexte") != null) {
                        selectionCriteria.put("criteres_texte", rulesData.get("criteresTexte"));
                    }
                    if (rulesData.get("minSelectionScore") != null) {
                        rule.setMinSelectionScore(Double.valueOf(rulesData.get("minSelectionScore").toString()));
                    }
                    selectionCriteria.put("nombre_places", maxRegistrations);
                    rule.setSelectionCriteria(objectMapper.writeValueAsString(selectionCriteria));
                    rule.setUseWeightedAverage(false);
                }
                
                rule.setIsActive(true);
                DeliberationRule savedRule = deliberationRuleRepository.save(rule);
                
                // Link the rule to the event
                savedEvent.setDeliberationRule(savedRule);
                eventRepository.save(savedEvent);
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(mapEventToDto(savedEvent));
        } catch (Exception e) {
            log.error("Error creating event", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping(value = "/events/{eventId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update an event")
    public ResponseEntity<?> updateEvent(
            Authentication authentication,
            @PathVariable Long eventId,
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String level,
            @RequestParam String eventType,
            @RequestParam int maxRegistrations,
            @RequestParam(defaultValue = "0") double registrationFee,
            @RequestParam String deadline,
            @RequestParam(required = false) String examDate,
            @RequestParam(required = false) String examEndDate,
            @RequestParam(required = false) String locations,
            @RequestParam(required = false) String subjects,
            @RequestParam(required = false) String deliberationRules,
            @RequestParam(required = false) String eligibleSeries,
            @RequestParam(required = false) MultipartFile decreeFile) {
        try {
            User user = getCurrentUser(authentication);
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));

            if (!event.getInstitution().getId().equals(user.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            Institution institution = event.getInstitution();
            event.setTitle(name);
            event.setDescription(description);
            event.setLevel(level);
            event.setEventType(EventType.valueOf(eventType));
            event.setMaxAdmissions(maxRegistrations);
            event.setRegistrationFee(registrationFee);
            event.setRegistrationEnd(LocalDateTime.parse(deadline + "T23:59:59"));
            
            // Parse and update eligible series
            if (eligibleSeries != null && !eligibleSeries.isEmpty()) {
                try {
                    List<String> seriesList = objectMapper.readValue(eligibleSeries, 
                            new TypeReference<List<String>>() {});
                    Set<BacSeries> series = seriesList.stream()
                            .map(BacSeries::valueOf)
                            .collect(Collectors.toSet());
                    event.setEligibleSeries(series);
                } catch (Exception e) {
                    log.warn("Could not parse eligible series: " + e.getMessage());
                }
            }
            
            if (examDate != null && !examDate.isEmpty()) {
                event.setContestDate(LocalDateTime.parse(examDate + "T08:00:00"));
            }
            if (examEndDate != null && !examEndDate.isEmpty()) {
                event.setContestEndDate(LocalDateTime.parse(examEndDate + "T18:00:00"));
            }
            
            if (locations != null && !locations.isEmpty()) {
                try {
                    List<String> locationsList = objectMapper.readValue(locations, new TypeReference<List<String>>() {});
                    event.setLocations(locationsList);
                } catch (Exception e) {
                    log.warn("Could not parse locations: " + e.getMessage());
                }
            }
            
            if (subjects != null && !subjects.isEmpty()) {
                try {
                    // Delete existing subjects
                    subjectRepository.deleteByEventId(eventId);
                    
                    // Add new subjects
                    List<Map<String, Object>> subjectsList = objectMapper.readValue(subjects, 
                            new TypeReference<List<Map<String, Object>>>() {});
                    
                    for (Map<String, Object> subjectData : subjectsList) {
                        String subjectName = (String) subjectData.get("name");
                        if (subjectName != null && !subjectName.isEmpty()) {
                            Subject subject = new Subject();
                            subject.setName(subjectName);
                            subject.setCoefficient(Double.valueOf(subjectData.get("coefficient").toString()));
                            subject.setEvent(event);
                            subjectRepository.save(subject);
                        }
                    }
                } catch (Exception e) {
                    log.warn("Could not parse subjects: " + e.getMessage());
                }
            }
            
            if (decreeFile != null && !decreeFile.isEmpty()) {
                try {
                    event.setDecreeFile(decreeFile.getBytes());
                    event.setDecreeFilename(decreeFile.getOriginalFilename());
                } catch (java.io.IOException e) {
                    log.warn("Could not read decree file: " + e.getMessage());
                }
            }
            
            // Update deliberation rules
            if (deliberationRules != null && !deliberationRules.isEmpty()) {
                Map<String, Object> rulesData = objectMapper.readValue(deliberationRules, 
                        new TypeReference<Map<String, Object>>() {});
                
                DeliberationRule rule = event.getDeliberationRule();
                if (rule == null) {
                    rule = new DeliberationRule();
                    rule.setInstitution(institution);
                }
                
                rule.setEventType(EventType.valueOf(eventType));
                rule.setRuleName("Règles " + name);
                
                // Common rules
                if (rulesData.get("moyenneMinimum") != null) {
                    rule.setMinAverage(Double.valueOf(rulesData.get("moyenneMinimum").toString()));
                    rule.setPassingScore(Double.valueOf(rulesData.get("moyenneMinimum").toString()));
                }
                if (rulesData.get("waitlistPercentage") != null) {
                    rule.setMaxWaitlistPercentage(Integer.valueOf(rulesData.get("waitlistPercentage").toString()));
                }
                
                // Contest-specific rules
                if ("CONTEST".equals(eventType)) {
                    Map<String, Object> customCriteria = new HashMap<>();
                    if (rulesData.get("noteEliminatoire") != null) {
                        customCriteria.put("note_eliminatoire", Double.valueOf(rulesData.get("noteEliminatoire").toString()));
                    }
                    if (rulesData.get("criteresSpecifiques") != null) {
                        customCriteria.put("criteres_specifiques", rulesData.get("criteresSpecifiques"));
                    }
                    if (rulesData.get("matieresEliminatoires") != null) {
                        customCriteria.put("matieres_eliminatoires", rulesData.get("matieresEliminatoires"));
                    }
                    customCriteria.put("nombre_places", maxRegistrations);
                    rule.setCustomCriteria(objectMapper.writeValueAsString(customCriteria));
                    rule.setUseWeightedAverage(true);
                } else {
                    // Selection-specific rules
                    Map<String, Object> selectionCriteria = new HashMap<>();
                    if (rulesData.get("criteresTexte") != null) {
                        selectionCriteria.put("criteres_texte", rulesData.get("criteresTexte"));
                    }
                    if (rulesData.get("minSelectionScore") != null) {
                        rule.setMinSelectionScore(Double.valueOf(rulesData.get("minSelectionScore").toString()));
                    }
                    selectionCriteria.put("nombre_places", maxRegistrations);
                    rule.setSelectionCriteria(objectMapper.writeValueAsString(selectionCriteria));
                    rule.setUseWeightedAverage(false);
                }
                
                rule.setIsActive(true);
                rule.setUpdatedAt(LocalDateTime.now());
                DeliberationRule savedRule = deliberationRuleRepository.save(rule);
                event.setDeliberationRule(savedRule);
            }
            
            event.setUpdatedAt(LocalDateTime.now());
            Event updatedEvent = eventRepository.save(event);

            return ResponseEntity.ok(mapEventToDto(updatedEvent));
        } catch (Exception e) {
            log.error("Error updating event", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

@DeleteMapping("/events/{eventId}")
@Operation(summary = "Delete an event")
@Transactional
public ResponseEntity<?> deleteEvent(Authentication authentication, @PathVariable Long eventId) {
    try {
        User user = getCurrentUser(authentication);
        
        // Verify the event exists and get institution ID without lazy loading
        Long eventInstitutionId = eventRepository.getInstitutionIdByEventId(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        
        Long userInstitutionId = user.getInstitution() != null ? user.getInstitution().getId() : null;
        
        if (!eventInstitutionId.equals(userInstitutionId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
        }
        
        // Delete related entities using native SQL to avoid Hibernate cascade loading issues
        // Order matters! Delete child tables first, then parent
        
        // 1. Delete exam results (if any)
        entityManager.createNativeQuery("DELETE FROM exam_results WHERE event_id = :eventId")
                .setParameter("eventId", eventId)
                .executeUpdate();
        
        // 2. Delete event registrations
        registrationRepository.deleteByEventIdNative(eventId);
        
        // 3. Delete subjects
        subjectRepository.deleteByEventIdNative(eventId);
        
        // 4. Delete registration numbers
        registrationNumberRepository.deleteByEventIdNative(eventId);
        
        // 5. DELETE EVENT_LOCATIONS (THIS WAS MISSING!)
        entityManager.createNativeQuery("DELETE FROM event_locations WHERE event_id = :eventId")
                .setParameter("eventId", eventId)
                .executeUpdate();
        
        // 6. Finally, delete the event itself
        eventRepository.deleteEventById(eventId);
        
        return ResponseEntity.ok(Map.of("message", "Event deleted successfully"));
    } catch (Exception e) {
        log.error("Error deleting event", e);
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
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

    @PutMapping("/events/{eventId}/toggle-registrations")
    @Operation(summary = "Toggle registrations pause/resume", description = "Pause or resume registrations for an event (cannot be done after deadline)")
    public ResponseEntity<?> toggleEventRegistrations(
            Authentication authentication,
            @PathVariable Long eventId) {
        try {
            User user = getCurrentUser(authentication);
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));

            if (!event.getInstitution().getId().equals(user.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            eventService.toggleRegistrations(eventId);
            
            // Fetch updated event
            Event updatedEvent = eventRepository.findById(eventId).orElse(event);
            Map<String, Object> response = new HashMap<>();
            response.put("message", updatedEvent.getRegistrationsOpen() ? "Registrations opened" : "Registrations paused");
            response.put("registrationsOpen", updatedEvent.getRegistrationsOpen());
            
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error toggling registrations", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
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

    @GetMapping("/dossiers/{registrationId}/transcript")
    @Operation(summary = "Download student transcript for a registration")
    public ResponseEntity<?> downloadTranscript(Authentication authentication, @PathVariable Long registrationId) {
        try {
            User currentUser = getCurrentUser(authentication);
            EventRegistration registration = registrationRepository.findById(registrationId)
                    .orElseThrow(() -> new IllegalArgumentException("Registration not found"));

            if (!registration.getEvent().getInstitution().getId().equals(currentUser.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            User student = registration.getUser();
            if (student.getTranscriptFile() == null) {
                return ResponseEntity.notFound().build();
            }

            String filename = student.getTranscriptFilename() != null 
                    ? student.getTranscriptFilename() 
                    : "transcript.pdf";
            
            String contentType = getContentType(filename);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(student.getTranscriptFile());
        } catch (Exception e) {
            log.error("Error downloading transcript", e);
            return ResponseEntity.badRequest().body(e.getMessage());
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
            userDto.put("hasTranscript", user.getTranscriptFile() != null && user.getTranscriptFile().length > 0);
            userDto.put("transcriptFilename", user.getTranscriptFilename());
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
    @Operation(summary = "Process deliberation for an event using IA service")
    public ResponseEntity<?> deliberate(Authentication authentication, @PathVariable Long eventId) {
        try {
            User user = getCurrentUser(authentication);
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));

            if (!event.getInstitution().getId().equals(user.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            if (event.getEventType() == EventType.CONTEST) {
                // Get all exam results with grades
                List<ExamResult> examResults = examResultRepository.findByEventIdOrderByAverageDesc(eventId);
                
                // Build candidates list for IA service
                List<Map<String, Object>> candidatsWithNotes = new ArrayList<>();
                for (ExamResult result : examResults) {
                    Map<String, Object> candidat = new HashMap<>();
                    candidat.put("id", result.getUser().getId().toString());
                    candidat.put("nom", result.getUser().getLastName());
                    candidat.put("prenom", result.getUser().getFirstName());
                    
                    // Parse grades from scoreData
                    if (result.getScoreData() != null) {
                        try {
                            Map<String, Object> notes = objectMapper.readValue(result.getScoreData(), Map.class);
                            candidat.put("notes", notes);
                        } catch (Exception e) {
                            candidat.put("notes", new HashMap<>());
                        }
                    }
                    candidatsWithNotes.add(candidat);
                }
                
                // Call IA service for deliberation
                Map<String, Object> iaResponse = iaDeliberationClient.deliberateContest(eventId, candidatsWithNotes);
                
                // Save results back to database
                iaDeliberationClient.saveDeliberationResults(eventId, iaResponse);
                
                return ResponseEntity.ok(Map.of(
                    "message", "Délibération IA terminée",
                    "total_candidats", iaResponse.get("total_candidats"),
                    "nombre_admis", iaResponse.get("nombre_admis"),
                    "nombre_refuses", iaResponse.get("nombre_refuses"),
                    "nombre_liste_attente", iaResponse.get("nombre_liste_attente")
                ));
                
            } else {
                // SELECTION type - use file analysis
                Map<String, Object> iaResponse = iaDeliberationClient.analyzeSelection(eventId);
                
                // Update registration statuses based on IA response
                List<Map<String, Object>> admissibles = (List<Map<String, Object>>) iaResponse.get("dossiers_admissibles");
                List<Map<String, Object>> nonAdmissibles = (List<Map<String, Object>>) iaResponse.get("dossiers_non_admissibles");
                
                if (admissibles != null) {
                    for (Map<String, Object> dossier : admissibles) {
                        Long regId = Long.valueOf(dossier.get("candidat_id").toString());
                        registrationRepository.findById(regId).ifPresent(reg -> {
                            reg.setStatus(RegistrationStatus.APPROVED);
                            registrationRepository.save(reg);
                        });
                    }
                }
                
                if (nonAdmissibles != null) {
                    for (Map<String, Object> dossier : nonAdmissibles) {
                        Long regId = Long.valueOf(dossier.get("candidat_id").toString());
                        registrationRepository.findById(regId).ifPresent(reg -> {
                            reg.setStatus(RegistrationStatus.REJECTED);
                            registrationRepository.save(reg);
                        });
                    }
                }
                
                return ResponseEntity.ok(Map.of(
                    "message", "Sélection IA terminée",
                    "total_dossiers", iaResponse.get("total_dossiers"),
                    "nombre_admissibles", iaResponse.get("nombre_admissibles"),
                    "nombre_non_admissibles", iaResponse.get("nombre_non_admissibles")
                ));
            }
            
        } catch (Exception e) {
            log.error("Error during IA deliberation, falling back to basic deliberation", e);
            
            // Fallback to basic deliberation if IA service fails
            return deliberateBasic(authentication, eventId);
        }
    }
    
    /**
     * Basic deliberation without IA service (fallback)
     */
    private ResponseEntity<?> deliberateBasic(Authentication authentication, Long eventId) {
        try {
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));

            List<ExamResult> results = examResultRepository.findByEventIdOrderByAverageDesc(eventId);
            
            // Get deliberation rule
            DeliberationRule rules = event.getDeliberationRule();
            double passingScore = rules != null ? rules.getPassingScore() : 10.0;
            int maxAdmissions = 100; // Default

            int rank = 1;
            for (ExamResult result : results) {
                result.setRanking(rank);
                
                if (result.getAverage() != null && result.getAverage() >= passingScore) {
                    if (rank <= maxAdmissions) {
                        result.setResultStatus(ResultStatus.PASSED);
                    } else {
                        result.setResultStatus(ResultStatus.WAITING_LIST);
                        result.setIsOnWaitlist(true);
                    }
                } else {
                    result.setResultStatus(ResultStatus.FAILED);
                }
                
                examResultRepository.save(result);
                rank++;
            }

            return ResponseEntity.ok(Map.of("message", "Délibération basique terminée (sans IA)"));
        } catch (Exception e) {
            log.error("Error during basic deliberation", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/events/{eventId}/results")
    @Operation(summary = "Get exam results for an event (institution use - no publish check)")
    public ResponseEntity<?> getExamResults(Authentication authentication, @PathVariable Long eventId) {
        try {
            User user = getCurrentUser(authentication);
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));

            if (!event.getInstitution().getId().equals(user.getInstitution().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            List<ExamResult> results = examResultRepository.findByEventIdOrderByAverageDesc(eventId);
            List<Map<String, Object>> resultDtos = results.stream().map(r -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", r.getId());
                dto.put("rank", r.getRanking());
                dto.put("average", r.getAverage());
                dto.put("status", mapResultStatus(r.getResultStatus()));
                
                if (r.getUser() != null) {
                    Map<String, Object> userDto = new HashMap<>();
                    userDto.put("firstName", r.getUser().getFirstName());
                    userDto.put("lastName", r.getUser().getLastName());
                    dto.put("user", userDto);
                }
                
                return dto;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(resultDtos);
        } catch (Exception e) {
            log.error("Error fetching exam results", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private String mapResultStatus(ResultStatus status) {
        if (status == null) return "pending";
        if (status == ResultStatus.PASSED) return "admitted";
        if (status == ResultStatus.WAITING_LIST) return "waitlist";
        if (status == ResultStatus.FAILED) return "rejected";
        return "pending";
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
    
    // Date fields - use both naming conventions for compatibility
    dto.put("deadline", event.getRegistrationEnd());
    dto.put("registrationEnd", event.getRegistrationEnd());
    dto.put("registrationsOpen", event.getRegistrationsOpen() != null ? event.getRegistrationsOpen() : true);
    dto.put("examDate", event.getContestDate());
    dto.put("contestDate", event.getContestDate());
    dto.put("examEndDate", event.getContestEndDate());
    dto.put("contestEndDate", event.getContestEndDate());
    dto.put("resultsPublished", event.getResultsDate() != null);
    
    // Add all fields needed for the frontend
    dto.put("level", event.getLevel());
    dto.put("eventType", event.getEventType() != null ? event.getEventType().toString() : "CONTEST");
    dto.put("maxRegistrations", event.getMaxAdmissions() != null ? event.getMaxAdmissions() : 0);
    dto.put("maxAdmissions", event.getMaxAdmissions() != null ? event.getMaxAdmissions() : 0);
    dto.put("registrationFee", event.getRegistrationFee() != null ? event.getRegistrationFee() : 0);
    dto.put("locations", event.getLocations() != null ? new ArrayList<>(event.getLocations()) : new ArrayList<>());
    
    // Get registration count
    List<EventRegistration> registrations = registrationRepository.findByEventId(event.getId());
    dto.put("registrations", registrations.size());
    dto.put("registrationCount", registrations.size());
    
    // Get subjects - eagerly load to avoid lazy loading issues
    List<Subject> subjects = subjectRepository.findByEventId(event.getId());
    List<Map<String, Object>> subjectList = new ArrayList<>();
    for (Subject s : subjects) {
        Map<String, Object> subjectMap = new HashMap<>();
        subjectMap.put("name", s.getName());
        subjectMap.put("coefficient", s.getCoefficient() != null ? s.getCoefficient() : 1.0);
        subjectList.add(subjectMap);
    }
    dto.put("subjects", subjectList);
    
    // Initialize deliberation fields with defaults
    dto.put("moyenneMinimum", 10.0);
    dto.put("noteEliminatoire", 5.0);
    dto.put("waitlistPercentage", 20);
    dto.put("minSelectionScore", 50.0);
    dto.put("criteresSpecifiques", "");
    dto.put("matieresEliminatoires", new ArrayList<>());
    dto.put("criteresTexte", "");
    
    // Add deliberation rule fields if they exist
    if (event.getDeliberationRule() != null) {
        DeliberationRule rule = event.getDeliberationRule();
        
        // Override defaults with actual values
        if (rule.getMinAverage() != null) {
            dto.put("moyenneMinimum", rule.getMinAverage());
        }
        if (rule.getPassingScore() != null) {
            dto.put("noteEliminatoire", rule.getPassingScore());
        }
        if (rule.getMaxWaitlistPercentage() != null) {
            dto.put("waitlistPercentage", rule.getMaxWaitlistPercentage());
        }
        if (rule.getMinSelectionScore() != null) {
            dto.put("minSelectionScore", rule.getMinSelectionScore());
        }
        
        // Get event type as string for comparison
        String eventTypeStr = event.getEventType() != null ? event.getEventType().toString() : "CONTEST";
        
        try {
            // Parse and extract custom criteria fields for CONTEST events
            if ("CONTEST".equals(eventTypeStr) && rule.getCustomCriteria() != null && !rule.getCustomCriteria().isEmpty()) {
                log.info("Parsing customCriteria for CONTEST event: {}", rule.getCustomCriteria());
                
                Map<String, Object> customCriteria = objectMapper.readValue(rule.getCustomCriteria(), 
                        new TypeReference<Map<String, Object>>() {});
                
                // Extract criteresSpecifiques
                if (customCriteria.containsKey("criteres_specifiques")) {
                    Object criteresValue = customCriteria.get("criteres_specifiques");
                    dto.put("criteresSpecifiques", criteresValue != null ? criteresValue.toString() : "");
                    log.info("Set criteresSpecifiques: {}", criteresValue);
                }
                
                // Extract matieresEliminatoires
                if (customCriteria.containsKey("matieres_eliminatoires")) {
                    Object matieresValue = customCriteria.get("matieres_eliminatoires");
                    if (matieresValue instanceof List) {
                        dto.put("matieresEliminatoires", matieresValue);
                        log.info("Set matieresEliminatoires (List): {}", matieresValue);
                    } else if (matieresValue != null) {
                        // Try to parse as JSON array if it's a string
                        try {
                            List<String> matieres = objectMapper.readValue(matieresValue.toString(), 
                                    new TypeReference<List<String>>() {});
                            dto.put("matieresEliminatoires", matieres);
                            log.info("Set matieresEliminatoires (parsed): {}", matieres);
                        } catch (Exception e) {
                            log.warn("Could not parse matieresEliminatoires as array: {}", matieresValue);
                            dto.put("matieresEliminatoires", new ArrayList<>());
                        }
                    }
                }
                
                // Also check for note_eliminatoire in customCriteria
                if (customCriteria.containsKey("note_eliminatoire")) {
                    Object noteElim = customCriteria.get("note_eliminatoire");
                    if (noteElim instanceof Number) {
                        dto.put("noteEliminatoire", ((Number) noteElim).doubleValue());
                    } else if (noteElim != null) {
                        try {
                            dto.put("noteEliminatoire", Double.parseDouble(noteElim.toString()));
                        } catch (NumberFormatException e) {
                            log.warn("Could not parse note_eliminatoire: {}", noteElim);
                        }
                    }
                }
            }
            
            // Parse and extract selection criteria fields for SELECTION events
            if ("SELECTION".equals(eventTypeStr) && rule.getSelectionCriteria() != null && !rule.getSelectionCriteria().isEmpty()) {
                log.info("Parsing selectionCriteria for SELECTION event: {}", rule.getSelectionCriteria());
                
                Map<String, Object> selectionCriteria = objectMapper.readValue(rule.getSelectionCriteria(), 
                        new TypeReference<Map<String, Object>>() {});
                
                if (selectionCriteria.containsKey("criteres_texte")) {
                    Object criteresValue = selectionCriteria.get("criteres_texte");
                    dto.put("criteresTexte", criteresValue != null ? criteresValue.toString() : "");
                    log.info("Set criteresTexte: {}", criteresValue);
                }
            }
        } catch (Exception e) {
            log.warn("Could not parse deliberation criteria for event {}: {}", event.getId(), e.getMessage());
        }
    }
    
    // Log what we're returning for debugging
    log.info("Returning DTO with criteresSpecifiques: {}", dto.get("criteresSpecifiques"));
    log.info("Returning DTO with matieresEliminatoires: {}", dto.get("matieresEliminatoires"));
    
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
    
    // ==================== STUDENT EVENT REGISTRATION MANAGEMENT ====================
    
    @GetMapping("/events/{eventId}/student-registrations")
    @Operation(summary = "Get student event registrations for an event", description = "Get all student registrations for a specific event")
    public ResponseEntity<?> getEventStudentRegistrations(
            Authentication authentication,
            @PathVariable Long eventId) {
        try {
            String email = (String) authentication.getPrincipal();
            User institution = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));
            
            // Verify event belongs to institution
            if (!event.getInstitution().getId().equals(institution.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
            }
            
            List<com.example.Inscription.model.StudentEventRegistration> registrations = 
                    studentEventRegistrationService.getEventRegistrations(eventId);
            
            List<Map<String, Object>> result = new java.util.ArrayList<>();
            for (com.example.Inscription.model.StudentEventRegistration reg : registrations) {
                Map<String, Object> regMap = new HashMap<>();
                regMap.put("id", reg.getId());
                regMap.put("userId", reg.getUser().getId());
                regMap.put("studentName", reg.getUser().getFirstName() + " " + reg.getUser().getLastName());
                regMap.put("studentEmail", reg.getUser().getEmail());
                regMap.put("numeroBordereau", reg.getNumeroBordereau());
                regMap.put("status", reg.getStatus());
                regMap.put("isEligible", reg.getIsEligible());
                regMap.put("isReleveVerified", reg.getIsReleveVerified());
                regMap.put("isBordereauVerified", reg.getIsBordereauVerified());
                regMap.put("isConvocationSent", reg.getIsConvocationSent());
                regMap.put("createdAt", reg.getCreatedAt());
                regMap.put("hasReleveFile", reg.getReleveDeNoteFile() != null && reg.getReleveDeNoteFile().length > 0);
                regMap.put("hasBordereauFile", reg.getBordereauFile() != null && reg.getBordereauFile().length > 0);
                result.add(regMap);
            }
            
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error fetching registrations: " + e.getMessage()));
        }
    }
    
    @GetMapping("/student-registrations/{registrationId}/releve")
    @Operation(summary = "Download releve de note", description = "Download releve de note file for a student registration")
    public ResponseEntity<?> downloadReleve(
            Authentication authentication,
            @PathVariable Long registrationId) {
        try {
            String email = (String) authentication.getPrincipal();
            User institution = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            com.example.Inscription.model.StudentEventRegistration registration = 
                    studentEventRegistrationService.getRegistrationById(registrationId);
            
            // Verify event belongs to institution
            if (!registration.getEvent().getInstitution().getId().equals(institution.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
            }
            
            if (registration.getReleveDeNoteFile() == null || registration.getReleveDeNoteFile().length == 0) {
                return ResponseEntity.notFound().build();
            }
            
            String contentType = getContentType(registration.getReleveDeNoteFilename());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + registration.getReleveDeNoteFilename() + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .body(registration.getReleveDeNoteFile());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/student-registrations/{registrationId}/bordereau")
    @Operation(summary = "Download bordereau de versement", description = "Download bordereau file for a student registration")
    public ResponseEntity<?> downloadBordereau(
            Authentication authentication,
            @PathVariable Long registrationId) {
        try {
            String email = (String) authentication.getPrincipal();
            User institution = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            com.example.Inscription.model.StudentEventRegistration registration = 
                    studentEventRegistrationService.getRegistrationById(registrationId);
            
            // Verify event belongs to institution
            if (!registration.getEvent().getInstitution().getId().equals(institution.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
            }
            
            if (registration.getBordereauFile() == null || registration.getBordereauFile().length == 0) {
                return ResponseEntity.notFound().build();
            }
            
            String contentType = getContentType(registration.getBordereauFilename());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + registration.getBordereauFilename() + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .body(registration.getBordereauFile());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PutMapping("/student-registrations/{registrationId}/verify-releve")
    @Operation(summary = "Verify releve de note", description = "Mark releve de note as verified")
    public ResponseEntity<?> verifyReleve(
            Authentication authentication,
            @PathVariable Long registrationId,
            @RequestParam boolean verified) {
        try {
            String email = (String) authentication.getPrincipal();
            User institution = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            com.example.Inscription.model.StudentEventRegistration registration = 
                    studentEventRegistrationService.getRegistrationById(registrationId);
            
            // Verify event belongs to institution
            if (!registration.getEvent().getInstitution().getId().equals(institution.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
            }
            
            com.example.Inscription.model.StudentEventRegistration updated = 
                    studentEventRegistrationService.verifyReleve(registrationId, verified);
            
            return ResponseEntity.ok(Map.of(
                "message", "Releve verification updated",
                "isVerified", updated.getIsReleveVerified()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PutMapping("/student-registrations/{registrationId}/verify-bordereau")
    @Operation(summary = "Verify bordereau de versement", description = "Mark bordereau as verified")
    public ResponseEntity<?> verifyBordereau(
            Authentication authentication,
            @PathVariable Long registrationId,
            @RequestParam boolean verified) {
        try {
            String email = (String) authentication.getPrincipal();
            User institution = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            com.example.Inscription.model.StudentEventRegistration registration = 
                    studentEventRegistrationService.getRegistrationById(registrationId);
            
            // Verify event belongs to institution
            if (!registration.getEvent().getInstitution().getId().equals(institution.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
            }
            
            com.example.Inscription.model.StudentEventRegistration updated = 
                    studentEventRegistrationService.verifyBordereau(registrationId, verified);
            
            return ResponseEntity.ok(Map.of(
                "message", "Bordereau verification updated",
                "isVerified", updated.getIsBordereauVerified()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PutMapping("/student-registrations/{registrationId}/approve")
    @Operation(summary = "Approve student registration", description = "Approve a student registration (both documents must be verified)")
    public ResponseEntity<?> approveRegistration(
            Authentication authentication,
            @PathVariable Long registrationId) {
        try {
            String email = (String) authentication.getPrincipal();
            User institution = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            com.example.Inscription.model.StudentEventRegistration registration = 
                    studentEventRegistrationService.getRegistrationById(registrationId);
            
            // Verify event belongs to institution
            if (!registration.getEvent().getInstitution().getId().equals(institution.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
            }
            
            com.example.Inscription.model.StudentEventRegistration approved = 
                    studentEventRegistrationService.approveRegistration(registrationId);
            
            // Send convocation
            studentEventRegistrationService.sendConvocation(registrationId);
            
            return ResponseEntity.ok(Map.of(
                "message", "Registration approved",
                "status", approved.getStatus(),
                "isConvocationSent", true
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }
    
    @PutMapping("/student-registrations/{registrationId}/reject")
    @Operation(summary = "Reject student registration", description = "Reject a student registration")
    public ResponseEntity<?> rejectRegistration(
            Authentication authentication,
            @PathVariable Long registrationId,
            @RequestParam(required = false) String reason) {
        try {
            String email = (String) authentication.getPrincipal();
            User institution = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            com.example.Inscription.model.StudentEventRegistration registration = 
                    studentEventRegistrationService.getRegistrationById(registrationId);
            
            // Verify event belongs to institution
            if (!registration.getEvent().getInstitution().getId().equals(institution.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
            }
            
            com.example.Inscription.model.StudentEventRegistration rejected = 
                    studentEventRegistrationService.rejectRegistration(registrationId);
            
            return ResponseEntity.ok(Map.of(
                "message", "Registration rejected",
                "status", rejected.getStatus()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    

    
    @PostMapping("/events/{eventId}/grades/{studentId}")
    @Operation(summary = "Submit single grade entry", description = "Submit or update grade for a single student")
    public ResponseEntity<?> submitGradeEntry(
            Authentication authentication,
            @PathVariable Long eventId,
            @PathVariable Long studentId,
            @RequestParam Long subjectId,
            @RequestParam Double score) {
        try {
            String email = (String) authentication.getPrincipal();
            User subaccount = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Subaccount not found"));
            
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));
            
            // Verify event belongs to institution (via subaccount's institution)
            if (!event.getInstitution().getId().equals(subaccount.getInstitution() != null ? subaccount.getInstitution().getId() : null)) {
                return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
            }
            
            // Validate score
            if (score < 0 || score > 20) {
                return ResponseEntity.badRequest().body(Map.of("message", "Score must be between 0 and 20"));
            }
            
            GradeEntry entry = deliberationService.submitGradeEntry(eventId, subjectId, studentId, subaccount.getId(), score);
            
            return ResponseEntity.ok(Map.of(
                "message", "Grade entry submitted",
                "gradeEntryId", entry.getId(),
                "studentId", studentId,
                "score", entry.getScore(),
                "status", entry.getStatus()
            ));
            
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/events/{eventId}/grades")
    @Operation(summary = "Get event grades", description = "Get all grade entries for an event")
    public ResponseEntity<?> getEventGrades(
            Authentication authentication,
            @PathVariable Long eventId) {
        try {
            String email = (String) authentication.getPrincipal();
            User institution = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));
            
            // Verify event belongs to institution
            if (!event.getInstitution().getId().equals(institution.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
            }
            
            List<GradeEntry> grades = gradeEntryRepository.findByEventId(eventId);
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (GradeEntry grade : grades) {
                Map<String, Object> gradeMap = new HashMap<>();
                gradeMap.put("id", grade.getId());
                gradeMap.put("studentId", grade.getStudent().getId());
                gradeMap.put("studentName", grade.getStudent().getFirstName() + " " + grade.getStudent().getLastName());
                gradeMap.put("subjectId", grade.getSubject().getId());
                gradeMap.put("subjectName", grade.getSubject().getName());
                gradeMap.put("score", grade.getScore());
                gradeMap.put("status", grade.getStatus());
                gradeMap.put("enteredBy", grade.getSubaccount().getFirstName() + " " + grade.getSubaccount().getLastName());
                gradeMap.put("createdAt", grade.getCreatedAt());
                result.add(gradeMap);
            }
            
            return ResponseEntity.ok(Map.of(
                "eventId", eventId,
                "totalGrades", result.size(),
                "grades", result
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}

