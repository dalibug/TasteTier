package com.example.base.controller;

import com.example.base.entity.TierList;
import com.example.base.entity.User;
import com.example.base.entity.Category;
import com.example.base.repository.TierListRepository;
import com.example.base.repository.UserRepository;
import com.example.base.repository.CategoryRepository;
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
            
            // Set creation time
            tierList.setCreatedAt(LocalDateTime.now());
            tierList.setLastModified(LocalDateTime.now());
            
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
} 