package com.example.base.repository;

import com.example.base.entity.TierlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TierlistItemRepository extends JpaRepository<TierlistItem, Long> {
    
    List<TierlistItem> findByTierListTierlistId(Long tierlistId);
    
    List<TierlistItem> findByTierListTierlistIdAndTierTierId(Long tierlistId, Long tierId);
    
    List<TierlistItem> findByRecipeRecipeId(Long recipeId);
    
    void deleteByTierListTierlistId(Long tierlistId);
} 