package com.example.Inscription.service;

import com.example.Inscription.model.BacSeries;
import com.example.Inscription.model.StudentReleveDeNotes;
import com.example.Inscription.model.User;
import com.example.Inscription.repository.StudentReleveDeNotesRepository;
import com.example.Inscription.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class StudentReleveDeNotesService {
    
    private final StudentReleveDeNotesRepository releveRepository;
    private final UserRepository userRepository;
    
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED_TYPES = Set.of("application/pdf", "image/jpeg", "image/png", "image/jpg");
    
    /**
     * Upload releve de notes for a student for a specific series
     */
    public StudentReleveDeNotes uploadReleveDeNotes(Long studentId, BacSeries bacSeries, MultipartFile file) 
            throws Exception {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB");
        }
        
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Only PDF and image files are allowed");
        }
        
        // Get student
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        
        // Check if already exists
        Optional<StudentReleveDeNotes> existing = releveRepository.findByStudentIdAndBacSeries(studentId, bacSeries);
        
        StudentReleveDeNotes releve;
        if (existing.isPresent()) {
            // Update existing
            releve = existing.get();
            releve.setFileContent(file.getBytes());
            releve.setFilename(file.getOriginalFilename());
            releve.setFileType(file.getContentType());
            releve.setFileSize(file.getSize());
            releve.setUploadDate(LocalDateTime.now());
            releve.setVerified(false); // Reset verification status
            releve.setVerifiedBy(null);
            releve.setVerifiedDate(null);
            log.info("Updated releve de notes for student {} series {}", studentId, bacSeries);
        } else {
            // Create new
            releve = new StudentReleveDeNotes();
            releve.setStudent(student);
            releve.setBacSeries(bacSeries);
            releve.setFileContent(file.getBytes());
            releve.setFilename(file.getOriginalFilename());
            releve.setFileType(file.getContentType());
            releve.setFileSize(file.getSize());
            releve.setUploadDate(LocalDateTime.now());
            releve.setVerified(false);
            log.info("Uploaded new releve de notes for student {} series {}", studentId, bacSeries);
        }
        
        return releveRepository.save(releve);
    }
    
    /**
     * Get all releve de notes for a student
     */
    public List<StudentReleveDeNotes> getStudentReleveDeNotes(Long studentId) {
        return releveRepository.findByStudentId(studentId);
    }
    
    /**
     * Get releve de notes for specific student and series
     */
    public Optional<StudentReleveDeNotes> getReleveDeNotes(Long studentId, BacSeries bacSeries) {
        return releveRepository.findByStudentIdAndBacSeries(studentId, bacSeries);
    }
    
    /**
     * Download releve de notes file
     */
    @Transactional(readOnly = true)
    public byte[] downloadReleveDeNotes(Long releveId) throws Exception {
        StudentReleveDeNotes releve = releveRepository.findById(releveId)
                .orElseThrow(() -> new IllegalArgumentException("Releve de notes not found"));
        return releve.getFileContent();
    }
    
    /**
     * Verify releve de notes by admin
     */
    public StudentReleveDeNotes verifyReleveDeNotes(Long releveId, String verifiedBy, String notes) 
            throws Exception {
        StudentReleveDeNotes releve = releveRepository.findById(releveId)
                .orElseThrow(() -> new IllegalArgumentException("Releve de notes not found"));
        
        releve.setVerified(true);
        releve.setVerifiedBy(verifiedBy);
        releve.setVerifiedDate(LocalDateTime.now());
        releve.setVerificationNotes(notes);
        
        log.info("Verified releve de notes {} for student {} series {}", 
                releveId, releve.getStudent().getId(), releve.getBacSeries());
        
        return releveRepository.save(releve);
    }
    
    /**
     * Reject releve de notes by admin
     */
    public StudentReleveDeNotes rejectReleveDeNotes(Long releveId, String rejectedBy, String reason) 
            throws Exception {
        StudentReleveDeNotes releve = releveRepository.findById(releveId)
                .orElseThrow(() -> new IllegalArgumentException("Releve de notes not found"));
        
        releve.setVerified(false);
        releve.setVerifiedBy(rejectedBy);
        releve.setVerifiedDate(LocalDateTime.now());
        releve.setVerificationNotes("REJECTED: " + reason);
        
        log.info("Rejected releve de notes {} for student {} series {}", 
                releveId, releve.getStudent().getId(), releve.getBacSeries());
        
        return releveRepository.save(releve);
    }
    
    /**
     * Check if student has required series with verified releve de notes
     */
    public boolean hasVerifiedReleveForSeries(Long studentId, BacSeries requiredSeries) {
        return releveRepository.existsByStudentIdAndBacSeriesAndVerifiedTrue(studentId, requiredSeries);
    }
    
    /**
     * Get verified releve de notes for a series
     */
    public Optional<StudentReleveDeNotes> getVerifiedReleveForSeries(Long studentId, BacSeries series) {
        return releveRepository.findByStudentIdAndBacSeriesAndVerifiedTrue(studentId, series);
    }
    
    /**
     * Get all verified series for a student
     */
    public Set<BacSeries> getVerifiedSeriesForStudent(Long studentId) {
        return releveRepository.findByStudentId(studentId).stream()
                .filter(StudentReleveDeNotes::getVerified)
                .map(StudentReleveDeNotes::getBacSeries)
                .collect(Collectors.toSet());
    }
    
    /**
     * Delete releve de notes
     */
    public void deleteReleveDeNotes(Long releveId) {
        releveRepository.deleteById(releveId);
        log.info("Deleted releve de notes {}", releveId);
    }
}
