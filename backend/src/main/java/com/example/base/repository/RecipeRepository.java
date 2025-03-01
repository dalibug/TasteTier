package com.example.base.repository;

import com.example.base.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    
    List<Recipe> findByCategoryCategoryId(Long categoryId);
    
    List<Recipe> findByNameContainingIgnoreCase(String name);
} 