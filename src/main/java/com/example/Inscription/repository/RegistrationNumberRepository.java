package com.example.Inscription.repository;

import com.example.Inscription.model.RegistrationNumber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RegistrationNumberRepository extends JpaRepository<RegistrationNumber, Long> {
    List<RegistrationNumber> findByEventIdAndIsUsedFalse(Long eventId);
    List<RegistrationNumber> findByEventId(Long eventId);
    long countByEventIdAndIsUsedFalse(Long eventId);
    
    @Modifying
    @Query(value = "DELETE FROM registration_numbers WHERE event_id = :eventId", nativeQuery = true)
    void deleteByEventIdNative(Long eventId);
}
