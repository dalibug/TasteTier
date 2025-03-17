package com.example.base.repository;

import com.example.base.entity.ChallengeResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChallengeResultRepository extends JpaRepository<ChallengeResult, Long> {
    
    List<ChallengeResult> findByChallengeChallengeId(Long challengeId);
    
    List<ChallengeResult> findByChallengeWeekNumberAndChallengeYear(Integer weekNumber, Integer year);
    
    List<ChallengeResult> findByIsMostSimilarTrue();
    
    List<ChallengeResult> findByIsMostUniqueTrue();
    
    List<ChallengeResult> findByGroupId(Integer groupId);
} 