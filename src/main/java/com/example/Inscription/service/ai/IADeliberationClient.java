package com.example.Inscription.service.ai;

import com.example.Inscription.model.*;
import com.example.Inscription.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Client service for communicating with the IA deliberation service (Python FastAPI)
 * Located at IA/eni-ia-services
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class IADeliberationClient {
    
    @Value("${ia.service.url:http://localhost:8001}")
    private String iaServiceUrl;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final EventRepository eventRepository;
    private final DeliberationRuleRepository ruleRepository;
    private final ExamResultRepository examResultRepository;
    private final EventRegistrationRepository registrationRepository;
    
    /**
     * Call the IA service to deliberate a contest (concours)
     * Endpoint: POST /api/v1/deliberation/concours/deliberation
     */
    public Map<String, Object> deliberateContest(Long eventId, List<Map<String, Object>> candidatsWithNotes) {
        try {
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));
            
            if (event.getEventType() != EventType.CONTEST) {
                throw new IllegalArgumentException("Event is not a CONTEST type");
            }
            
            // Get deliberation rules
            DeliberationRule rules = event.getDeliberationRule();
            if (rules == null) {
                rules = ruleRepository.findByInstitutionIdAndEventTypeAndIsActiveTrue(
                        event.getInstitution().getId(), EventType.CONTEST
                ).orElse(null);
            }
            
            // Build request for IA service
            Map<String, Object> request = buildConcoursRequest(event, rules, candidatsWithNotes);
            
            // Call IA service
            String url = iaServiceUrl + "/api/v1/deliberation/concours/deliberation";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            log.info("Calling IA deliberation service at: {}", url);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("IA deliberation completed successfully");
                return response.getBody();
            } else {
                throw new RuntimeException("IA service returned error: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            log.error("Error calling IA deliberation service", e);
            throw new RuntimeException("Failed to call IA deliberation service: " + e.getMessage());
        }
    }
    
    /**
     * Call the IA service for file selection (sélection de dossier)
     * Endpoint: POST /api/v1/deliberation/selection/analyser
     */
    public Map<String, Object> analyzeSelection(Long eventId) {
        try {
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));
            
            if (event.getEventType() != EventType.SELECTION) {
                throw new IllegalArgumentException("Event is not a SELECTION type");
            }
            
            // Get deliberation rules
            DeliberationRule rules = event.getDeliberationRule();
            if (rules == null) {
                rules = ruleRepository.findByInstitutionIdAndEventTypeAndIsActiveTrue(
                        event.getInstitution().getId(), EventType.SELECTION
                ).orElse(null);
            }
            
            // Get all registrations for this event
            List<EventRegistration> registrations = registrationRepository.findByEventId(eventId);
            
            // Build request for IA service
            Map<String, Object> request = buildSelectionRequest(event, rules, registrations);
            
            // Call IA service
            String url = iaServiceUrl + "/api/v1/deliberation/selection/analyser";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            log.info("Calling IA selection service at: {}", url);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("IA selection analysis completed successfully");
                return response.getBody();
            } else {
                throw new RuntimeException("IA service returned error: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            log.error("Error calling IA selection service", e);
            throw new RuntimeException("Failed to call IA selection service: " + e.getMessage());
        }
    }
    
    /**
     * Build the request object for contest deliberation
     */
    private Map<String, Object> buildConcoursRequest(Event event, DeliberationRule rules, 
                                                      List<Map<String, Object>> candidatsWithNotes) {
        Map<String, Object> request = new HashMap<>();
        
        // Add candidates
        List<Map<String, Object>> candidats = new ArrayList<>();
        for (Map<String, Object> candidatData : candidatsWithNotes) {
            Map<String, Object> candidat = new HashMap<>();
            candidat.put("id", candidatData.get("id"));
            candidat.put("nom", candidatData.get("nom"));
            candidat.put("prenom", candidatData.get("prenom"));
            
            // Format notes for IA service
            List<Map<String, Object>> notes = new ArrayList<>();
            Map<String, Object> notesData = (Map<String, Object>) candidatData.get("notes");
            if (notesData != null) {
                for (Subject subject : event.getSubjects()) {
                    Object noteValue = notesData.get(subject.getName());
                    if (noteValue != null) {
                        Map<String, Object> note = new HashMap<>();
                        note.put("matiere", subject.getName());
                        note.put("note", Double.valueOf(noteValue.toString()));
                        note.put("coefficient", subject.getCoefficient());
                        notes.add(note);
                    }
                }
            }
            candidat.put("notes", notes);
            candidats.add(candidat);
        }
        request.put("candidats", candidats);
        
        // Add criteria
        Map<String, Object> criteres = new HashMap<>();
        if (rules != null) {
            criteres.put("moyenne_minimum", rules.getMinAverage());
            criteres.put("nombre_places", rules.getMaxWaitlistPercentage()); // Use as capacity
            
            // Parse custom criteria
            if (rules.getCustomCriteria() != null) {
                try {
                    Map<String, Object> customCriteria = objectMapper.readValue(
                            rules.getCustomCriteria(), Map.class);
                    criteres.put("note_eliminatoire", customCriteria.get("note_eliminatoire"));
                    criteres.put("criteres_specifiques", customCriteria.get("criteres_specifiques"));
                    criteres.put("matieres_eliminatoires", customCriteria.get("matieres_eliminatoires"));
                    if (customCriteria.get("nombre_places") != null) {
                        criteres.put("nombre_places", customCriteria.get("nombre_places"));
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse custom criteria: {}", e.getMessage());
                }
            }
        } else {
            // Default criteria
            criteres.put("moyenne_minimum", 10.0);
        }
        request.put("criteres", criteres);
        
        request.put("concours_id", event.getId().toString());
        request.put("concours_nom", event.getTitle());
        
        return request;
    }
    
    /**
     * Build the request object for selection analysis
     */
    private Map<String, Object> buildSelectionRequest(Event event, DeliberationRule rules,
                                                       List<EventRegistration> registrations) {
        Map<String, Object> request = new HashMap<>();
        
        // Add dossiers (candidates)
        List<Map<String, Object>> dossiers = new ArrayList<>();
        for (EventRegistration reg : registrations) {
            User user = reg.getUser();
            Map<String, Object> dossier = new HashMap<>();
            dossier.put("id", reg.getId().toString());
            dossier.put("nom", user.getLastName());
            dossier.put("prenom", user.getFirstName());
            
            // Extract notes from form data if available
            List<Map<String, Object>> notes = new ArrayList<>();
            if (reg.getFormData() != null) {
                try {
                    Map<String, Object> formData = objectMapper.readValue(reg.getFormData(), Map.class);
                    // Parse notes from form data if present
                    if (formData.get("notes") != null) {
                        List<Map<String, Object>> notesData = (List<Map<String, Object>>) formData.get("notes");
                        notes.addAll(notesData);
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse form data for registration {}: {}", reg.getId(), e.getMessage());
                }
            }
            dossier.put("notes", notes);
            
            // Additional info
            dossier.put("etablissement", user.getHighSchool());
            if (user.getBacSeries() != null) {
                dossier.put("filiere_origine", user.getBacSeries().name());
            }
            if (user.getAverageGrade() != null) {
                dossier.put("moyenne_generale", user.getAverageGrade());
            }
            
            dossiers.add(dossier);
        }
        request.put("dossiers", dossiers);
        
        // Add criteria
        Map<String, Object> criteres = new HashMap<>();
        if (rules != null) {
            criteres.put("moyenne_minimum", rules.getMinAverage());
            
            // Parse selection criteria
            if (rules.getSelectionCriteria() != null) {
                try {
                    Map<String, Object> selectionCriteria = objectMapper.readValue(
                            rules.getSelectionCriteria(), Map.class);
                    criteres.put("criteres_texte", selectionCriteria.get("criteres_texte"));
                    if (selectionCriteria.get("nombre_places") != null) {
                        criteres.put("nombre_places", selectionCriteria.get("nombre_places"));
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse selection criteria: {}", e.getMessage());
                }
            }
            
            if (rules.getMinSelectionScore() != null) {
                criteres.put("score_minimum", rules.getMinSelectionScore());
            }
        } else {
            criteres.put("moyenne_minimum", 10.0);
        }
        request.put("criteres", criteres);
        
        request.put("formation_id", event.getId().toString());
        request.put("formation_nom", event.getTitle());
        
        return request;
    }
    
    /**
     * Save deliberation results back to the database
     */
    public void saveDeliberationResults(Long eventId, Map<String, Object> iaResponse) {
        try {
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));
            
            // Process admitted candidates
            List<Map<String, Object>> listeAdmis = (List<Map<String, Object>>) iaResponse.get("liste_admis");
            if (listeAdmis != null) {
                for (Map<String, Object> admis : listeAdmis) {
                    updateExamResult(event, admis, ResultStatus.PASSED, false);
                }
            }
            
            // Process waitlist candidates
            List<Map<String, Object>> listeAttente = (List<Map<String, Object>>) iaResponse.get("liste_attente");
            if (listeAttente != null) {
                for (Map<String, Object> attente : listeAttente) {
                    updateExamResult(event, attente, ResultStatus.WAITING_LIST, true);
                }
            }
            
            // Process refused candidates
            List<Map<String, Object>> listeRefuses = (List<Map<String, Object>>) iaResponse.get("liste_refuses");
            if (listeRefuses != null) {
                for (Map<String, Object> refuse : listeRefuses) {
                    updateExamResult(event, refuse, ResultStatus.FAILED, false);
                }
            }
            
            log.info("Saved deliberation results for event {}", eventId);
            
        } catch (Exception e) {
            log.error("Error saving deliberation results", e);
            throw new RuntimeException("Failed to save deliberation results: " + e.getMessage());
        }
    }
    
    private void updateExamResult(Event event, Map<String, Object> candidatResult, 
                                   ResultStatus status, boolean isWaitlist) {
        String candidatId = (String) candidatResult.get("candidat_id");
        
        // Find existing result or create new
        Optional<ExamResult> existingResult = examResultRepository.findByUserIdAndEventId(
                Long.valueOf(candidatId), event.getId());
        
        ExamResult result = existingResult.orElse(new ExamResult());
        result.setEvent(event);
        result.setResultStatus(status);
        result.setIsOnWaitlist(isWaitlist);
        
        if (candidatResult.get("moyenne") != null) {
            result.setAverage(Double.valueOf(candidatResult.get("moyenne").toString()));
        }
        if (candidatResult.get("rang") != null) {
            result.setRanking(Integer.valueOf(candidatResult.get("rang").toString()));
        }
        
        // Store full details as JSON
        try {
            result.setScoreData(objectMapper.writeValueAsString(candidatResult));
        } catch (Exception e) {
            log.warn("Failed to serialize candidate result: {}", e.getMessage());
        }
        
        examResultRepository.save(result);
    }
}
