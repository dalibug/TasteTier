package com.example.base.api.repository;

import com.example.base.api.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * RecipeRepository provides CRUD operations for Recipe entities.
 * It extends JpaRepository, so it inherits many useful methods automatically.
 */
@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    // Custom query method to retrieve recipes by category.
    List<Recipe> findByCategoryId(int categoryId);
}
