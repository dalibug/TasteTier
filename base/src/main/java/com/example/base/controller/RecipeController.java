package com.example.base.controller;

import com.example.base.model.Recipe;
import com.example.base.service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * RecipeController exposes RESTful endpoints to interact with recipe data.
 * It returns JSON data, enabling clients to retrieve all recipes, filter by category,
 * and add new recipes.
 */
@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    @Autowired
    private RecipeService recipeService;

    // GET /api/recipes - Retrieves all recipes.
    @GetMapping
    public List<Recipe> getAllRecipes() {
        return recipeService.getAllRecipes();
    }

    // GET /api/recipes/category/{categoryId} - Retrieves recipes by a specific category.
    @GetMapping("/category/{categoryId}")
    public List<Recipe> getRecipesByCategory(@PathVariable int categoryId) {
        return recipeService.getRecipesByCategory(categoryId);
    }

    // POST /api/recipes - Adds a new recipe.
    @PostMapping
    public Recipe addRecipe(@RequestBody Recipe recipe) {
        return recipeService.addRecipe(recipe);
    }
}
