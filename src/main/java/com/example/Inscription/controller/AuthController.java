package com.example.Inscription.controller;

import com.example.Inscription.dto.LoginRequest;
import com.example.Inscription.dto.LoginResponse;
import com.example.Inscription.dto.StudentRegistrationRequest;
import com.example.Inscription.model.*;
import com.example.Inscription.repository.UserRepository;
import com.example.Inscription.service.AuthenticationService;
import com.example.Inscription.service.ai.AcademicRecordAnalysisService;
import com.example.Inscription.service.ai.ExtractedAcademicData;
import com.example.Inscription.config.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Optional;

/**
 * Authentication and User Management Controller
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and user registration endpoints")
public class AuthController {
    
    private final AuthenticationService authenticationService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final AcademicRecordAnalysisService academicRecordService;
    
    @PostMapping("/login")
    @Operation(summary = "Login with email and password", description = "Authenticate user and return JWT token")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Optional<User> user = authenticationService.authenticate(request.getEmail(), request.getPassword());
        
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        User authenticatedUser = user.get();
        String token = jwtTokenProvider.generateToken(authenticatedUser.getEmail(), authenticatedUser.getRole().toString());
        
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setEmail(authenticatedUser.getEmail());
        response.setRole(authenticatedUser.getRole().toString());
        response.setFirstName(authenticatedUser.getFirstName());
        response.setLastName(authenticatedUser.getLastName());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/register")
    @Operation(summary = "Register new student", description = "Create new student account with academic data")
    public ResponseEntity<?> registerStudent(@RequestBody StudentRegistrationRequest request) {
        // Validate password confirmation
        if (!request.getPassword().equals(request.getPasswordConfirm())) {
            return ResponseEntity.badRequest().body("Passwords do not match");
        }
        
        // Parse BAC series
        BacSeries bacSeries;
        try {
            bacSeries = BacSeries.valueOf(request.getBacSeries().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid BAC series");
        }
        
        try {
            User newUser = authenticationService.registerStudent(
                    request.getFirstName(),
                    request.getLastName(),
                    request.getCin(),
                    request.getEmail(),
                    request.getPassword(),
                    bacSeries
            );
            
            String token = jwtTokenProvider.generateToken(newUser.getEmail(), newUser.getRole().toString());
            
            LoginResponse response = new LoginResponse();
            response.setToken(token);
            response.setEmail(newUser.getEmail());
            response.setRole(newUser.getRole().toString());
            response.setFirstName(newUser.getFirstName());
            response.setLastName(newUser.getLastName());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/register/student")
    @Operation(summary = "Register new student (multipart)", description = "Create new student account with form data and optional transcript file")
    public ResponseEntity<?> registerStudentMultipart(
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "birthDate", required = false) String birthDate,
            @RequestParam(value = "birthPlace", required = false) String birthPlace,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "cin", required = false) String cin,
            @RequestParam(value = "bacEntries", required = false) String bacEntries,
            @RequestParam(value = "transcript", required = false) MultipartFile transcript) {
        
        try {
            System.out.println("=== REGISTER STUDENT: " + email + " ===");
            
            // Créer l'utilisateur avec les données de base
            User newUser = authenticationService.registerStudentSimple(
                    firstName,
                    lastName,
                    email,
                    password,
                    phone,
                    birthDate,
                    birthPlace,
                    address,
                    cin,
                    bacEntries
            );
            
            // Générer le token JWT
            String token = jwtTokenProvider.generateToken(newUser.getEmail(), newUser.getRole().toString());
            
            LoginResponse response = new LoginResponse();
            response.setToken(token);
            response.setEmail(newUser.getEmail());
            response.setRole(newUser.getRole().toString());
            response.setFirstName(newUser.getFirstName());
            response.setLastName(newUser.getLastName());
            
            System.out.println("=== REGISTER SUCCESS: " + newUser.getId() + " ===");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            System.out.println("=== REGISTER ERROR: " + e.getMessage() + " ===");
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.out.println("=== REGISTER ERROR: " + e.getMessage() + " ===");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Erreur lors de l'inscription: " + e.getMessage()));
        }
    }
    
    @PostMapping("/verify-academic-record")
    @Operation(summary = "Verify academic record", description = "Upload and verify academic record (relevé de notes)")
    public ResponseEntity<?> verifyAcademicRecord(@RequestParam("file") MultipartFile file) {
        try {
            byte[] fileBytes = file.getBytes();
            
            if (!academicRecordService.isValidAcademicRecord(fileBytes, file.getOriginalFilename())) {
                return ResponseEntity.badRequest().body("Invalid academic record document");
            }
            
            ExtractedAcademicData extractedData = academicRecordService.extractAcademicData(fileBytes);
            return ResponseEntity.ok(extractedData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing file: " + e.getMessage());
        }
    }
    
    @PostMapping("/register/university")
    @Operation(summary = "Register new university/institution", description = "Create new university admin account")
    public ResponseEntity<?> registerUniversity(
            @RequestParam("institutionName") String institutionName,
            @RequestParam("institutionType") String institutionType,
            @RequestParam("registrationNumber") String registrationNumber,
            @RequestParam("address") String address,
            @RequestParam("city") String city,
            @RequestParam(value = "country", required = false, defaultValue = "Madagascar") String country,
            @RequestParam("phone") String phone,
            @RequestParam(value = "website", required = false) String website,
            @RequestParam("adminFirstName") String adminFirstName,
            @RequestParam("adminLastName") String adminLastName,
            @RequestParam("adminEmail") String adminEmail,
            @RequestParam("adminPhone") String adminPhone,
            @RequestParam("password") String password,
            @RequestParam(value = "authorization", required = false) MultipartFile authorization) {
        
        try {
            System.out.println("=== REGISTER UNIVERSITY: " + institutionName + " ===");
            
            // Check if email already exists
            if (userRepository.findByEmail(adminEmail).isPresent()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Cet email est déjà utilisé"));
            }
            
            // Create the university admin user
            User newUser = authenticationService.registerUniversityAdmin(
                    adminFirstName,
                    adminLastName,
                    adminEmail,
                    password,
                    adminPhone,
                    institutionName,
                    institutionType,
                    registrationNumber,
                    address,
                    city,
                    country,
                    phone,
                    website
            );
            
            // Generate JWT token
            String token = jwtTokenProvider.generateToken(newUser.getEmail(), newUser.getRole().toString());
            
            LoginResponse response = new LoginResponse();
            response.setToken(token);
            response.setEmail(newUser.getEmail());
            response.setRole(newUser.getRole().toString());
            response.setFirstName(newUser.getFirstName());
            response.setLastName(newUser.getLastName());
            
            System.out.println("=== REGISTER UNIVERSITY SUCCESS: " + newUser.getId() + " ===");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            System.out.println("=== REGISTER UNIVERSITY ERROR: " + e.getMessage() + " ===");
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.out.println("=== REGISTER UNIVERSITY ERROR: " + e.getMessage() + " ===");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Erreur lors de l'inscription: " + e.getMessage()));
        }
    }
    
    @GetMapping("/test")
    public String test() {
        return "Auth Controller is working";
    }
    
    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get the currently authenticated user's information")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Non authentifié"));
        }
        
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Utilisateur non trouvé"));
        }
        
        User user = userOpt.get();
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "email", user.getEmail(),
            "firstName", user.getFirstName(),
            "lastName", user.getLastName(),
            "role", user.getRole().toString(),
            "name", (user.getFirstName() + " " + user.getLastName()).trim()
        ));
    }
}
