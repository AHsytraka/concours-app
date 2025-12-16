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

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class GradeEntryService {
    
    private final GradeEntryRepository gradeEntryRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    
    /**
     * Submit a grade entry for a student
     */
    public GradeEntry submitGradeEntry(Long eventId, Long subjectId, Long studentId, 
            Long subaccountId, Double score) throws Exception {
        
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        
        User subaccount = userRepository.findById(subaccountId)
                .orElseThrow(() -> new IllegalArgumentException("Subaccount not found"));
        
        // Check that exam date has passed
        LocalDateTime now = LocalDateTime.now();
        if (event.getContestDate() != null && now.isBefore(event.getContestDate())) {
            throw new IllegalStateException("Exam has not yet taken place. Cannot enter grades.");
        }
        
        // Check if entry already exists
        Optional<GradeEntry> existing = gradeEntryRepository.findByEventIdAndSubjectIdAndStudentId(
                eventId, subjectId, studentId);
        
        if (existing.isPresent()) {
            // Update existing entry
            GradeEntry entry = existing.get();
            entry.setScore(score);
            entry.setStatus("SUBMITTED");
            entry.setUpdatedAt(LocalDateTime.now());
            return gradeEntryRepository.save(entry);
        }
        
        // Create new entry
        GradeEntry entry = new GradeEntry();
        entry.setEvent(event);
        entry.setSubject(subject);
        entry.setStudent(student);
        entry.setSubaccount(subaccount);
        entry.setScore(score);
        entry.setStatus("SUBMITTED");
        entry.setCreatedAt(LocalDateTime.now());
        
        return gradeEntryRepository.save(entry);
    }
    
    /**
     * Get all grade entries for an event
     */
    public List<GradeEntry> getEventGradeEntries(Long eventId) {
        return gradeEntryRepository.findByEventId(eventId);
    }
    
    /**
     * Get grade entries for a specific student in an event
     */
    public List<GradeEntry> getStudentEventGrades(Long eventId, Long studentId) {
        return gradeEntryRepository.findByEventIdAndStudentId(eventId, studentId);
    }
    
    /**
     * Get grade entries entered by a subaccount
     */
    public List<GradeEntry> getSubaccountGradeEntries(Long subaccountId) {
        return gradeEntryRepository.findBySubaccountId(subaccountId);
    }
    
    /**
     * Verify a grade entry
     */
    public GradeEntry verifyGradeEntry(Long gradeEntryId, boolean verified, Long verifiedByUserId, 
            String notes) throws Exception {
        
        GradeEntry entry = gradeEntryRepository.findById(gradeEntryId)
                .orElseThrow(() -> new IllegalArgumentException("Grade entry not found"));
        
        if (verified) {
            entry.setStatus("VERIFIED");
            entry.setVerifiedByUserId(verifiedByUserId);
            entry.setVerificationNotes(notes);
            entry.setVerifiedAt(LocalDateTime.now());
        } else {
            entry.setStatus("REJECTED");
            entry.setVerificationNotes(notes);
        }
        
        entry.setUpdatedAt(LocalDateTime.now());
        return gradeEntryRepository.save(entry);
    }
    
    /**
     * Get all submitted grades for an event that need verification
     */
    public List<GradeEntry> getPendingGradeEntries(Long eventId) {
        return gradeEntryRepository.findByEventIdAndStatus(eventId, "SUBMITTED");
    }
    
    /**
     * Count completed grade entries for an event
     */
    public long getEventGradeEntryCount(Long eventId) {
        return gradeEntryRepository.countByEventId(eventId);
    }
    
    /**
     * Check if all grade entries for an event are verified
     */
    public boolean allGradesVerified(Long eventId) {
        List<GradeEntry> entries = gradeEntryRepository.findByEventId(eventId);
        if (entries.isEmpty()) return false;
        
        for (GradeEntry entry : entries) {
            if (!entry.getStatus().equals("VERIFIED")) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Delete a grade entry
     */
    public void deleteGradeEntry(Long gradeEntryId) throws Exception {
        GradeEntry entry = gradeEntryRepository.findById(gradeEntryId)
                .orElseThrow(() -> new IllegalArgumentException("Grade entry not found"));
        
        if (entry.getStatus().equals("VERIFIED")) {
            throw new IllegalStateException("Cannot delete verified grade entries");
        }
        
        gradeEntryRepository.deleteById(gradeEntryId);
    }
}
