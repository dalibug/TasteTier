package com.example.base.controller;

import com.example.base.entity.TierList;
import com.example.base.entity.User;
import com.example.base.entity.Category;
import com.example.base.entity.WeeklyChallenge;
import com.example.base.repository.TierListRepository;
import com.example.base.repository.UserRepository;
import com.example.base.repository.CategoryRepository;
import com.example.base.repository.WeeklyChallengeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
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

    // Get all tier lists
    @GetMapping
    public ResponseEntity<List<TierList>> getAllTierLists() {
        try {
            List<TierList> tierLists = tierListRepository.findAll();
            return new ResponseEntity<>(tierLists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get public tier lists
    @GetMapping("/public")
    public ResponseEntity<List<TierList>> getPublicTierLists() {
        try {
            List<TierList> tierLists = tierListRepository.findByIsPublicTrue();
            return new ResponseEntity<>(tierLists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tier lists by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TierList>> getTierListsByUserId(@PathVariable("userId") Long userId) {
        try {
            List<TierList> tierLists = tierListRepository.findByUserUserId(userId);
            return new ResponseEntity<>(tierLists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get public tier lists by user ID
    @GetMapping("/user/{userId}/public")
    public ResponseEntity<List<TierList>> getPublicTierListsByUserId(@PathVariable("userId") Long userId) {
        try {
            List<TierList> tierLists = tierListRepository.findByUserUserIdAndIsPublicTrue(userId);
            return new ResponseEntity<>(tierLists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tier lists by category ID
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<TierList>> getTierListsByCategoryId(@PathVariable("categoryId") Long categoryId) {
        try {
            List<TierList> tierLists = tierListRepository.findByCategoryCategoryId(categoryId);
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
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tier lists by user ID and category ID
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
    
    // Get tier lists by user ID and challenge ID
    @GetMapping("/user/{userId}/challenge/{challengeId}")
    public ResponseEntity<List<TierList>> getTierListsByUserIdAndChallengeId(
            @PathVariable("userId") Long userId,
            @PathVariable("challengeId") Long challengeId) {
        try {
            List<TierList> tierLists = tierListRepository.findByUserUserIdAndChallengeChallengeId(userId, challengeId);
            return new ResponseEntity<>(tierLists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get tier lists by category ID and challenge ID
    @GetMapping("/category/{categoryId}/challenge/{challengeId}")
    public ResponseEntity<List<TierList>> getTierListsByCategoryIdAndChallengeId(
            @PathVariable("categoryId") Long categoryId,
            @PathVariable("challengeId") Long challengeId) {
        try {
            List<TierList> tierLists = tierListRepository.findByCategoryCategoryIdAndChallengeChallengeId(categoryId, challengeId);
            return new ResponseEntity<>(tierLists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get tier lists by user ID, category ID, and challenge ID
    @GetMapping("/user/{userId}/category/{categoryId}/challenge/{challengeId}")
    public ResponseEntity<List<TierList>> getTierListsByUserIdAndCategoryIdAndChallengeId(
            @PathVariable("userId") Long userId,
            @PathVariable("categoryId") Long categoryId,
            @PathVariable("challengeId") Long challengeId) {
        try {
            List<TierList> tierLists = tierListRepository.findByUserUserIdAndCategoryCategoryIdAndChallengeChallengeId(
                    userId, categoryId, challengeId);
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
    @PostMapping
    public ResponseEntity<TierList> createTierList(@RequestBody TierList tierList) {
        try {
            // Validate user exists
            if (tierList.getUser() != null && tierList.getUser().getUserId() != null) {
                Optional<User> userData = userRepository.findById(tierList.getUser().getUserId());
                if (!userData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                tierList.setUser(userData.get());
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            // Validate category exists
            if (tierList.getCategory() != null && tierList.getCategory().getCategoryId() != null) {
                Optional<Category> categoryData = categoryRepository.findById(tierList.getCategory().getCategoryId());
                if (!categoryData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                tierList.setCategory(categoryData.get());
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            // Validate challenge exists
            if (tierList.getChallenge() != null && tierList.getChallenge().getChallengeId() != null) {
                Optional<WeeklyChallenge> challengeData = challengeRepository.findById(tierList.getChallenge().getChallengeId());
                if (!challengeData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                tierList.setChallenge(challengeData.get());
            } else {
                // If no challenge provided, try to find active challenge
                Optional<WeeklyChallenge> activeChallenge = challengeRepository.findActiveChallenge(LocalDateTime.now().toLocalDate());
                if (activeChallenge.isPresent()) {
                    tierList.setChallenge(activeChallenge.get());
                } else {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
            }
            
            // Set creation time
            tierList.setCreatedAt(LocalDateTime.now());
            tierList.setLastModified(LocalDateTime.now());
            
            // Set default visibility if not provided
            if (tierList.getIsPublic() == null) {
                tierList.setIsPublic(true);
            }
            
            TierList savedTierList = tierListRepository.save(tierList);
            return new ResponseEntity<>(savedTierList, HttpStatus.CREATED);
        } catch (Exception e) {
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
            
            // Update visibility if provided
            if (tierList.getIsPublic() != null) {
                existingTierList.setIsPublic(tierList.getIsPublic());
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
    @GetMapping("/search")
    public ResponseEntity<List<TierList>> searchTierLists(@RequestParam("name") String name) {
        try {
            List<TierList> tierLists = tierListRepository.findByNameContainingIgnoreCase(name);
            return new ResponseEntity<>(tierLists, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Toggle tier list visibility
    @PutMapping("/{id}/visibility")
    public ResponseEntity<TierList> toggleTierListVisibility(@PathVariable("id") Long id) {
        Optional<TierList> tierListData = tierListRepository.findById(id);
        
        if (tierListData.isPresent()) {
            TierList existingTierList = tierListData.get();
            
            // Toggle visibility
            existingTierList.setIsPublic(!existingTierList.getIsPublic());
            
            // Update last modified time
            existingTierList.setLastModified(LocalDateTime.now());
            
            return new ResponseEntity<>(tierListRepository.save(existingTierList), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
} 