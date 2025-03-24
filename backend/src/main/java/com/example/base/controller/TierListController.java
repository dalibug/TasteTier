package com.example.base.controller;

import com.example.base.dto.TierListDTO;
import com.example.base.entity.TierList;
import com.example.base.entity.User;
import com.example.base.entity.Category;
import com.example.base.entity.WeeklyChallenge;
import com.example.base.entity.TierlistItem;
import com.example.base.entity.Recipe;
import com.example.base.entity.Tier;
import com.example.base.repository.TierListRepository;
import com.example.base.repository.UserRepository;
import com.example.base.repository.CategoryRepository;
import com.example.base.repository.WeeklyChallengeRepository;
import com.example.base.repository.TierlistItemRepository;
import com.example.base.repository.RecipeRepository;
import com.example.base.repository.TierRepository;
import com.example.base.dto.TierListCreateDto;
import com.example.base.dto.TierListCreateDto.RecipeItem;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000", "http://localhost"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/tierlists")
public class TierListController {

    @Autowired
    private TierListRepository tierListRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private WeeklyChallengeRepository challengeRepository;
    
    @Autowired
    private TierlistItemRepository tierlistItemRepository;

    @Autowired
    private RecipeRepository recipeRepository;
    
    @Autowired
    private TierRepository tierRepository;

    @PersistenceContext
    private EntityManager entityManager;

    // Get all tier lists
    @SuppressWarnings("null")
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<TierListDTO>> getAllTierLists() {
        try {
            List<TierList> tierLists = tierListRepository.findAll();
            List<TierListDTO> tierListDTOs = tierLists.stream()
                .map(TierListDTO::new)
                .collect(Collectors.toList());
            return new ResponseEntity<>(tierListDTOs, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tier lists by user id
    @GetMapping("/user/{userId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getTierListsByUserId(@PathVariable("userId") Long userId) {
        System.out.println("DEBUG TIER LIST: Fetching tier lists for user ID: " + userId);
        
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            
            if (!userOpt.isPresent()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            
            System.out.println("DEBUG TIER LIST: Found user: " + userOpt.get().getUsername());
            
            // Use SQL queries directly to get tier lists - bypassing Hibernate's date conversion issues
            List<Map<String, Object>> tierListsResponse = new ArrayList<>();
            
            try {
                // First get all tier lists
                System.out.println("DEBUG TIER LIST: Executing tier lists query for user ID: " + userId);
                @SuppressWarnings("unchecked")
                List<Object[]> tierLists = entityManager.createNativeQuery(
                    "SELECT tl.tierlist_id, tl.name, tl.created_at, tl.last_modified, " +
                    "c.category_id, c.name as category_name, " +
                    "wc.challenge_id, wc.title as challenge_title " +
                    "FROM tier_lists tl " +
                    "LEFT JOIN categories c ON tl.category_id = c.category_id " +
                    "LEFT JOIN weekly_challenges wc ON tl.challenge_id = wc.challenge_id " +
                    "WHERE tl.user_id = ? " +
                    "ORDER BY tl.created_at DESC", Object[].class)
                    .setParameter(1, userId)
                    .getResultList();
                    
                System.out.println("DEBUG TIER LIST: Found " + tierLists.size() + " tier lists");
                
                // Debug the tier lists query results
                if (tierLists.isEmpty()) {
                    System.out.println("DEBUG TIER LIST: No tier lists found in database for user " + userId);
                    
                    // Check if there are any tier lists in the database at all
                    @SuppressWarnings("unchecked")
                    List<Object[]> allTierLists = entityManager.createNativeQuery(
                        "SELECT COUNT(*) as total, COUNT(DISTINCT user_id) as users FROM tier_lists")
                        .getResultList();
                    
                    if (!allTierLists.isEmpty()) {
                        Object[] counts = allTierLists.get(0);
                        System.out.println("DEBUG TIER LIST: Total tier lists in database: " + counts[0] + 
                                          ", for " + counts[1] + " distinct users");
                    }
                    
                    // Check if any sample user has tier lists
                    @SuppressWarnings("unchecked")
                    List<Object[]> sampleUsers = entityManager.createNativeQuery(
                        "SELECT user_id, COUNT(*) as tierlist_count FROM tier_lists GROUP BY user_id LIMIT 3")
                        .getResultList();
                    
                    if (!sampleUsers.isEmpty()) {
                        System.out.println("DEBUG TIER LIST: Sample users with tier lists:");
                        for (Object[] user : sampleUsers) {
                            System.out.println("  User ID: " + user[0] + ", Tier list count: " + user[1]);
                        }
                    }
                }
                    
                // Now process each tier list
                for (Object[] row : tierLists) {
                    Long tierListId = ((Number) row[0]).longValue();
                    String name = (String) row[1];
                    
                    System.out.println("DEBUG TIER LIST: Processing tier list: " + tierListId + " - " + name);
                    
                    Map<String, Object> tierListData = new HashMap<>();
                    tierListData.put("tierlistId", tierListId);
                    tierListData.put("name", name);
                    
                    // Handle dates safely - avoiding zero date issues
                    try {
                        if (row[2] != null) {
                            tierListData.put("createdAt", row[2].toString());
                            System.out.println("DEBUG TIER LIST: Created at: " + row[2].toString());
                        }
                    } catch (Exception e) {
                        System.out.println("Warning: Error processing created_at date for tierlist " + tierListId);
                    }
                    
                    try {
                        if (row[3] != null) {
                            tierListData.put("lastModified", row[3].toString());
                        }
                    } catch (Exception e) {
                        System.out.println("Warning: Error processing last_modified date for tierlist " + tierListId);
                    }
                    
                    // Add category info
                    if (row[4] != null) {
                        tierListData.put("categoryId", ((Number) row[4]).longValue());
                        tierListData.put("categoryName", row[5]);
                        System.out.println("DEBUG TIER LIST: Category: " + row[5]);
                    }
                    
                    // Add challenge info
                    if (row[6] != null) {
                        tierListData.put("challengeId", ((Number) row[6]).longValue());
                        tierListData.put("challengeTitle", row[7]);
                    }
                    
                    // Now get items for this tier list
                    System.out.println("DEBUG TIER LIST: Fetching items for tier list: " + tierListId);
                    
                    // First check if the tierlist_recipes table has any records
                    @SuppressWarnings("unchecked")
                    List<Object> countCheck = entityManager.createNativeQuery(
                        "SELECT COUNT(*) FROM tierlist_recipes")
                        .getResultList();
                    
                    if (!countCheck.isEmpty()) {
                        System.out.println("DEBUG TIER LIST: Total records in tierlist_recipes table: " + countCheck.get(0));
                    }
                    
                    // Check for this specific tier list
                    @SuppressWarnings("unchecked")
                    List<Object> itemCheck = entityManager.createNativeQuery(
                        "SELECT COUNT(*) FROM tierlist_recipes WHERE tierlist_id = ?")
                        .setParameter(1, tierListId)
                        .getResultList();
                    
                    if (!itemCheck.isEmpty()) {
                        System.out.println("DEBUG TIER LIST: Item count for tierlist " + tierListId + ": " + itemCheck.get(0));
                    }
                    
                    // If we have items, let's verify the SQL query works correctly
                    if (!itemCheck.isEmpty() && ((Number)itemCheck.get(0)).intValue() > 0) {
                        System.out.println("DEBUG TIER LIST: Verifying raw query for tierlist_id " + tierListId);
                        
                        @SuppressWarnings("unchecked")
                        List<Object[]> rawItems = entityManager.createNativeQuery(
                            "SELECT * FROM tierlist_recipes WHERE tierlist_id = ?")
                            .setParameter(1, tierListId)
                            .setMaxResults(3)
                            .getResultList();
                            
                        if (!rawItems.isEmpty()) {
                            System.out.println("DEBUG TIER LIST: Raw items found: " + rawItems.size());
                            Object[] firstItem = rawItems.get(0);
                            
                            if (firstItem.length > 0) {
                                System.out.println("DEBUG TIER LIST: First item details - ID: " + firstItem[0] + 
                                                  ", tierlist_id: " + firstItem[1] + 
                                                  ", recipe_id: " + firstItem[2] + 
                                                  ", tier_id: " + firstItem[3]);
                            }
                        } else {
                            System.out.println("DEBUG TIER LIST: Raw query returned no results unexpectedly");
                        }
                    }
                    
                    @SuppressWarnings("unchecked")
                    List<Object[]> items = entityManager.createNativeQuery(
                        "SELECT tr.id as item_id, tr.position, " +
                        "t.tier_id, t.name as tier_name, t.rank_order as tier_rank, " +
                        "r.recipe_id, r.title as recipe_title, r.name as recipe_name, r.image_url " +
                        "FROM tierlist_recipes tr " +
                        "LEFT JOIN tiers t ON tr.tier_id = t.tier_id " +
                        "LEFT JOIN recipes r ON tr.recipe_id = r.recipe_id " +
                        "WHERE tr.tierlist_id = ? " +
                        "ORDER BY t.rank_order, tr.position", Object[].class)
                        .setParameter(1, tierListId)
                        .getResultList();
                        
                    System.out.println("DEBUG TIER LIST: Found " + items.size() + " items for tier list " + tierListId);
                    
                    // If no items were found, check if the table exists and has entries
                    if (items.isEmpty()) {
                        @SuppressWarnings("unchecked")
                        List<Object[]> schemaCheck = entityManager.createNativeQuery(
                            "SHOW COLUMNS FROM tierlist_recipes")
                            .getResultList();
                        
                        System.out.println("DEBUG TIER LIST: tierlist_recipes table structure:");
                        for (Object[] column : schemaCheck) {
                            System.out.println("  " + column[0] + " - " + column[1]);
                        }
                    }
                    
                    List<Map<String, Object>> itemsList = new ArrayList<>();
                    
                    for (Object[] item : items) {
                        Map<String, Object> itemData = new HashMap<>();
                        
                        itemData.put("itemId", ((Number) item[0]).longValue());
                        itemData.put("position", ((Number) item[1]).intValue());
                        
                        // Tier info
                        if (item[2] != null) {
                            itemData.put("tierId", ((Number) item[2]).longValue());
                            itemData.put("tierName", item[3]);
                            itemData.put("tierRank", ((Number) item[4]).intValue());
                            System.out.println("DEBUG TIER LIST: Item has tier: " + item[3]);
                        }
                        
                        // Recipe info
                        if (item[5] != null) {
                            itemData.put("recipeId", ((Number) item[5]).longValue());
                            // Use title as primary name, fallback to name field
                            String recipeName = (item[6] != null) ? (String) item[6] : 
                                              ((item[7] != null) ? (String) item[7] : "Unnamed Recipe");
                            itemData.put("recipeName", recipeName);
                            itemData.put("recipeImage", item[8]);
                            System.out.println("DEBUG TIER LIST: Item has recipe: " + recipeName);
                        }
                        
                        itemsList.add(itemData);
                    }
                    
                    tierListData.put("items", itemsList);
                    tierListsResponse.add(tierListData);
                }
                
                // Close the entity manager
                entityManager.close();
                
                System.out.println("DEBUG TIER LIST: Successfully processed " + tierListsResponse.size() + " tier lists");
                System.out.println("DEBUG TIER LIST: Response structure: " + 
                                  (tierListsResponse.isEmpty() ? "Empty" : tierListsResponse.get(0).keySet()));
                
                // Even if there are no tier lists, return an empty array with HTTP 200
                return ResponseEntity.ok(tierListsResponse);
                
            } catch (Exception e) {
                System.out.println("DEBUG TIER LIST: Error using direct SQL queries: " + e.getMessage());
                e.printStackTrace();
                
                // Fallback - return empty list with HTTP 200
                return new ResponseEntity<>(new ArrayList<>(), HttpStatus.OK);
            }
            
        } catch (Exception e) {
            System.out.println("DEBUG TIER LIST: Error getting tier lists: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tier lists by category ID
    @SuppressWarnings("null")
    @GetMapping("/category/{categoryId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<TierListDTO>> getTierListsByCategoryId(@PathVariable("categoryId") Long categoryId) {
        try {
            List<TierList> tierLists = tierListRepository.findByCategoryCategoryId(categoryId);
            List<TierListDTO> tierListDTOs = tierLists.stream()
                .map(TierListDTO::new)
                .collect(Collectors.toList());
            return new ResponseEntity<>(tierListDTOs, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tier lists by user ID and category ID
    @SuppressWarnings("null")
    @GetMapping("/user/{userId}/category/{categoryId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<TierListDTO>> getTierListsByUserIdAndCategoryId(
            @PathVariable("userId") Long userId,
            @PathVariable("categoryId") Long categoryId) {
        try {
            List<TierList> tierLists = tierListRepository.findByUserUserIdAndCategoryCategoryId(userId, categoryId);
            List<TierListDTO> tierListDTOs = tierLists.stream()
                .map(TierListDTO::new)
                .collect(Collectors.toList());
            return new ResponseEntity<>(tierListDTOs, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tier list by ID
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<TierListDTO> getTierListById(@PathVariable("id") Long id) {
        Optional<TierList> tierListData = tierListRepository.findById(id);
        
        if (tierListData.isPresent()) {
            return new ResponseEntity<>(new TierListDTO(tierListData.get()), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Create a new tier list
    @SuppressWarnings("null")
    @PostMapping
    public ResponseEntity<Map<String, Object>> createTierList(@RequestBody TierList tierList) {
        try {
            System.out.println("Creating new tier list: " + tierList.getName());
            
            // Validate user exists
            if (tierList.getUser() != null && tierList.getUser().getUserId() != null) {
                Optional<User> userData = userRepository.findById(tierList.getUser().getUserId());
                if (!userData.isPresent()) {
                    System.err.println("User not found with ID: " + tierList.getUser().getUserId());
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                tierList.setUser(userData.get());
                System.out.println("User found: " + userData.get().getUsername());
            } else {
                System.err.println("User not specified in request");
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            // Validate category exists
            if (tierList.getCategory() != null && tierList.getCategory().getCategoryId() != null) {
                Optional<Category> categoryData = categoryRepository.findById(tierList.getCategory().getCategoryId());
                if (!categoryData.isPresent()) {
                    System.err.println("Category not found with ID: " + tierList.getCategory().getCategoryId());
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                tierList.setCategory(categoryData.get());
                System.out.println("Category found: " + categoryData.get().getName());
            } else {
                System.err.println("Category not specified in request");
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            // Validate challenge exists
            if (tierList.getChallenge() != null && tierList.getChallenge().getChallengeId() != null) {
                Optional<WeeklyChallenge> challengeData = challengeRepository.findById(tierList.getChallenge().getChallengeId());
                if (!challengeData.isPresent()) {
                    System.err.println("Challenge with ID " + tierList.getChallenge().getChallengeId() + " not found");
                    // Instead of rejecting, just set challenge to null
                    tierList.setChallenge(null);
                } else {
                    tierList.setChallenge(challengeData.get());
                    System.out.println("Challenge found: " + challengeData.get().getTitle());
                }
            } else {
                // Challenge is optional, so we can proceed without it
                System.out.println("No challenge specified for tier list, continuing without one");
                tierList.setChallenge(null);
            }
            
            // Set creation time to current time
            LocalDateTime now = LocalDateTime.now();
            System.out.println("Setting creation time to: " + now);
            tierList.setCreatedAt(now);
            tierList.setLastModified(now);
            
            try {
                System.out.println("Attempting to save tier list with name: " + tierList.getName());
                System.out.println("User ID: " + (tierList.getUser() != null ? tierList.getUser().getUserId() : "null"));
                System.out.println("Category ID: " + (tierList.getCategory() != null ? tierList.getCategory().getCategoryId() : "null"));
                System.out.println("Challenge ID: " + (tierList.getChallenge() != null ? tierList.getChallenge().getChallengeId() : "null"));
                
                TierList savedTierList = tierListRepository.save(tierList);
                System.out.println("Successfully saved tier list. Generated ID: " + savedTierList.getTierlistId());
                
                // Create a simplified response map to avoid lazy loading issues
                Map<String, Object> response = new HashMap<>();
                response.put("tierlistId", savedTierList.getTierlistId());
                response.put("name", savedTierList.getName());
                response.put("createdAt", savedTierList.getCreatedAt());
                response.put("lastModified", savedTierList.getLastModified());
                response.put("userId", savedTierList.getUser().getUserId());
                response.put("categoryId", savedTierList.getCategory().getCategoryId());
                response.put("categoryName", savedTierList.getCategory().getName());
                
                if (savedTierList.getChallenge() != null) {
                    response.put("challengeId", savedTierList.getChallenge().getChallengeId());
                    response.put("challengeTitle", savedTierList.getChallenge().getTitle());
                }
                
                return new ResponseEntity<>(response, HttpStatus.CREATED);
            } catch (Exception e) {
                System.err.println("Exception while saving tier list: " + e.getMessage());
                e.printStackTrace(); // Log the specific error
                return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            System.err.println("Exception in createTierList: " + e.getMessage());
            e.printStackTrace(); // Log the specific error
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update a tier list
    @PutMapping("/{id}")
    public ResponseEntity<TierList> updateTierList(@PathVariable("id") Long id, @RequestBody TierList tierList) {
        Optional<TierList> tierListData = tierListRepository.findById(id);
        
        if (tierListData.isPresent()) {
            TierList existingTierList = tierListData.get();
            
            // Update fields
            if (tierList.getName() != null) {
                existingTierList.setName(tierList.getName());
            }
            
            // Update category if provided
            if (tierList.getCategory() != null && tierList.getCategory().getCategoryId() != null) {
                Optional<Category> categoryData = categoryRepository.findById(tierList.getCategory().getCategoryId());
                if (categoryData.isPresent()) {
                    existingTierList.setCategory(categoryData.get());
                }
            }
            
            // Update challenge if provided
            if (tierList.getChallenge() != null && tierList.getChallenge().getChallengeId() != null) {
                Optional<WeeklyChallenge> challengeData = challengeRepository.findById(tierList.getChallenge().getChallengeId());
                if (challengeData.isPresent()) {
                    existingTierList.setChallenge(challengeData.get());
                }
            }
            
            // Update last modified time
            existingTierList.setLastModified(LocalDateTime.now());
            
            return new ResponseEntity<>(tierListRepository.save(existingTierList), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a tier list
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteTierList(@PathVariable("id") Long id) {
        try {
            tierListRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Search tier lists by name
    @SuppressWarnings("null")
    @GetMapping("/search")
    @Transactional(readOnly = true)
    public ResponseEntity<List<TierListDTO>> searchTierLists(@RequestParam("name") String name) {
        try {
            List<TierList> tierLists = tierListRepository.findByNameContainingIgnoreCase(name);
            List<TierListDTO> tierListDTOs = tierLists.stream()
                .map(TierListDTO::new)
                .collect(Collectors.toList());
            return new ResponseEntity<>(tierListDTOs, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tier lists by challenge ID
    @GetMapping("/challenge/{challengeId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<TierListDTO>> getTierListsByChallengeId(@PathVariable("challengeId") Long challengeId) {
        try {
            List<TierList> tierLists = tierListRepository.findByChallengeChallengeId(challengeId);
            List<TierListDTO> tierListDTOs = tierLists.stream()
                .map(TierListDTO::new)
                .collect(Collectors.toList());
            return new ResponseEntity<>(tierListDTOs, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // New method to create a tier list with recipes
    @SuppressWarnings("null")
    @PostMapping("/with-recipes")
    public ResponseEntity<Map<String, Object>> createTierListWithRecipes(@RequestBody TierListCreateDto tierListDto) {
        try {
            System.out.println("Creating new tier list with recipes: " + tierListDto.getName());
            
            // First, create and save the tier list
            TierList tierList = new TierList();
            tierList.setName(tierListDto.getName());
            tierList.setIsPublic(tierListDto.getIsPublic() != null ? tierListDto.getIsPublic() : true);
            
            // Set user
            if (tierListDto.getUserId() != null) {
                Optional<User> userData = userRepository.findById(tierListDto.getUserId());
                if (!userData.isPresent()) {
                    System.err.println("User not found with ID: " + tierListDto.getUserId());
                    return new ResponseEntity<>(Map.of("error", "User not found"), HttpStatus.BAD_REQUEST);
                }
                tierList.setUser(userData.get());
                System.out.println("User found: " + userData.get().getUsername());
            } else {
                System.err.println("User ID not specified in request");
                return new ResponseEntity<>(Map.of("error", "User ID is required"), HttpStatus.BAD_REQUEST);
            }
            
            // Set category
            if (tierListDto.getCategoryId() != null) {
                Optional<Category> categoryData = categoryRepository.findById(tierListDto.getCategoryId());
                if (!categoryData.isPresent()) {
                    System.err.println("Category not found with ID: " + tierListDto.getCategoryId());
                    return new ResponseEntity<>(Map.of("error", "Category not found"), HttpStatus.BAD_REQUEST);
                }
                tierList.setCategory(categoryData.get());
                System.out.println("Category found: " + categoryData.get().getName());
            } else {
                System.err.println("Category ID not specified in request");
                return new ResponseEntity<>(Map.of("error", "Category ID is required"), HttpStatus.BAD_REQUEST);
            }
            
            // Set challenge (optional)
            if (tierListDto.getChallengeId() != null) {
                Optional<WeeklyChallenge> challengeData = challengeRepository.findById(tierListDto.getChallengeId());
                if (!challengeData.isPresent()) {
                    System.err.println("Challenge with ID " + tierListDto.getChallengeId() + " not found");
                    // Instead of rejecting, just set challenge to null
                    tierList.setChallenge(null);
                } else {
                    tierList.setChallenge(challengeData.get());
                    System.out.println("Challenge found with ID: " + challengeData.get().getChallengeId());
                }
            } else {
                // Challenge is optional, so we can proceed without it
                System.out.println("No challenge specified for tier list, continuing without one");
                tierList.setChallenge(null);
            }
            
            // Set creation time to current time
            LocalDateTime now = LocalDateTime.now();
            System.out.println("Setting creation time to: " + now);
            tierList.setCreatedAt(now);
            tierList.setLastModified(now);
            
            // Save the tier list
            TierList savedTierList = tierListRepository.save(tierList);
            System.out.println("Successfully saved tier list. Generated ID: " + savedTierList.getTierlistId());
            
            // Now process and save the recipe items
            if (tierListDto.getRecipes() != null && !tierListDto.getRecipes().isEmpty()) {
                List<TierlistItem> tierlistItems = new ArrayList<>();
                
                for (RecipeItem recipeItem : tierListDto.getRecipes()) {
                    // Validate recipe exists
                    Optional<Recipe> recipeData = recipeRepository.findById(recipeItem.getRecipeId());
                    if (!recipeData.isPresent()) {
                        System.err.println("Recipe not found with ID: " + recipeItem.getRecipeId());
                        continue; // Skip this recipe but continue processing others
                    }
                    
                    // Validate tier exists
                    Optional<Tier> tierData = tierRepository.findById(recipeItem.getTierId());
                    if (!tierData.isPresent()) {
                        System.err.println("Tier not found with ID: " + recipeItem.getTierId());
                        continue; // Skip this tier but continue processing others
                    }
                    
                    // Create the tierlist item
                    TierlistItem item = new TierlistItem();
                    item.setTierList(savedTierList);
                    item.setRecipe(recipeData.get());
                    item.setTier(tierData.get());
                    item.setPosition(recipeItem.getPosition() != null ? recipeItem.getPosition() : 0);
                    
                    tierlistItems.add(item);
                }
                
                // Save all the tierlist items
                if (!tierlistItems.isEmpty()) {
                    List<TierlistItem> savedItems = tierlistItemRepository.saveAll(tierlistItems);
                    System.out.println("Saved " + savedItems.size() + " tierlist items");
                } else {
                    System.out.println("No valid tierlist items to save");
                }
            }
            
            // Create a simplified response map to avoid lazy loading issues
            Map<String, Object> response = new HashMap<>();
            response.put("tierlistId", savedTierList.getTierlistId());
            response.put("name", savedTierList.getName());
            response.put("createdAt", savedTierList.getCreatedAt());
            response.put("lastModified", savedTierList.getLastModified());
            response.put("userId", savedTierList.getUser().getUserId());
            response.put("categoryId", savedTierList.getCategory().getCategoryId());
            response.put("categoryName", savedTierList.getCategory().getName());
            response.put("isPublic", savedTierList.getIsPublic());
            
            if (savedTierList.getChallenge() != null) {
                response.put("challengeId", savedTierList.getChallenge().getChallengeId());
            }
            
            // Include count of recipes added
            if (tierListDto.getRecipes() != null) {
                response.put("recipesAdded", tierListDto.getRecipes().size());
            }
            
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("Exception in createTierListWithRecipes: " + e.getMessage());
            e.printStackTrace(); // Log the specific error
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 