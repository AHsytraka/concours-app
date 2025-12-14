package com.example.Inscription.controller;

import com.example.Inscription.dto.EventRegistrationRequest;
import com.example.Inscription.model.*;
import com.example.Inscription.repository.*;
import com.example.Inscription.service.EventRegistrationService;
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
import java.util.Optional;

/**
 * Student Event Registration Controller
 */
@RestController
@RequestMapping("/api/student/registration")
@RequiredArgsConstructor
@Tag(name = "Student Registration", description = "Student event registration endpoints")
@SecurityRequirement(name = "bearerAuth")
public class StudentRegistrationController {
    
    private final EventRegistrationService registrationService;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    
    @PostMapping("/register-event")
    @Operation(summary = "Register for an event", description = "Register student for contest or selection event")
    public ResponseEntity<?> registerForEvent(
            Authentication authentication,
            @RequestBody EventRegistrationRequest request) {
        try {
            String email = (String) authentication.getPrincipal();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            EventRegistration registration = registrationService.registerForEvent(
                    user.getId(),
                    request.getEventId(),
                    request.getFormData()
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(registration);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/verify-payment/{registrationId}")
    @Operation(summary = "Submit payment receipt", description = "Upload payment receipt for registration verification")
    public ResponseEntity<?> submitPaymentReceipt(
            Authentication authentication,
            @PathVariable Long registrationId,
            @RequestParam("file") MultipartFile receiptFile,
            @RequestParam("paymentReference") String paymentReference) {
        try {
            EventRegistration registration = registrationRepository.findById(registrationId)
                    .orElseThrow(() -> new IllegalArgumentException("Registration not found"));
            
            String email = (String) authentication.getPrincipal();
            if (!registration.getUser().getEmail().equals(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }
            
            registrationService.verifyPayment(
                    registrationId,
                    receiptFile.getBytes(),
                    receiptFile.getOriginalFilename(),
                    paymentReference
            );
            
            return ResponseEntity.ok("Payment receipt submitted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/my-registrations")
    @Operation(summary = "Get my registrations", description = "Get all registrations for current student")
    public ResponseEntity<List<EventRegistration>> getMyRegistrations(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        List<EventRegistration> registrations = registrationRepository.findByUserId(user.getId());
        return ResponseEntity.ok(registrations);
    }
    
    @GetMapping("/{registrationId}")
    @Operation(summary = "Get registration details", description = "Get details of a specific registration")
    public ResponseEntity<?> getRegistrationDetails(
            Authentication authentication,
            @PathVariable Long registrationId) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found"));
        
        String email = (String) authentication.getPrincipal();
        if (!registration.getUser().getEmail().equals(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
        }
        
        return ResponseEntity.ok(registration);
    }
}
