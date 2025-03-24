package com.example.base.controller;

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
@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000", "http://localhost"}, allowCredentials = "true")
public class RecipeCardController {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    /**
     * Test endpoint to check database connection and table structure
     */
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        try {
            // Test if recipes table exists and what columns it has
            String sql = "SHOW COLUMNS FROM recipes";
            List<Map<String, Object>> columns = jdbcTemplate.queryForList(sql);
            
            StringBuilder result = new StringBuilder("Recipes table columns:\n");
            for (Map<String, Object> column : columns) {
                result.append(column.get("Field")).append(" - ").append(column.get("Type")).append("\n");
            }
            
            // Count recipes
            String countSql = "SELECT COUNT(*) as count FROM recipes";
            int count = jdbcTemplate.queryForObject(countSql, Integer.class);
            result.append("\nTotal recipes: ").append(count);
            
            return ResponseEntity.ok(result.toString());
        } catch (Exception e) {
            return ResponseEntity.ok("Error: " + e.getMessage() + "\n" + e.getClass().getName());
        }
    }

    /**
     * Get all recipes categorized by type (wings, pasta, steak, soup)
     * @return List of recipes grouped by category
     */
    @GetMapping("/categories")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getRecipesByCategory() {
        try {
            // Categories map to recipe.categoryId:
            // 1 = Chicken Wings, 2 = Pasta, 3 = Steak, 4 = Soup
            
            // Get all recipes from recipes table
            String sql = "SELECT recipe_id, title, description, category_id, image_url, ingredients FROM recipes ORDER BY recipe_id";
            List<Map<String, Object>> allRecipes = jdbcTemplate.queryForList(sql);
            
            // Group recipes by category
            Map<String, List<Map<String, Object>>> categoryMap = new java.util.HashMap<>();
            
            // Initialize with empty lists
            categoryMap.put("wings", new java.util.ArrayList<>());
            categoryMap.put("pasta", new java.util.ArrayList<>());
            categoryMap.put("steak", new java.util.ArrayList<>());
            categoryMap.put("soup", new java.util.ArrayList<>());
            
            // Assign recipes to categories based on category_id
            for (Map<String, Object> recipe : allRecipes) {
                Object categoryIdObj = recipe.get("category_id");
                if (categoryIdObj == null) continue;
                
                long categoryId = ((Number) categoryIdObj).longValue();
                
                switch ((int) categoryId) {
                    case 1:
                        categoryMap.get("wings").add(recipe);
                        break;
                    case 2:
                        categoryMap.get("pasta").add(recipe);
                        break;
                    case 3:
                        categoryMap.get("steak").add(recipe);
                        break;
                    case 4:
                        categoryMap.get("soup").add(recipe);
                        break;
                    default:
                        // Category not mapped, skip
                        break;
                }
            }
            
            return ResponseEntity.ok(categoryMap);
        } catch (Exception e) {
            // Log the exception details
            e.printStackTrace();
            
            // Return a more helpful error response
            Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("class", e.getClass().getName());
            
            // Return example data to prevent frontend from breaking
            Map<String, List<Map<String, Object>>> exampleData = new java.util.HashMap<>();
            exampleData.put("wings", new java.util.ArrayList<>());
            exampleData.put("pasta", new java.util.ArrayList<>());
            exampleData.put("steak", new java.util.ArrayList<>());
            exampleData.put("soup", new java.util.ArrayList<>());
            
            return ResponseEntity.ok(exampleData);
        }
    }
    
    /**
     * Get a specific category of recipes
     * @param category The category name (wings, pasta, steak, soup)
     * @return List of recipes in the specified category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Map<String, Object>>> getRecipesBySpecificCategory(@PathVariable String category) {
        try {
            int categoryId;
            
            // Determine category ID based on name
            switch (category.toLowerCase()) {
                case "wings":
                    categoryId = 1;
                    break;
                case "pasta":
                    categoryId = 2;
                    break;
                case "steak":
                    categoryId = 3;
                    break;
                case "soup":
                    categoryId = 4;
                    break;
                default:
                    return ResponseEntity.badRequest().build();
            }
            
            String sql = "SELECT recipe_id, title, description, category_id, image_url, ingredients FROM recipes WHERE category_id = ? ORDER BY recipe_id";
            List<Map<String, Object>> recipes = jdbcTemplate.queryForList(sql, categoryId);
            
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            // Log the exception details
            e.printStackTrace();
            
            // Return an empty list to prevent frontend from breaking
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }
} 