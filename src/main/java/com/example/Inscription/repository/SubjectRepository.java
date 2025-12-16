package com.example.Inscription.repository;

import com.example.Inscription.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByEventId(Long eventId);
    void deleteByEventId(Long eventId);
    
    @Modifying
    @Query(value = "DELETE FROM subjects WHERE event_id = :eventId", nativeQuery = true)
    void deleteByEventIdNative(Long eventId);
}
