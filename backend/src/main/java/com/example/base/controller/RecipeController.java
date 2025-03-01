package com.example.base.controller;

import com.example.base.entity.Recipe;
import com.example.base.entity.Category;
import com.example.base.repository.RecipeRepository;
import com.example.base.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    @Autowired
    private RecipeRepository recipeRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;

    // Get all recipes
    @GetMapping
    public ResponseEntity<List<Recipe>> getAllRecipes() {
        try {
            List<Recipe> recipes = recipeRepository.findAll();
            return new ResponseEntity<>(recipes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get recipes by category ID
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Recipe>> getRecipesByCategoryId(@PathVariable("categoryId") Long categoryId) {
        try {
            List<Recipe> recipes = recipeRepository.findByCategoryCategoryId(categoryId);
            return new ResponseEntity<>(recipes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get recipe by ID
    @GetMapping("/{id}")
    public ResponseEntity<Recipe> getRecipeById(@PathVariable("id") Long id) {
        Optional<Recipe> recipeData = recipeRepository.findById(id);
        
        if (recipeData.isPresent()) {
            return new ResponseEntity<>(recipeData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Create a new recipe
    @PostMapping
    public ResponseEntity<Recipe> createRecipe(@RequestBody Recipe recipe) {
        try {
            // Validate category exists
            if (recipe.getCategory() != null && recipe.getCategory().getCategoryId() != null) {
                Optional<Category> categoryData = categoryRepository.findById(recipe.getCategory().getCategoryId());
                if (!categoryData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                recipe.setCategory(categoryData.get());
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            Recipe savedRecipe = recipeRepository.save(recipe);
            return new ResponseEntity<>(savedRecipe, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update a recipe
    @PutMapping("/{id}")
    public ResponseEntity<Recipe> updateRecipe(@PathVariable("id") Long id, @RequestBody Recipe recipe) {
        Optional<Recipe> recipeData = recipeRepository.findById(id);
        
        if (recipeData.isPresent()) {
            Recipe existingRecipe = recipeData.get();
            
            // Update fields
            if (recipe.getName() != null) {
                existingRecipe.setName(recipe.getName());
            }
            if (recipe.getDescription() != null) {
                existingRecipe.setDescription(recipe.getDescription());
            }
            
            // Update category if provided
            if (recipe.getCategory() != null && recipe.getCategory().getCategoryId() != null) {
                Optional<Category> categoryData = categoryRepository.findById(recipe.getCategory().getCategoryId());
                if (categoryData.isPresent()) {
                    existingRecipe.setCategory(categoryData.get());
                }
            }
            
            return new ResponseEntity<>(recipeRepository.save(existingRecipe), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a recipe
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteRecipe(@PathVariable("id") Long id) {
        try {
            recipeRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Search recipes by name
    @GetMapping("/search")
    public ResponseEntity<List<Recipe>> searchRecipes(@RequestParam("name") String name) {
        try {
            List<Recipe> recipes = recipeRepository.findByNameContainingIgnoreCase(name);
            return new ResponseEntity<>(recipes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 