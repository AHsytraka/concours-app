package com.example.Inscription.service;

import com.example.Inscription.model.*;
import com.example.Inscription.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class StudentEventRegistrationService {
    
    private final StudentEventRegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    
    /**
     * Register a student for an event
     */
    public StudentEventRegistration registerForEvent(Long userId, Long eventId, 
            byte[] releveDeNoteFile, String releveDeNoteFilename,
            byte[] bordereauFile, String bordereauFilename,
            String numeroBordereau) throws Exception {
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        
        // Check if registration period is open
        if (!event.getRegistrationsOpen()) {
            throw new IllegalStateException("Registrations are temporarily paused for this event");
        }
        
        // Check if registration deadline has passed
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(event.getRegistrationEnd())) {
            throw new IllegalStateException("Registration deadline has passed for this event");
        }
        
        // Check if student already registered
        Optional<StudentEventRegistration> existing = registrationRepository.findByUserIdAndEventId(userId, eventId);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Student is already registered for this event");
        }
        
        // Check if student has eligible bac series
        boolean isEligible = isStudentEligible(user, event);
        
        StudentEventRegistration registration = new StudentEventRegistration();
        registration.setUser(user);
        registration.setEvent(event);
        registration.setStatus(RegistrationStatus.PENDING);
        registration.setReleveDeNoteFile(releveDeNoteFile);
        registration.setReleveDeNoteFilename(releveDeNoteFilename);
        registration.setBordereauFile(bordereauFile);
        registration.setBordereauFilename(bordereauFilename);
        registration.setNumeroBordereau(numeroBordereau);
        registration.setIsEligible(isEligible);
        registration.setIsReleveVerified(false);
        registration.setIsBordereauVerified(false);
        registration.setIsConvocationSent(false);
        
        return registrationRepository.save(registration);
    }
    
    /**
     * Register a student for an event (using object)
     */
    public StudentEventRegistration registerForEvent(StudentEventRegistration registration) throws Exception {
        // Check if registration period is open
        if (!registration.getEvent().getRegistrationsOpen()) {
            throw new IllegalStateException("Registrations are temporarily paused for this event");
        }
        
        // Check if registration deadline has passed
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(registration.getEvent().getRegistrationEnd())) {
            throw new IllegalStateException("Registration deadline has passed for this event");
        }
        
        // Check if student already registered
        Optional<StudentEventRegistration> existing = registrationRepository.findByUserIdAndEventId(
                registration.getUser().getId(), 
                registration.getEvent().getId());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Student is already registered for this event");
        }
        
        return registrationRepository.save(registration);
    }
    
    /**
     * Check if student has eligible bac series for the event
     */
    private boolean isStudentEligible(User user, Event event) {
        if (user.getBacSeries() == null || event.getEligibleSeries() == null || event.getEligibleSeries().isEmpty()) {
            return true; // No series restriction
        }
        return event.getEligibleSeries().contains(user.getBacSeries());
    }
    
    /**
     * Get registrations for a student
     */
    public List<StudentEventRegistration> getStudentRegistrations(Long userId) {
        return registrationRepository.findByUserId(userId);
    }
    
    /**
     * Get registration by ID
     */
    public StudentEventRegistration getRegistrationById(Long registrationId) {
        return registrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found"));
    }
    
    /**
     * Get registrations for an event
     */
    public List<StudentEventRegistration> getEventRegistrations(Long eventId) {
        return registrationRepository.findByEventId(eventId);
    }
    
    /**
     * Get eligible registrations for an event
     */
    public List<StudentEventRegistration> getEligibleEventRegistrations(Long eventId) {
        return registrationRepository.findByEventIdAndIsEligibleTrue(eventId);
    }
    
    /**
     * Get approved registrations for an event
     */
    public List<StudentEventRegistration> getApprovedEventRegistrations(Long eventId) {
        return registrationRepository.findByEventIdAndStatusAndIsEligibleTrue(eventId, RegistrationStatus.APPROVED);
    }
    
    /**
     * Verify releve de note for a registration
     */
    public StudentEventRegistration verifyReleve(Long registrationId, boolean verified) {
        StudentEventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found"));
        registration.setIsReleveVerified(verified);
        return registrationRepository.save(registration);
    }
    
    /**
     * Verify bordereau for a registration
     */
    public StudentEventRegistration verifyBordereau(Long registrationId, boolean verified) {
        StudentEventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found"));
        registration.setIsBordereauVerified(verified);
        return registrationRepository.save(registration);
    }
    
    /**
     * Approve a registration
     */
    public StudentEventRegistration approveRegistration(Long registrationId) {
        StudentEventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found"));
        
        if (!registration.getIsReleveVerified() || !registration.getIsBordereauVerified()) {
            throw new IllegalStateException("Cannot approve registration: not all documents are verified");
        }
        
        registration.setStatus(RegistrationStatus.APPROVED);
        return registrationRepository.save(registration);
    }
    
    /**
     * Reject a registration
     */
    public StudentEventRegistration rejectRegistration(Long registrationId) {
        StudentEventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found"));
        registration.setStatus(RegistrationStatus.REJECTED);
        return registrationRepository.save(registration);
    }
    
    /**
     * Send convocation
     */
    public StudentEventRegistration sendConvocation(Long registrationId) {
        StudentEventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found"));
        
        if (!registration.getStatus().equals(RegistrationStatus.APPROVED)) {
            throw new IllegalStateException("Can only send convocation to approved registrations");
        }
        
        registration.setIsConvocationSent(true);
        return registrationRepository.save(registration);
    }
    
    /**
     * Count eligible registrations for an event
     */
    public long countEligibleRegistrations(Long eventId) {
        return registrationRepository.countByEventIdAndIsEligibleTrue(eventId);
    }
}
