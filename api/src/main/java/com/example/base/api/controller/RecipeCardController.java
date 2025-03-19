package com.example.base.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recipe-cards")
@CrossOrigin(origins = "*") // Allow cross-origin requests from any origin
public class RecipeCardController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Get all recipes categorized by type (wings, pasta, steak, soup)
     * @return List of recipes grouped by category
     */
    @GetMapping("/categories")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getRecipesByCategory() {
        // Categories map to recipe.categoryId:
        // 1 = Chicken Wings, 2 = Pasta, 3 = Steak, 4 = Soup
        
        // Get all recipes from items table where they were added by our seeder
        String sql = "SELECT item_id, name, description, category_id FROM items WHERE item_id >= 29 ORDER BY item_id";
        List<Map<String, Object>> allRecipes = jdbcTemplate.queryForList(sql);
        
        // Group recipes by original recipe category (using the original order from the DataSeeder)
        Map<String, List<Map<String, Object>>> categoryMap = new java.util.HashMap<>();
        
        // Initialize with empty lists
        categoryMap.put("wings", new java.util.ArrayList<>());
        categoryMap.put("pasta", new java.util.ArrayList<>());
        categoryMap.put("steak", new java.util.ArrayList<>());
        categoryMap.put("soup", new java.util.ArrayList<>());
        
        // Fill the categories based on item_id ranges
        // Wings: items 29-33 (5 items)
        // Pasta: items 34-38 (5 items)
        // Steak: items 39-43 (5 items)
        // Soup: items 44-48 (5 items)
        for (Map<String, Object> recipe : allRecipes) {
            long itemId = ((Number) recipe.get("item_id")).longValue();
            
            if (itemId >= 29 && itemId <= 33) {
                categoryMap.get("wings").add(recipe);
            } else if (itemId >= 34 && itemId <= 38) {
                categoryMap.get("pasta").add(recipe);
            } else if (itemId >= 39 && itemId <= 43) {
                categoryMap.get("steak").add(recipe);
            } else if (itemId >= 44 && itemId <= 48) {
                categoryMap.get("soup").add(recipe);
            }
        }
        
        return ResponseEntity.ok(categoryMap);
    }
    
    /**
     * Get a specific category of recipes
     * @param category The category name (wings, pasta, steak, soup)
     * @return List of recipes in the specified category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Map<String, Object>>> getRecipesBySpecificCategory(@PathVariable String category) {
        int startId;
        int endId;
        
        // Determine ID ranges based on category
        switch (category.toLowerCase()) {
            case "wings":
                startId = 29;
                endId = 33;
                break;
            case "pasta":
                startId = 34;
                endId = 38;
                break;
            case "steak":
                startId = 39;
                endId = 43;
                break;
            case "soup":
                startId = 44;
                endId = 48;
                break;
            default:
                return ResponseEntity.badRequest().build();
        }
        
        String sql = "SELECT item_id, name, description, category_id FROM items WHERE item_id BETWEEN ? AND ? ORDER BY item_id";
        List<Map<String, Object>> recipes = jdbcTemplate.queryForList(sql, startId, endId);
        
        return ResponseEntity.ok(recipes);
    }
} 