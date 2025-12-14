package com.example.Inscription.repository;

import com.example.Inscription.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    Optional<EventRegistration> findByUserIdAndEventId(Long userId, Long eventId);
    List<EventRegistration> findByEventId(Long eventId);
    List<EventRegistration> findByUserId(Long userId);
    List<EventRegistration> findByEventIdAndStatus(Long eventId, RegistrationStatus status);
    long countByEventIdAndStatus(Long eventId, RegistrationStatus status);
}
