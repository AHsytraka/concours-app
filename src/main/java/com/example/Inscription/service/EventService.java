package com.example.Inscription.service;

import com.example.Inscription.model.*;
import com.example.Inscription.repository.*;
import com.example.Inscription.service.ai.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Service for managing events (contests and selections)
 */
@Service
@RequiredArgsConstructor
@Transactional
public class EventService {
    
    private final EventRepository eventRepository;
    private final InstitutionRepository institutionRepository;
    private final DecreeVerificationService decreeVerificationService;
    private final DeliberationService deliberationService;
    private final ExamResultRepository examResultRepository;
    private final MailService mailService;
    
    /**
     * Create a new event from decree
     */
    public Event createEventFromDecree(Long institutionId, byte[] decreeFile, String filename) throws Exception {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new IllegalArgumentException("Institution not found"));
        
        // Verify decree
        if (!decreeVerificationService.isValidDecree(decreeFile, filename)) {
            throw new IllegalArgumentException("Invalid decree document");
        }
        
        // Extract decree information
        ExtractedDecreeData decreeData = decreeVerificationService.extractDecreeInfo(decreeFile);
        
        Event event = new Event();
        event.setInstitution(institution);
        event.setTitle(decreeData.getEventTitle());
        event.setDescription(decreeData.getEventDescription());
        event.setEventType(decreeData.getEventType());
        event.setRegistrationStart(decreeData.getRegistrationStartDate());
        event.setRegistrationEnd(decreeData.getRegistrationEndDate());
        event.setContestDate(decreeData.getContestDate());
        event.setDecreeFile(decreeFile);
        event.setDecreeFilename(filename);
        event.setIsDecreeVerified(true);
        event.setEligibleSeries(decreeData.getEligibleSeries());
        event.setIsActive(true);
        
        return eventRepository.save(event);
    }
    
    /**
     * Close registrations for an event
     */
    public void closeRegistrations(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(event.getRegistrationEnd())) {
            throw new IllegalStateException("Registration period not yet closed");
        }
        
        // Event registrations are automatically closed when deadline passes
        event.setUpdatedAt(now);
        eventRepository.save(event);
    }
    
    /**
     * Process results for contest (deliberation)
     */
    public void processContestResults(Long eventId) throws Exception {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        
        if (event.getEventType() != EventType.CONTEST) {
            throw new IllegalArgumentException("This operation only applies to contests");
        }
        
        List<ExamResult> results = examResultRepository.findByEventIdOrderByAverageDesc(eventId);
        
        // Rank all results
        for (int i = 0; i < results.size(); i++) {
            results.get(i).setRanking(i + 1);
            examResultRepository.save(results.get(i));
        }
        
        // Send results emails to students who passed
        for (ExamResult result : results) {
            if (result.getResultStatus() == ResultStatus.PASSED) {
                String subject = "Résultats d'admission";
                String body = "Félicitations! Vous avez réussi le concours.\n" +
                        "Note: " + result.getAverage() + "/20\n" +
                        "Classement: " + result.getRanking();
                
                mailService.sendSimpleEmail(result.getUser().getEmail(), subject, body);
            }
        }
    }
    
    /**
     * Process results for selection (file evaluation)
     */
    public void processSelectionResults(Long eventId) throws Exception {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        
        if (event.getEventType() != EventType.SELECTION) {
            throw new IllegalArgumentException("This operation only applies to selections");
        }
        
        // TODO: Evaluate all registrations and create results using AI
        // This involves analyzing student files and creating ranking
    }
    
    /**
     * Get active events available for registration
     */
    public List<Event> getActiveEvents() {
        LocalDateTime now = LocalDateTime.now();
        return eventRepository.findByRegistrationStartBeforeAndRegistrationEndAfter(
                now.minusDays(1), 
                now.plusDays(1)
        );
    }
}
