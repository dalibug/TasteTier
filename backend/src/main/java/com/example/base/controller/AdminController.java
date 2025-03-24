package com.example.base.controller;

import com.example.base.repository.RecipeRepository;
import com.example.base.service.RecipeService;
import com.example.base.script.DataPopulator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000", "http://localhost"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private RecipeRepository recipeRepository;
    
    @Autowired
    private RecipeService recipeService;
    
    @Autowired
    private DataPopulator dataPopulator;

    /**
     * Endpoint to directly populate the database with sample recipe data
     */
    @PostMapping("/populate-recipes")
    public ResponseEntity<Map<String, Object>> populateRecipes(@RequestParam(value = "force", defaultValue = "false") boolean force) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            long currentCount = recipeRepository.count();
            response.put("initialCount", currentCount);
            
            if (currentCount > 0 && !force) {
                response.put("success", false);
                response.put("message", "Recipe data already exists. Use force=true parameter to override.");
                return ResponseEntity.ok(response);
            }
            
            // Clear existing data if force=true
            if (force && currentCount > 0) {
                recipeService.clearRecipesIfRequested(true);
                response.put("cleared", true);
            }
            
            // Manually call the data populator
            dataPopulator.run(new String[]{});
            
            long newCount = recipeRepository.count();
            response.put("success", true);
            response.put("message", "Recipe data populated successfully");
            response.put("recordsAfter", newCount);
            response.put("recordsAdded", newCount - (force ? 0 : currentCount));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to populate recipe data: " + e.getMessage());
            response.put("error", e.toString());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Simple test endpoint that does not require authentication
     * This can be used to check if the application is running
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Admin controller is working");
        return ResponseEntity.ok(response);
    }
}