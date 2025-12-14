package com.example.Inscription.repository;

import com.example.Inscription.model.DeliberationRule;
import com.example.Inscription.model.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliberationRuleRepository extends JpaRepository<DeliberationRule, Long> {
    List<DeliberationRule> findByInstitutionId(Long institutionId);
    List<DeliberationRule> findByInstitutionIdAndEventType(Long institutionId, EventType eventType);
    Optional<DeliberationRule> findByInstitutionIdAndEventTypeAndIsActiveTrue(Long institutionId, EventType eventType);
    List<DeliberationRule> findByInstitutionIdAndIsActiveTrue(Long institutionId);
}
