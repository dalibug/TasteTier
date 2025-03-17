package com.example.base.repository;

import com.example.base.entity.WeeklyChallengeCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeeklyChallengeCategoryRepository extends JpaRepository<WeeklyChallengeCategory, Long> {
    
    List<WeeklyChallengeCategory> findByChallengeChallengeId(Long challengeId);
    
    List<WeeklyChallengeCategory> findByCategoryCategoryId(Long categoryId);
    
    void deleteByChallengeChallengeId(Long challengeId);
} 