package com.example.base.controller;

import com.example.base.entity.Recipe;
import com.example.base.entity.Category;
import com.example.base.entity.User;
import com.example.base.repository.RecipeRepository;
import com.example.base.repository.CategoryRepository;
import com.example.base.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000", "http://localhost"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    @Autowired
    private RecipeRepository recipeRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private UserRepository userRepository;

    // Get all recipes
    @SuppressWarnings("null")
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
    @SuppressWarnings("null")
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
    @SuppressWarnings("null")
    @PostMapping
    public ResponseEntity<Recipe> createRecipe(@RequestBody Recipe recipe) {
        try {
            // Set created time
            recipe.setCreatedAt(LocalDateTime.now());
            
            // Validate category exists if provided
            if (recipe.getCategory() != null && recipe.getCategory().getCategoryId() != null) {
                Optional<Category> categoryData = categoryRepository.findById(recipe.getCategory().getCategoryId());
                if (categoryData.isPresent()) {
                    recipe.setCategory(categoryData.get());
                } else {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
            }
            
            // Validate user exists if provided
            if (recipe.getCreatedBy() != null && recipe.getCreatedBy().getUserId() != null) {
                Optional<User> userData = userRepository.findById(recipe.getCreatedBy().getUserId());
                if (userData.isPresent()) {
                    recipe.setCreatedBy(userData.get());
                } else {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
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
            if (recipe.getTitle() != null) {
                existingRecipe.setTitle(recipe.getTitle());
            }
            if (recipe.getDescription() != null) {
                existingRecipe.setDescription(recipe.getDescription());
            }
            if (recipe.getImageUrl() != null) {
                existingRecipe.setImageUrl(recipe.getImageUrl());
            }
            if (recipe.getIngredients() != null) {
                existingRecipe.setIngredients(recipe.getIngredients());
            }
            if (recipe.getInstructions() != null) {
                existingRecipe.setInstructions(recipe.getInstructions());
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

    // Search recipes by title
    @SuppressWarnings("null")
    @GetMapping("/search")
    public ResponseEntity<List<Recipe>> searchRecipes(@RequestParam("q") String query) {
        try {
            List<Recipe> recipes = recipeRepository.findByTitleContainingIgnoreCase(query);
            return new ResponseEntity<>(recipes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 