package com.example.base.repository;

import com.example.base.entity.WeeklyChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WeeklyChallengeRepository extends JpaRepository<WeeklyChallenge, Long> {
    
    List<WeeklyChallenge> findByIsActiveTrue();
    
    @Query("SELECT wc FROM WeeklyChallenge wc WHERE wc.isActive = true ORDER BY wc.startDate DESC")
    Optional<WeeklyChallenge> findMostRecentActiveChallenge();
    
    List<WeeklyChallenge> findByCategoryCategoryId(Long categoryId);
} 