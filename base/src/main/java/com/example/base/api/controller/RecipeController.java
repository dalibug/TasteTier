package com.example.base.api.controller;

import com.example.base.api.model.Recipe;
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

    // PUT /api/recipes/{id} - Updates an existing recipe.
    @PutMapping("/{id}")
    public Recipe updateRecipe(@PathVariable Long id, @RequestBody Recipe updatedRecipe) {
        return recipeService.updateRecipe(id, updatedRecipe);
    }
    // DELETE /api/recipes/{id} - Deletes a recipe by its ID.
    @DeleteMapping("/{id}")
    public void deleteRecipe(@PathVariable Long id) {
        recipeService.deleteRecipe(id);
    }

}
