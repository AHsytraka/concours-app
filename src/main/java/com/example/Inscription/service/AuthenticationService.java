package com.example.Inscription.service;

import com.example.Inscription.model.*;
import com.example.Inscription.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

/**
 * Service for user authentication and registration
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AuthenticationService {
    
    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * Register a new student with extracted academic data
     */
    public User registerStudent(String firstName, String lastName, String cin, 
                                String email, String password, BacSeries bacSeries) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setCin(cin);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(UserRole.STUDENT);
        user.setBacSeries(bacSeries);
        user.setIsActive(true);
        
        return userRepository.save(user);
    }
    
    /**
     * Authenticate user with email and password
     */
    public Optional<User> authenticate(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent() && passwordEncoder.matches(password, user.get().getPassword())) {
            return user;
        }
        return Optional.empty();
    }
    
    /**
     * Register a new student with simple form data (no CIN, no BAC series enum)
     */
    public User registerStudentSimple(String firstName, String lastName, 
                                      String email, String password,
                                      String phone, String birthDate,
                                      String birthPlace, String address,
                                      String cin, String bacEntries) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Un compte avec cet email existe déjà");
        }
        
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(UserRole.STUDENT);
        user.setPhone(phone);
        user.setBirthDate(birthDate);
        user.setBirthPlace(birthPlace);
        user.setAddress(address);
        user.setCin(cin);
        user.setBacEntries(bacEntries); // JSON string with multiple bac entries
        user.setIsActive(true);
        
        return userRepository.save(user);
    }
    
    /**
     * Register a new university admin
     */
    public User registerUniversityAdmin(String firstName, String lastName,
                                        String email, String password,
                                        String phone,
                                        String institutionName, String institutionType,
                                        String registrationNumber, String address,
                                        String city, String country,
                                        String institutionPhone, String website) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Un compte avec cet email existe déjà");
        }
        
        // Create the Institution first
        Institution institution = new Institution();
        institution.setName(institutionName);
        institution.setType(institutionType);
        institution.setRegistrationNumber(registrationNumber);
        institution.setAddress(address);
        institution.setCity(city);
        institution.setCountry(country);
        institution.setPhoneNumber(institutionPhone);
        institution.setWebsite(website);
        institution.setEmail(email);
        institution.setIsActive(true);
        // Generate acronym from institution name (first letters of each word)
        String acronym = generateAcronym(institutionName);
        institution.setAcronym(acronym);
        
        Institution savedInstitution = institutionRepository.save(institution);
        
        // Create the admin user
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(UserRole.INSTITUTION_ADMIN);
        user.setPhone(phone);
        user.setAddress(address);
        user.setIsActive(true);
        user.setInstitution(savedInstitution);
        
        return userRepository.save(user);
    }
    
    /**
     * Generate acronym from institution name
     */
    private String generateAcronym(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "INST";
        }
        StringBuilder acronym = new StringBuilder();
        String[] words = name.trim().split("\\s+");
        for (String word : words) {
            if (!word.isEmpty() && Character.isLetter(word.charAt(0))) {
                acronym.append(Character.toUpperCase(word.charAt(0)));
            }
        }
        return acronym.length() > 0 ? acronym.toString() : "INST";
    }
}
