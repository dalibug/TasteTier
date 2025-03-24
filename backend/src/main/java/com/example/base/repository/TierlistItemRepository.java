package com.example.base.repository;

import com.example.base.entity.TierlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TierlistItemRepository extends JpaRepository<TierlistItem, Long> {
    
    List<TierlistItem> findByTierListTierlistId(Long tierlistId);
    
    // Add a custom query with joins to eagerly fetch related entities
    @Query("SELECT ti FROM TierlistItem ti " +
           "LEFT JOIN FETCH ti.recipe r " +
           "LEFT JOIN FETCH ti.tier t " +
           "WHERE ti.tierList.tierlistId = :tierlistId " +
           "ORDER BY t.rankOrder, ti.position")
    List<TierlistItem> findByTierListIdWithDetails(@Param("tierlistId") Long tierlistId);
    
    List<TierlistItem> findByTierListTierlistIdAndTierTierId(Long tierlistId, Long tierId);
    
    List<TierlistItem> findByRecipeRecipeId(Long recipeId);
    
    void deleteByTierListTierlistId(Long tierlistId);
} 