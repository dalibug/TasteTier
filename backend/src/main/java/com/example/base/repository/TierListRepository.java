package com.example.base.repository;

import com.example.base.entity.TierList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TierListRepository extends JpaRepository<TierList, Long> {
    
    List<TierList> findByUserUserId(Long userId);
    
    List<TierList> findByCategoryCategoryId(Long categoryId);
    
    List<TierList> findByUserUserIdAndCategoryCategoryId(Long userId, Long categoryId);
    
    List<TierList> findByNameContainingIgnoreCase(String name);
} 