package com.example.base.service;

import com.example.base.model.Recipe;
import com.example.base.repository.RecipeRepository;
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
}
