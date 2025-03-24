package com.example.base.repository;

import com.example.base.entity.WeeklyChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WeeklyChallengeRepository extends JpaRepository<WeeklyChallenge, Long> {
    
    List<WeeklyChallenge> findByStatusEquals(String status);
    
    Optional<WeeklyChallenge> findFirstByStatusEqualsOrderByStartDateDesc(String status);
} 