package com.example.Inscription.service;

import com.example.Inscription.model.*;
import com.example.Inscription.repository.*;
import com.example.Inscription.service.ai.IADeliberationClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class DeliberationService {
    
    private final GradeEntryRepository gradeEntryRepository;
    private final EventRepository eventRepository;
    private final ExamResultRepository examResultRepository;
    private final UserRepository userRepository;
    private final GradeEntryService gradeEntryService;
    private final IADeliberationClient iaDeliberationClient;
    
    /**
     * Trigger deliberation for an event
     */
    public Map<String, Object> triggerDeliberation(Long eventId) throws Exception {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        
        // Check that exam date has passed
        LocalDateTime now = LocalDateTime.now();
        if (event.getContestEndDate() == null || now.isBefore(event.getContestEndDate())) {
            throw new IllegalStateException("Exam has not yet ended. Cannot start deliberation.");
        }
        
        // Check that all grades are verified
        List<GradeEntry> allGrades = gradeEntryRepository.findByEventId(eventId);
        boolean allVerified = allGrades.stream()
                .allMatch(g -> "VERIFIED".equals(g.getStatus()));
        
        if (!allVerified) {
            long pendingCount = allGrades.stream()
                    .filter(g -> !"VERIFIED".equals(g.getStatus()))
                    .count();
            throw new IllegalStateException("Cannot deliberate: " + pendingCount + " grades still need verification");
        }
        
        // Prepare candidate data for IA service
        List<Map<String, Object>> candidatsWithNotes = prepareCandidateData(eventId, allGrades);
        
        if (candidatsWithNotes.isEmpty()) {
            throw new IllegalStateException("No grade data available for deliberation");
        }
        
        try {
            // Call IA service
            Map<String, Object> iaResult = iaDeliberationClient.deliberateContest(eventId, candidatsWithNotes);
            
            // Process and save results from IA
            processDeliberationResults(eventId, iaResult, event.getMaxAdmissions());
            
            return Map.of(
                "message", "Deliberation completed successfully",
                "eventId", eventId,
                "resultsDate", LocalDateTime.now(),
                "status", iaResult.getOrDefault("status", "completed")
            );
        } catch (Exception e) {
            log.error("Error calling IA deliberation service for event {}: {}", eventId, e.getMessage(), e);
            throw new RuntimeException("Error in deliberation process: " + e.getMessage(), e);
        }
    }
    
    /**
     * Prepare candidate data for IA service
     */
    private List<Map<String, Object>> prepareCandidateData(Long eventId, List<GradeEntry> grades) {
        // Group grades by student
        Map<Long, List<GradeEntry>> studentGrades = grades.stream()
                .collect(Collectors.groupingBy(g -> g.getStudent().getId()));
        
        List<Map<String, Object>> candidates = new ArrayList<>();
        
        for (Map.Entry<Long, List<GradeEntry>> entry : studentGrades.entrySet()) {
            Long studentId = entry.getKey();
            List<GradeEntry> studentScores = entry.getValue();
            
            User student = userRepository.findById(studentId)
                    .orElse(null);
            
            if (student == null) continue;
            
            Map<String, Object> candidat = new HashMap<>();
            candidat.put("id", studentId);
            candidat.put("name", student.getFirstName() + " " + student.getLastName());
            candidat.put("email", student.getEmail());
            
            // Add grades by subject
            Map<String, Double> notes = new HashMap<>();
            double total = 0;
            for (GradeEntry grade : studentScores) {
                String subjectName = grade.getSubject().getName();
                notes.put(subjectName, grade.getScore());
                total += grade.getScore();
            }
            
            candidat.put("notes", notes);
            candidat.put("average", total / studentScores.size());
            candidat.put("bacSeries", student.getBacSeries() != null ? student.getBacSeries().name() : "UNKNOWN");
            
            candidates.add(candidat);
        }
        
        return candidates;
    }
    
    /**
     * Process and save deliberation results
     */
    private void processDeliberationResults(Long eventId, Map<String, Object> iaResult, Integer maxAdmissions) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results = (List<Map<String, Object>>) iaResult.get("results");
            
            if (results == null || results.isEmpty()) {
                log.warn("No results returned from IA service for event {}", eventId);
                return;
            }
            
            int admissionCount = 0;
            
            for (int i = 0; i < results.size(); i++) {
                Map<String, Object> result = results.get(i);
                
                Long studentId = ((Number) result.get("id")).longValue();
                Double average = ((Number) result.get("average")).doubleValue();
                String status = (String) result.getOrDefault("status", "REJECTED");
                
                User student = userRepository.findById(studentId)
                        .orElse(null);
                if (student == null) continue;
                
                // Determine if admitted based on ranking and max admissions
                boolean isOnWaitlist = false;
                ResultStatus resultStatus = ResultStatus.FAILED;
                
                if ("ADMITTED".equals(status)) {
                    if (maxAdmissions != null && admissionCount >= maxAdmissions) {
                        isOnWaitlist = true;
                        resultStatus = ResultStatus.WAITING_LIST;
                    } else {
                        resultStatus = ResultStatus.PASSED;
                        admissionCount++;
                    }
                }
                
                // Save or update exam result
                ExamResult examResult = examResultRepository.findByEventIdAndUserId(eventId, studentId)
                        .orElseGet(ExamResult::new);
                
                examResult.setEvent(eventRepository.findById(eventId).orElse(null));
                examResult.setUser(student);
                examResult.setAverage(average);
                examResult.setRanking(i + 1);
                examResult.setResultStatus(resultStatus);
                examResult.setIsOnWaitlist(isOnWaitlist);
                examResult.setCreatedAt(LocalDateTime.now());
                
                examResultRepository.save(examResult);
            }
            
            // Update event results date
            Event event = eventRepository.findById(eventId).orElse(null);
            if (event != null) {
                event.setResultsDate(LocalDateTime.now());
                eventRepository.save(event);
            }
            
            log.info("Deliberation completed for event {}: {} admitted, total: {}", 
                    eventId, admissionCount, results.size());
            
        } catch (Exception e) {
            log.error("Error processing deliberation results for event {}: {}", eventId, e.getMessage(), e);
            throw new RuntimeException("Error saving results: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get examination results for an event
     */
    public List<Map<String, Object>> getEventResults(Long eventId) {
        List<ExamResult> results = examResultRepository.findByEventIdOrderByAverageDesc(eventId);
        
        return results.stream().map(r -> {
            Map<String, Object> resultMap = new HashMap<>();
            resultMap.put("id", r.getId());
            resultMap.put("studentId", r.getUser().getId());
            resultMap.put("studentName", r.getUser().getFirstName() + " " + r.getUser().getLastName());
            resultMap.put("studentEmail", r.getUser().getEmail());
            resultMap.put("average", r.getAverage());
            resultMap.put("ranking", r.getRanking());
            resultMap.put("status", r.getResultStatus());
            resultMap.put("isOnWaitlist", r.getIsOnWaitlist());
            return resultMap;
        }).collect(Collectors.toList());
    }
    
    /**
     * Get student's results
     */
    public Map<String, Object> getStudentResults(Long eventId, Long studentId) throws Exception {
        ExamResult result = examResultRepository.findByEventIdAndUserId(eventId, studentId)
                .orElseThrow(() -> new IllegalArgumentException("No results found"));
        
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("id", result.getId());
        resultMap.put("eventId", eventId);
        resultMap.put("eventTitle", result.getEvent().getTitle());
        resultMap.put("average", result.getAverage());
        resultMap.put("ranking", result.getRanking());
        resultMap.put("status", result.getResultStatus());
        resultMap.put("isOnWaitlist", result.getIsOnWaitlist());
        resultMap.put("resultsDate", result.getCreatedAt());
        
        return resultMap;
    }
    
    /**
     * Submit grade entry (delegates to GradeEntryService)
     */
    public GradeEntry submitGradeEntry(Long eventId, Long subjectId, Long studentId, 
            Long subaccountId, Double score) throws Exception {
        return gradeEntryService.submitGradeEntry(eventId, subjectId, studentId, subaccountId, score);
    }
}
