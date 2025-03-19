package com.example.base.api.repository;

import com.example.base.api.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Recipe entity providing database operations.
 */
@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    // Additional query methods can be added here if needed
} 