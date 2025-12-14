package com.example.Inscription.repository;

import com.example.Inscription.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByInstitutionId(Long institutionId);
    List<Event> findByIsActiveTrue();
    List<Event> findByRegistrationStartBeforeAndRegistrationEndAfter(LocalDateTime start, LocalDateTime end);
    List<Event> findByEventTypeAndIsActiveTrue(EventType eventType);
}
