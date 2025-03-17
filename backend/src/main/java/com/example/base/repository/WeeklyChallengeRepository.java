package com.example.base.repository;

import com.example.base.entity.WeeklyChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeeklyChallengeRepository extends JpaRepository<WeeklyChallenge, Long> {
    
    List<WeeklyChallenge> findByStatus(String status);
    
    Optional<WeeklyChallenge> findByWeekNumberAndYear(Integer weekNumber, Integer year);
    
    List<WeeklyChallenge> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(LocalDate date, LocalDate sameDate);
    
    default Optional<WeeklyChallenge> findActiveChallenge(LocalDate date) {
        List<WeeklyChallenge> activeChallenges = findByStartDateLessThanEqualAndEndDateGreaterThanEqual(date, date);
        return activeChallenges.stream()
                .filter(challenge -> "active".equalsIgnoreCase(challenge.getStatus()))
                .findFirst();
    }
} 