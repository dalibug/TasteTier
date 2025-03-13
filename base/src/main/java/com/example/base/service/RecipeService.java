package com.example.base.service;

import com.example.base.api.model.Recipe;
import com.example.base.api.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * RecipeService encapsulates the business logic for handling recipes.
 * It uses RecipeRepository to interact with the database.
 */
@Service
public class RecipeService {

    @Autowired
    private RecipeRepository recipeRepository;

    // Retrieves all recipes from the database.
    public List<Recipe> getAllRecipes() {
        return recipeRepository.findAll();
    }

    // Retrieves recipes by a specific category.
    public List<Recipe> getRecipesByCategory(int categoryId) {
        return recipeRepository.findByCategoryId(categoryId);
    }

    // Adds a new recipe to the database.
    public Recipe addRecipe(Recipe recipe) {
        return recipeRepository.save(recipe);
    }

    public Recipe updateRecipe(Long id, Recipe updatedRecipe) {
        return recipeRepository.findById(id).map(recipe -> {
            recipe.setName(updatedRecipe.getName());
            recipe.setDescription(updatedRecipe.getDescription());
            recipe.setCategoryId(updatedRecipe.getCategoryId());
            recipe.setImageUrl(updatedRecipe.getImageUrl());
            return recipeRepository.save(recipe);
        }).orElseThrow(() -> new RuntimeException("Recipe not found with id " + id));
    }

    public void deleteRecipe(Long id) {
        if (recipeRepository.existsById(id)) {
            recipeRepository.deleteById(id);
        } else {
            throw new RuntimeException("Recipe not found with id " + id);
        }
    }

}
