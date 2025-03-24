package com.example.base.controller;

import com.example.base.entity.Recipe;
import com.example.base.repository.RecipeRepository;
import com.example.base.service.RecipeService;
import com.example.base.script.DataPopulator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000", "http://localhost"}, allowCredentials = "true")
@RestController
@RequestMapping("/test")
public class TestController {

    @Autowired
    private RecipeRepository recipeRepository;
    
    @Autowired
    private RecipeService recipeService;
    
    @Autowired
    private DataPopulator dataPopulator;

    /**
     * Simple test endpoint that does not require authentication
     * This can be used to check if the application is running
     */
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Test controller is working");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Public endpoint to view all recipes without authentication
     */
    @GetMapping("/recipes")
    public ResponseEntity<List<Recipe>> getAllRecipes() {
        try {
            List<Recipe> recipes = recipeRepository.findAll();
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    /**
     * Simple endpoint to populate recipes with sample data without authentication
     * FOR TESTING PURPOSES ONLY
     */
    @GetMapping("/seed-recipes")
    public ResponseEntity<Map<String, Object>> seedRecipesFromApi() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            long currentCount = recipeRepository.count();
            response.put("initialCount", currentCount);
            
            // Clear existing data
            recipeService.clearRecipesIfRequested(true);
            
            // Populate with sample data using DataPopulator
            dataPopulator.run(new String[]{});
            
            long newCount = recipeRepository.count();
            int addedCount = (int)(newCount - currentCount);
            
            response.put("success", true);
            response.put("message", "Recipe data populated successfully with sample data");
            response.put("recordsAfter", newCount);
            response.put("recordsAdded", addedCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to populate recipe data: " + e.getMessage());
            response.put("error", e.toString());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
} 