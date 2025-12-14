package com.example.Inscription.repository;

import com.example.Inscription.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByCin(String cin);
    boolean existsByEmail(String email);
    List<User> findByInstitutionIdAndRole(Long institutionId, UserRole role);
    List<User> findByInstitutionId(Long institutionId);
}
