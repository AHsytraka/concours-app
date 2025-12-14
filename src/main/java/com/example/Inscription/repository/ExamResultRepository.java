package com.example.Inscription.repository;

import com.example.Inscription.model.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {
    Optional<ExamResult> findByUserIdAndEventId(Long userId, Long eventId);
    Optional<ExamResult> findByEventIdAndUserId(Long eventId, Long userId);
    List<ExamResult> findByEventIdOrderByAverageDesc(Long eventId);
    List<ExamResult> findByEventIdAndIsOnWaitlistFalse(Long eventId);
    List<ExamResult> findByEventIdAndIsOnWaitlistTrue(Long eventId);
}
