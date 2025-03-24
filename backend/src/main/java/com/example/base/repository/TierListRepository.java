package com.example.base.repository;

import com.example.base.entity.TierList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TierListRepository extends JpaRepository<TierList, Long> {
    
    List<TierList> findByUserUserId(Long userId);
    
    @Query("SELECT t FROM TierList t WHERE t.user.userId = :userId ORDER BY t.createdAt DESC")
    List<TierList> findByUserUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);
    
    @Query("SELECT DISTINCT t FROM TierList t " +
           "LEFT JOIN FETCH t.category c " +
           "LEFT JOIN FETCH t.challenge w " +
           "WHERE t.user.userId = :userId " +
           "ORDER BY t.createdAt DESC")
    List<TierList> findByUserIdWithDetails(@Param("userId") Long userId);
    
    List<TierList> findByCategoryCategoryId(Long categoryId);
    
    List<TierList> findByUserUserIdAndCategoryCategoryId(Long userId, Long categoryId);
    
    List<TierList> findByNameContainingIgnoreCase(String name);
    
    List<TierList> findByChallengeChallengeId(Long challengeId);
} 