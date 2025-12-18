package com.example.Inscription.repository;

import com.example.Inscription.model.BacSeries;
import com.example.Inscription.model.StudentReleveDeNotes;
import com.example.Inscription.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentReleveDeNotesRepository extends JpaRepository<StudentReleveDeNotes, Long> {
    
    /**
     * Find releve de notes for a specific student and series
     */
    Optional<StudentReleveDeNotes> findByStudentIdAndBacSeries(Long studentId, BacSeries bacSeries);
    
    /**
     * Find all releve de notes for a student
     */
    List<StudentReleveDeNotes> findByStudentId(Long studentId);
    
    /**
     * Find all releve de notes for a student by email
     */
    List<StudentReleveDeNotes> findByStudent(User student);
    
    /**
     * Check if student has a verified releve de notes for a specific series
     */
    boolean existsByStudentIdAndBacSeriesAndVerifiedTrue(Long studentId, BacSeries bacSeries);
    
    /**
     * Find verified releve de notes for a specific series
     */
    Optional<StudentReleveDeNotes> findByStudentIdAndBacSeriesAndVerifiedTrue(Long studentId, BacSeries bacSeries);
}
