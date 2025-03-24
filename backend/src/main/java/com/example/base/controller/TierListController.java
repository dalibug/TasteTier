package com.example.base.controller;

import com.example.base.entity.TierList;
import com.example.base.entity.User;
import com.example.base.entity.Category;
import com.example.base.entity.WeeklyChallenge;
import com.example.base.entity.TierlistItem;
import com.example.base.repository.TierListRepository;
import com.example.base.repository.UserRepository;
import com.example.base.repository.CategoryRepository;
import com.example.base.repository.WeeklyChallengeRepository;
import com.example.base.repository.TierlistItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000"}, allowCredentials = "true")
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

    // Get all tier lists
    @SuppressWarnings("null")
    @GetMapping
    public ResponseEntity<List<TierList>> getAllTierLists() {
        try {
            List<TierList> tierLists = tierListRepository.findAll();
            return new ResponseEntity<>(tierLists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tier lists by user id
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getTierListsByUserId(@PathVariable Long userId) {
        System.out.println("TIER LIST DEBUGGING: Getting tier lists for user ID: " + userId);
        try {
            // Check if user exists
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                System.out.println("TIER LIST DEBUGGING: User with ID: " + userId + " not found");
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            
            // Use SQL queries directly to get tier lists - bypassing Hibernate's date conversion issues
            List<Map<String, Object>> tierListsResponse = new ArrayList<>();
            
            // Get tier lists using the tables API approach (which works)
            try {
                // Build tier list data using direct entity manager queries to avoid zero date issues
                javax.persistence.EntityManager entityManager = 
                    ((org.springframework.orm.jpa.JpaTransactionManager) org.springframework.transaction.support.TransactionSynchronizationManager
                        .getResourceMap().keySet().stream()
                        .filter(o -> o instanceof org.springframework.orm.jpa.JpaTransactionManager)
                        .findFirst().orElse(null))
                    .getEntityManagerFactory().createEntityManager();
                    
                // First get all tier lists
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
                    
                // Now process each tier list
                for (Object[] row : tierLists) {
                    Long tierListId = ((Number) row[0]).longValue();
                    String name = (String) row[1];
                    
                    Map<String, Object> tierListData = new HashMap<>();
                    tierListData.put("tierlistId", tierListId);
                    tierListData.put("name", name);
                    
                    // Handle dates safely - avoiding zero date issues
                    try {
                        if (row[2] != null) {
                            tierListData.put("createdAt", row[2].toString());
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
                    }
                    
                    // Add challenge info
                    if (row[6] != null) {
                        tierListData.put("challengeId", ((Number) row[6]).longValue());
                        tierListData.put("challengeTitle", row[7]);
                    }
                    
                    // Now get items for this tier list
                    @SuppressWarnings("unchecked")
                    List<Object[]> items = entityManager.createNativeQuery(
                        "SELECT tr.id as item_id, tr.position, " +
                        "t.tier_id, t.name as tier_name, t.rank as tier_rank, " +
                        "r.recipe_id, r.title as recipe_name, r.name as recipe_alt_name, r.image_url " +
                        "FROM tierlist_recipes tr " +
                        "LEFT JOIN tiers t ON tr.tier_id = t.tier_id " +
                        "LEFT JOIN recipes r ON tr.recipe_id = r.recipe_id " +
                        "WHERE tr.tierlist_id = ? " +
                        "ORDER BY t.rank, tr.position", Object[].class)
                        .setParameter(1, tierListId)
                        .getResultList();
                        
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
                        }
                        
                        // Recipe info
                        if (item[5] != null) {
                            itemData.put("recipeId", ((Number) item[5]).longValue());
                            // Use title as primary name, fallback to name field
                            String recipeName = (item[6] != null) ? (String) item[6] : 
                                               ((item[7] != null) ? (String) item[7] : "Unnamed Recipe");
                            itemData.put("recipeName", recipeName);
                            itemData.put("recipeImage", item[8]);
                        }
                        
                        itemsList.add(itemData);
                    }
                    
                    tierListData.put("items", itemsList);
                    tierListsResponse.add(tierListData);
                }
                
                // Close the entity manager
                entityManager.close();
                
            } catch (Exception e) {
                System.out.println("TIER LIST DEBUGGING: Error using direct SQL queries: " + e.getMessage());
                e.printStackTrace();
                
                // Fallback - return empty list
                return new ResponseEntity<>(new ArrayList<>(), HttpStatus.OK);
            }
            
            System.out.println("TIER LIST DEBUGGING: Successfully processed " + tierListsResponse.size() + " tier lists");
            return new ResponseEntity<>(tierListsResponse, HttpStatus.OK);
            
        } catch (Exception e) {
            System.out.println("TIER LIST DEBUGGING: Error getting tier lists: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tier lists by category ID
    @SuppressWarnings("null")
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<TierList>> getTierListsByCategoryId(@PathVariable("categoryId") Long categoryId) {
        try {
            List<TierList> tierLists = tierListRepository.findByCategoryCategoryId(categoryId);
            return new ResponseEntity<>(tierLists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tier lists by user ID and category ID
    @SuppressWarnings("null")
    @GetMapping("/user/{userId}/category/{categoryId}")
    public ResponseEntity<List<TierList>> getTierListsByUserIdAndCategoryId(
            @PathVariable("userId") Long userId,
            @PathVariable("categoryId") Long categoryId) {
        try {
            List<TierList> tierLists = tierListRepository.findByUserUserIdAndCategoryCategoryId(userId, categoryId);
            return new ResponseEntity<>(tierLists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tier list by ID
    @GetMapping("/{id}")
    public ResponseEntity<TierList> getTierListById(@PathVariable("id") Long id) {
        Optional<TierList> tierListData = tierListRepository.findById(id);
        
        if (tierListData.isPresent()) {
            return new ResponseEntity<>(tierListData.get(), HttpStatus.OK);
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
    public ResponseEntity<List<TierList>> searchTierLists(@RequestParam("name") String name) {
        try {
            List<TierList> tierLists = tierListRepository.findByNameContainingIgnoreCase(name);
            return new ResponseEntity<>(tierLists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tier lists by challenge ID
    @GetMapping("/challenge/{challengeId}")
    public ResponseEntity<List<TierList>> getTierListsByChallengeId(@PathVariable("challengeId") Long challengeId) {
        try {
            List<TierList> tierLists = tierListRepository.findByChallengeChallengeId(challengeId);
            return new ResponseEntity<>(tierLists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 