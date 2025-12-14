package com.example.Inscription.controller;

import com.example.Inscription.model.*;
import com.example.Inscription.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
            
            // Find inscription by email to get associated documents
            List<Inscription> inscriptions = inscriptionRepository.findByEmail(email);
            
            if (!inscriptions.isEmpty()) {
                Inscription inscription = inscriptions.get(0);
                // Get documents for this inscription
                List<Document> documents = documentRepository.findAll().stream()
                        .filter(d -> d.getInscription() != null && d.getInscription().getId() == inscription.getId())
                        .toList();
                
                if (!documents.isEmpty()) {
                    Document doc = documents.stream()
                            .filter(d -> d.getTypeDocument() != null && d.getTypeDocument().contains("releve"))
                            .findFirst()
                            .orElse(documents.get(0));
                    
                    Map<String, Object> result = new HashMap<>();
                    result.put("id", doc.getId());
                    result.put("fileName", doc.getNom_fic());
                    result.put("type", doc.getTypeDocument());
                    result.put("url", "/api/documents/" + doc.getId());
                    return ResponseEntity.ok(result);
                }
            }
            
            return ResponseEntity.ok(Map.of("message", "No transcript found"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
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
}
