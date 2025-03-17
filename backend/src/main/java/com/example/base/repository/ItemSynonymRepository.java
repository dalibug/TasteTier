package com.example.base.repository;

import com.example.base.entity.ItemSynonym;
import com.example.base.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemSynonymRepository extends JpaRepository<ItemSynonym, Long> {
    
    List<ItemSynonym> findByItem(Recipe item);
    
    List<ItemSynonym> findByItemRecipeId(Long recipeId);
    
    List<ItemSynonym> findBySynonymContainingIgnoreCase(String keyword);
    
    void deleteByItemRecipeId(Long recipeId);
} 