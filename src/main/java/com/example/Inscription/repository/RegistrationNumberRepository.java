package com.example.Inscription.repository;

import com.example.Inscription.model.RegistrationNumber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RegistrationNumberRepository extends JpaRepository<RegistrationNumber, Long> {
    List<RegistrationNumber> findByEventIdAndIsUsedFalse(Long eventId);
    long countByEventIdAndIsUsedFalse(Long eventId);
}
