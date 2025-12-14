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
 * Service for managing event registration workflow
 */
@Service
@RequiredArgsConstructor
@Transactional
public class EventRegistrationService {
    
    private final EventRegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final RegistrationNumberRepository registrationNumberRepository;
    private final MailService mailService;
    
    /**
     * Register student for an event
     */
    public EventRegistration registerForEvent(Long userId, Long eventId, String formData) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        
        // Check if registration period is open
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(event.getRegistrationStart()) || now.isAfter(event.getRegistrationEnd())) {
            throw new IllegalStateException("Registration period is not open");
        }
        
        // Check if user's BAC series is eligible
        if (!event.getEligibleSeries().contains(user.getBacSeries())) {
            throw new IllegalArgumentException("Your BAC series is not eligible for this event");
        }
        
        // Check if already registered
        Optional<EventRegistration> existing = registrationRepository.findByUserIdAndEventId(userId, eventId);
        if (existing.isPresent()) {
            throw new IllegalStateException("Already registered for this event");
        }
        
        EventRegistration registration = new EventRegistration();
        registration.setUser(user);
        registration.setEvent(event);
        registration.setFormData(formData);
        registration.setStatus(RegistrationStatus.PENDING);
        registration.setIsFormCompleted(true);
        
        return registrationRepository.save(registration);
    }
    
    /**
     * Verify payment receipt for event registration
     */
    public void verifyPayment(Long registrationId, byte[] receiptFile, String filename, String paymentRef) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found"));
        
        // TODO: Implement payment verification (check reference, validate receipt format, etc.)
        
        registration.setPaymentReceiptFile(receiptFile);
        registration.setPaymentReceiptFilename(filename);
        registration.setPaymentReference(paymentRef);
        registration.setIsPaymentVerified(true);
        registration.setStatus(RegistrationStatus.PAYMENT_VERIFIED);
        
        registrationRepository.save(registration);
    }
    
    /**
     * Approve event registration after verification
     */
    public void approveRegistration(Long registrationId) throws Exception {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found"));
        
        if (!registration.getIsPaymentVerified() || !registration.getIsFormCompleted()) {
            throw new IllegalStateException("Registration cannot be approved until all requirements are met");
        }
        
        // Assign registration number if event has custom formats
        if (!registration.getEvent().getRegistrationNumbers().isEmpty()) {
            List<RegistrationNumber> available = registrationNumberRepository
                    .findByEventIdAndIsUsedFalse(registration.getEvent().getId());
            if (!available.isEmpty()) {
                RegistrationNumber regNum = available.get(0);
                regNum.setIsUsed(true);
                regNum.setEventRegistration(registration);
                registrationNumberRepository.save(regNum);
                registration.setRegistrationNumber(regNum.getRegistrationNumber());
            }
        }
        
        registration.setStatus(RegistrationStatus.APPROVED);
        registrationRepository.save(registration);
        
        // Send summons if contest event
        if (registration.getEvent().getEventType() == EventType.CONTEST) {
            sendSummons(registration);
        }
    }
    
    /**
     * Send summons/convocation to student
     */
    private void sendSummons(EventRegistration registration) throws Exception {
        SummonsTemplate template = registration.getEvent().getSummonsTemplate();
        if (template == null) {
            throw new IllegalStateException("Summons template not found for this event");
        }
        
        String content = template.getTemplateContent()
                .replace("{studentName}", registration.getUser().getFirstName() + " " + registration.getUser().getLastName())
                .replace("{eventTitle}", registration.getEvent().getTitle())
                .replace("{contestDate}", registration.getEvent().getContestDate().toString())
                .replace("{registrationNumber}", registration.getRegistrationNumber() != null ? registration.getRegistrationNumber() : "");
        
        mailService.sendSimpleEmail(
                registration.getUser().getEmail(),
                template.getSubject(),
                content
        );
        
        registration.setIsSummonsSent(true);
        registrationRepository.save(registration);
    }
}
