package com.example.Inscription.repository;

import com.example.Inscription.model.StudentEventRegistration;
import com.example.Inscription.model.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentEventRegistrationRepository extends JpaRepository<StudentEventRegistration, Long> {
    
    List<StudentEventRegistration> findByUserId(Long userId);
    
    List<StudentEventRegistration> findByEventId(Long eventId);
    
    List<StudentEventRegistration> findByEventIdAndStatus(Long eventId, RegistrationStatus status);
    
    Optional<StudentEventRegistration> findByUserIdAndEventId(Long userId, Long eventId);
    
    List<StudentEventRegistration> findByEventIdAndIsEligibleTrue(Long eventId);
    
    List<StudentEventRegistration> findByEventIdAndStatusAndIsEligibleTrue(Long eventId, RegistrationStatus status);
    
    long countByEventId(Long eventId);
    
    long countByEventIdAndIsEligibleTrue(Long eventId);
}
