package com.example.base.controller;

import com.example.base.entity.TierlistItem;
import com.example.base.entity.TierList;
import com.example.base.entity.Recipe;
import com.example.base.entity.Tier;
import com.example.base.repository.TierlistItemRepository;
import com.example.base.repository.TierListRepository;
import com.example.base.repository.RecipeRepository;
import com.example.base.repository.TierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.ArrayList;
import java.time.LocalDateTime;
import java.util.HashMap;

@SuppressWarnings("unused")
@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/tierlist-items")
public class TierlistItemController {

    @Autowired
    private TierlistItemRepository tierlistItemRepository;
    
    @Autowired
    private TierListRepository tierListRepository;
    
    @Autowired
    private RecipeRepository recipeRepository;
    
    @Autowired
    private TierRepository tierRepository;

    // Get all tierlist items
    @SuppressWarnings("null")
    @GetMapping
    public ResponseEntity<List<TierlistItem>> getAllTierlistItems() {
        try {
            List<TierlistItem> items = tierlistItemRepository.findAll();
            return new ResponseEntity<>(items, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tierlist items by tierlist ID
    @SuppressWarnings("null")
    @GetMapping("/tierlist/{tierlistId}")
    public ResponseEntity<List<TierlistItem>> getTierlistItemsByTierlistId(@PathVariable("tierlistId") Long tierlistId) {
        try {
            List<TierlistItem> items = tierlistItemRepository.findByTierListTierlistId(tierlistId);
            return new ResponseEntity<>(items, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tierlist items by tierlist ID and tier ID
    @SuppressWarnings("null")
    @GetMapping("/tierlist/{tierlistId}/tier/{tierId}")
    public ResponseEntity<List<TierlistItem>> getTierlistItemsByTierlistIdAndTierId(
            @PathVariable("tierlistId") Long tierlistId,
            @PathVariable("tierId") Long tierId) {
        try {
            List<TierlistItem> items = tierlistItemRepository.findByTierListTierlistIdAndTierTierId(tierlistId, tierId);
            return new ResponseEntity<>(items, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tierlist item by ID
    @GetMapping("/{id}")
    public ResponseEntity<TierlistItem> getTierlistItemById(@PathVariable("id") Long id) {
        Optional<TierlistItem> itemData = tierlistItemRepository.findById(id);
        
        if (itemData.isPresent()) {
            return new ResponseEntity<>(itemData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Create a new tierlist item
    @SuppressWarnings("null")
    @PostMapping
    public ResponseEntity<TierlistItem> createTierlistItem(@RequestBody TierlistItem tierlistItem) {
        try {
            // Validate tierlist exists
            if (tierlistItem.getTierList() != null && tierlistItem.getTierList().getTierlistId() != null) {
                Optional<TierList> tierListData = tierListRepository.findById(tierlistItem.getTierList().getTierlistId());
                if (!tierListData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                tierlistItem.setTierList(tierListData.get());
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            // Validate recipe exists
            if (tierlistItem.getRecipe() != null && tierlistItem.getRecipe().getRecipeId() != null) {
                Optional<Recipe> recipeData = recipeRepository.findById(tierlistItem.getRecipe().getRecipeId());
                if (!recipeData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                tierlistItem.setRecipe(recipeData.get());
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            // Validate tier exists
            if (tierlistItem.getTier() != null && tierlistItem.getTier().getTierId() != null) {
                Optional<Tier> tierData = tierRepository.findById(tierlistItem.getTier().getTierId());
                if (!tierData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                tierlistItem.setTier(tierData.get());
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            TierlistItem savedItem = tierlistItemRepository.save(tierlistItem);
            return new ResponseEntity<>(savedItem, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update a tierlist item
    @PutMapping("/{id}")
    public ResponseEntity<TierlistItem> updateTierlistItem(@PathVariable("id") Long id, @RequestBody TierlistItem tierlistItem) {
        Optional<TierlistItem> itemData = tierlistItemRepository.findById(id);
        
        if (itemData.isPresent()) {
            TierlistItem existingItem = itemData.get();
            
            // Update position
            if (tierlistItem.getPosition() != null) {
                existingItem.setPosition(tierlistItem.getPosition());
            }
            
            // Update tier if provided
            if (tierlistItem.getTier() != null && tierlistItem.getTier().getTierId() != null) {
                Optional<Tier> tierData = tierRepository.findById(tierlistItem.getTier().getTierId());
                if (tierData.isPresent()) {
                    existingItem.setTier(tierData.get());
                }
            }
            
            return new ResponseEntity<>(tierlistItemRepository.save(existingItem), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a tierlist item
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteTierlistItem(@PathVariable("id") Long id) {
        try {
            tierlistItemRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete all items in a tierlist
    @DeleteMapping("/tierlist/{tierlistId}")
    public ResponseEntity<HttpStatus> deleteAllItemsInTierlist(@PathVariable("tierlistId") Long tierlistId) {
        try {
            tierlistItemRepository.deleteByTierListTierlistId(tierlistId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Batch create tierlist items
    @SuppressWarnings("null")
    @PostMapping("/batch")
    public ResponseEntity<List<TierlistItem>> createTierlistItemsBatch(@RequestBody List<TierlistItem> items) {
        try {
            // Validate and process each item
            for (TierlistItem item : items) {
                // Validate tierlist exists
                if (item.getTierList() != null && item.getTierList().getTierlistId() != null) {
                    Optional<TierList> tierListData = tierListRepository.findById(item.getTierList().getTierlistId());
                    if (tierListData.isPresent()) {
                        item.setTierList(tierListData.get());
                    } else {
                        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                    }
                } else {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                
                // Validate recipe exists
                if (item.getRecipe() != null && item.getRecipe().getRecipeId() != null) {
                    Optional<Recipe> recipeData = recipeRepository.findById(item.getRecipe().getRecipeId());
                    if (recipeData.isPresent()) {
                        item.setRecipe(recipeData.get());
                    } else {
                        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                    }
                } else {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                
                // Validate tier exists
                if (item.getTier() != null && item.getTier().getTierId() != null) {
                    Optional<Tier> tierData = tierRepository.findById(item.getTier().getTierId());
                    if (tierData.isPresent()) {
                        item.setTier(tierData.get());
                    } else {
                        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                    }
                } else {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
            }
            
            List<TierlistItem> savedItems = tierlistItemRepository.saveAll(items);
            return new ResponseEntity<>(savedItems, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Create multiple tierlist items for a specific tierlist
    @SuppressWarnings("null")
    @PostMapping("/batch/{tierlistId}")
    public ResponseEntity<?> createTierlistItemsBatchForTierlist(
            @PathVariable("tierlistId") Long tierlistId,
            @RequestBody List<Map<String, Object>> itemsData) {
        try {
            // Validate tierlist exists
            System.out.println("Creating batch items for tier list ID: " + tierlistId);
            Optional<TierList> tierListData = tierListRepository.findById(tierlistId);
            if (!tierListData.isPresent()) {
                System.err.println("Tier list not found with ID: " + tierlistId);
                return new ResponseEntity<>("Tier list not found", HttpStatus.BAD_REQUEST);
            }
            TierList tierList = tierListData.get();
            System.out.println("Found tier list: " + tierList.getName());

            // Fetch all recipes for reference
            List<Recipe> allRecipes = recipeRepository.findAll();
            System.out.println("Found " + allRecipes.size() + " recipes in the database.");
            System.out.println("Recipe IDs available: " + 
                allRecipes.stream()
                .map(r -> r.getRecipeId().toString())
                .collect(java.util.stream.Collectors.joining(", ")));
            
            List<TierlistItem> items = new ArrayList<>();
            
            // Process each item from the frontend
            System.out.println("Processing " + itemsData.size() + " tierlist items from request");
            for (Map<String, Object> itemData : itemsData) {
                System.out.println("Processing tierlist item: " + itemData);
                
                TierlistItem item = new TierlistItem();
                item.setTierList(tierList);
                
                // Set position
                if (itemData.containsKey("position")) {
                    item.setPosition(((Number) itemData.get("position")).intValue());
                } else {
                    // Default position if not provided
                    item.setPosition(items.size());
                }
                
                // Set tier - check tierId field
                if (itemData.containsKey("tierId")) {
                    Long tierId = ((Number) itemData.get("tierId")).longValue();
                    Optional<Tier> tierData = tierRepository.findById(tierId);
                    if (tierData.isPresent()) {
                        item.setTier(tierData.get());
                        System.out.println("Found tier with ID: " + tierId);
                    } else {
                        System.err.println("Tier not found with ID: " + tierId);
                        // Try to get a default tier instead of failing
                        List<Tier> tiers = tierRepository.findAll();
                        if (!tiers.isEmpty()) {
                            System.out.println("Using first available tier as fallback");
                            item.setTier(tiers.get(0));
                        } else {
                            return new ResponseEntity<>("No tiers available in the system", HttpStatus.BAD_REQUEST);
                        }
                    }
                } else {
                    System.err.println("tierId field is missing in the request");
                    return new ResponseEntity<>("tierId field is required", HttpStatus.BAD_REQUEST);
                }
                
                // Set recipe from originalItemId
                Long recipeId = null;
                if (itemData.containsKey("originalItemId")) {
                    recipeId = ((Number) itemData.get("originalItemId")).longValue();
                    System.out.println("Looking for recipe with ID: " + recipeId);
                    
                    Optional<Recipe> recipeData = recipeRepository.findById(recipeId);
                    
                    if (recipeData.isPresent()) {
                        System.out.println("Found existing recipe with ID " + recipeId + ": " + recipeData.get().getTitle());
                        item.setRecipe(recipeData.get());
                    } else {
                        // Recipe doesn't exist - log an error
                        System.err.println("ERROR: Recipe with ID " + recipeId + " not found in database!");
                        
                        // Look for a close match recipe that might have a similar ID
                        final Long searchRecipeId = recipeId; // Make effectively final for lambda
                        List<Recipe> closeMatches = allRecipes.stream()
                            .filter(r -> Math.abs(r.getRecipeId() - searchRecipeId) < 5)
                            .collect(java.util.stream.Collectors.toList());
                        
                        if (!closeMatches.isEmpty()) {
                            Recipe closeMatch = closeMatches.get(0);
                            System.out.println("Found close match recipe instead: " + closeMatch.getRecipeId());
                            item.setRecipe(closeMatch);
                        } else if (!allRecipes.isEmpty()) {
                            // Use the first available recipe as a fallback
                            Recipe fallbackRecipe = allRecipes.get(0);
                            System.out.println("Using fallback recipe (first available): " + fallbackRecipe.getRecipeId());
                            item.setRecipe(fallbackRecipe);
                        } else {
                            System.err.println("No recipes available in the database - cannot create tier list item!");
                            return new ResponseEntity<>("No recipes available in the database", HttpStatus.BAD_REQUEST);
                        }
                    }
                } else if (itemData.containsKey("recipeId")) {
                    // Alternative field name
                    recipeId = ((Number) itemData.get("recipeId")).longValue();
                    System.out.println("Looking for recipe with ID (from recipeId field): " + recipeId);
                    
                    Optional<Recipe> recipeData = recipeRepository.findById(recipeId);
                    if (recipeData.isPresent()) {
                        item.setRecipe(recipeData.get());
                    } else {
                        System.err.println("ERROR: Recipe with ID " + recipeId + " not found in database!");
                        // Try to find any recipe rather than failing
                        if (!allRecipes.isEmpty()) {
                            Recipe fallbackRecipe = allRecipes.get(0);
                            System.out.println("Using fallback recipe (first available): " + fallbackRecipe.getRecipeId());
                            item.setRecipe(fallbackRecipe);
                        } else {
                            return new ResponseEntity<>("No recipes available in the database", HttpStatus.BAD_REQUEST);
                        }
                    }
                } else {
                    System.err.println("ERROR: No recipe ID field (originalItemId or recipeId) found in request");
                    return new ResponseEntity<>("Recipe ID field is required", HttpStatus.BAD_REQUEST);
                }
                
                items.add(item);
            }
            
            try {
                System.out.println("Saving " + items.size() + " tierlist items");
                List<TierlistItem> savedItems = tierlistItemRepository.saveAll(items);
                System.out.println("Successfully saved " + savedItems.size() + " items");
                
                // Convert to simple response objects to avoid lazy loading issues
                List<Map<String, Object>> responseItems = new ArrayList<>();
                for (TierlistItem savedItem : savedItems) {
                    Map<String, Object> responseItem = new HashMap<>();
                    responseItem.put("itemId", savedItem.getId());
                    responseItem.put("tierlistId", tierlistId);
                    responseItem.put("position", savedItem.getPosition());
                    responseItem.put("tierId", savedItem.getTier().getTierId());
                    if (savedItem.getRecipe() != null) {
                        responseItem.put("recipeId", savedItem.getRecipe().getRecipeId());
                        responseItem.put("recipeName", savedItem.getRecipe().getTitle());
                    }
                    responseItems.add(responseItem);
                }
                
                return new ResponseEntity<>(responseItems, HttpStatus.CREATED);
            } catch (Exception e) {
                System.err.println("Error saving tierlist items: " + e.getMessage());
                e.printStackTrace();
                return new ResponseEntity<>("Error saving tierlist items: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            System.err.println("Exception in batch endpoint: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>("Server error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 