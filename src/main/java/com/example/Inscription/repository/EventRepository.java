package com.example.Inscription.repository;

import com.example.Inscription.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByInstitutionId(Long institutionId);
    List<Event> findByIsActiveTrue();
    List<Event> findByRegistrationStartBeforeAndRegistrationEndAfter(LocalDateTime start, LocalDateTime end);
    List<Event> findByEventTypeAndIsActiveTrue(EventType eventType);
    
    @Query(value = "SELECT institution_id FROM events WHERE id = :eventId", nativeQuery = true)
    Optional<Long> getInstitutionIdByEventId(Long eventId);
    
    @Modifying
    @Query(value = "DELETE FROM events WHERE id = :eventId", nativeQuery = true)
    void deleteEventById(Long eventId);
}
