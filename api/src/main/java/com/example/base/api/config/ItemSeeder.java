package com.example.base.api.config;

import com.example.base.api.model.Recipe;
import com.example.base.api.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * ItemSeeder class that populates the items table with data from recipes.
 */
@SuppressWarnings("unused")
@Configuration
public class ItemSeeder {

    @Autowired
    private RecipeRepository recipeRepository;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Bean
    public CommandLineRunner seedItemsFromRecipes() {
        return args -> {
            // Get all recipes
            List<Recipe> recipes = recipeRepository.findAll();
            
            if (recipes.isEmpty()) {
                System.out.println("No recipes found to seed items from.");
                return;
            }
            
            System.out.println("Starting to seed items table from " + recipes.size() + " recipes...");
            
            // Get existing item names to avoid duplicates
            String existingItemsSql = "SELECT name FROM items";
            List<String> existingItemNames = jdbcTemplate.queryForList(existingItemsSql, String.class);
            Set<String> existingItemNamesSet = new HashSet<>(existingItemNames);
            
            System.out.println("Found " + existingItemNamesSet.size() + " existing items in the database.");
            
            // Category mapping:
            // Recipe category 1 (Chicken Wings) -> Food category (ID 2)
            // Recipe category 2 (Pasta) -> Food category (ID 2)
            // Recipe category 3 (Steak) -> Food category (ID 2)
            // Recipe category 4 (Soup) -> Food category (ID 2)
            
            // For simplicity, we'll map all recipe categories to food category ID 2
            int foodCategoryId = 2;
            
            // Default user ID for created_by (admin user)
            int createdByUserId = 1;
            
            // Current timestamp for created_at
            Timestamp now = Timestamp.from(Instant.now());
            
            // Count of new items added
            int newItemsAdded = 0;
            
            // Insert recipes as items if they don't already exist
            for (Recipe recipe : recipes) {
                if (!existingItemNamesSet.contains(recipe.getTitle())) {
                    String insertSql = "INSERT INTO items (name, description, category_id, created_by, created_at) VALUES (?, ?, ?, ?, ?)";
                    jdbcTemplate.update(
                        insertSql,
                        recipe.getTitle(),
                        recipe.getDescription(),
                        foodCategoryId,
                        createdByUserId,
                        now
                    );
                    
                    System.out.println("Added new item: " + recipe.getTitle());
                    newItemsAdded++;
                } else {
                    System.out.println("Item already exists (skipping): " + recipe.getTitle());
                }
            }
            
            // Count how many items we now have
            String countSql = "SELECT COUNT(*) FROM items";
            @SuppressWarnings("null")
            int itemCount = jdbcTemplate.queryForObject(countSql, Integer.class);
            
            System.out.println("Finished seeding items table from recipes. Added " + newItemsAdded + " new items. Total items: " + itemCount);
        };
    }
} 