package com.example.Inscription.repository;

import com.example.Inscription.model.GradeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeEntryRepository extends JpaRepository<GradeEntry, Long> {
    List<GradeEntry> findByEventId(Long eventId);
    List<GradeEntry> findByStudentId(Long studentId);
    List<GradeEntry> findByEventIdAndStudentId(Long eventId, Long studentId);
    List<GradeEntry> findByEventIdAndSubjectId(Long eventId, Long subjectId);
    List<GradeEntry> findByEventIdAndStatus(Long eventId, String status);
    List<GradeEntry> findBySubaccountId(Long subaccountId);
    Optional<GradeEntry> findByEventIdAndSubjectIdAndStudentId(Long eventId, Long subjectId, Long studentId);
    long countByEventIdAndStatus(Long eventId, String status);
    long countByEventId(Long eventId);
}
