package com.example.base.controller;

import com.example.base.entity.Category;
import com.example.base.entity.WeeklyChallenge;
import com.example.base.entity.WeeklyChallengeCategory;
import com.example.base.repository.CategoryRepository;
import com.example.base.repository.WeeklyChallengeCategoryRepository;
import com.example.base.repository.WeeklyChallengeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/challenges")
public class WeeklyChallengeController {

    @Autowired
    private WeeklyChallengeRepository challengeRepository;
    
    @Autowired
    private WeeklyChallengeCategoryRepository challengeCategoryRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;

    // Get all challenges
    @GetMapping
    public ResponseEntity<List<WeeklyChallenge>> getAllChallenges() {
        try {
            List<WeeklyChallenge> challenges = challengeRepository.findAll();
            return new ResponseEntity<>(challenges, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get active challenge
    @GetMapping("/active")
    public ResponseEntity<WeeklyChallenge> getActiveChallenge() {
        try {
            Optional<WeeklyChallenge> activeChallenge = challengeRepository.findActiveChallenge(LocalDate.now());
            
            if (activeChallenge.isPresent()) {
                return new ResponseEntity<>(activeChallenge.get(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get challenge by ID
    @GetMapping("/{id}")
    public ResponseEntity<WeeklyChallenge> getChallengeById(@PathVariable("id") Long id) {
        Optional<WeeklyChallenge> challengeData = challengeRepository.findById(id);
        
        if (challengeData.isPresent()) {
            return new ResponseEntity<>(challengeData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Create a new challenge
    @PostMapping
    public ResponseEntity<WeeklyChallenge> createChallenge(@RequestBody WeeklyChallenge challenge) {
        try {
            WeeklyChallenge savedChallenge = challengeRepository.save(challenge);
            return new ResponseEntity<>(savedChallenge, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update a challenge
    @PutMapping("/{id}")
    public ResponseEntity<WeeklyChallenge> updateChallenge(@PathVariable("id") Long id, @RequestBody WeeklyChallenge challenge) {
        Optional<WeeklyChallenge> challengeData = challengeRepository.findById(id);
        
        if (challengeData.isPresent()) {
            WeeklyChallenge existingChallenge = challengeData.get();
            
            // Update fields
            if (challenge.getWeekNumber() != null) {
                existingChallenge.setWeekNumber(challenge.getWeekNumber());
            }
            if (challenge.getYear() != null) {
                existingChallenge.setYear(challenge.getYear());
            }
            if (challenge.getStartDate() != null) {
                existingChallenge.setStartDate(challenge.getStartDate());
            }
            if (challenge.getEndDate() != null) {
                existingChallenge.setEndDate(challenge.getEndDate());
            }
            if (challenge.getStatus() != null) {
                existingChallenge.setStatus(challenge.getStatus());
            }
            
            return new ResponseEntity<>(challengeRepository.save(existingChallenge), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a challenge
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteChallenge(@PathVariable("id") Long id) {
        try {
            challengeRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get categories for a challenge
    @GetMapping("/{id}/categories")
    public ResponseEntity<List<Category>> getChallengeCategories(@PathVariable("id") Long id) {
        try {
            List<WeeklyChallengeCategory> challengeCategories = challengeCategoryRepository.findByChallengeChallengeId(id);
            List<Category> categories = challengeCategories.stream()
                    .map(WeeklyChallengeCategory::getCategory)
                    .collect(Collectors.toList());
            
            return new ResponseEntity<>(categories, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Add category to challenge
    @PostMapping("/{challengeId}/categories/{categoryId}")
    public ResponseEntity<WeeklyChallengeCategory> addCategoryToChallenge(
            @PathVariable("challengeId") Long challengeId,
            @PathVariable("categoryId") Long categoryId) {
        try {
            Optional<WeeklyChallenge> challengeData = challengeRepository.findById(challengeId);
            Optional<Category> categoryData = categoryRepository.findById(categoryId);
            
            if (challengeData.isPresent() && categoryData.isPresent()) {
                WeeklyChallengeCategory challengeCategory = new WeeklyChallengeCategory(
                        challengeData.get(), categoryData.get());
                
                WeeklyChallengeCategory savedChallengeCategory = challengeCategoryRepository.save(challengeCategory);
                return new ResponseEntity<>(savedChallengeCategory, HttpStatus.CREATED);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Remove category from challenge
    @DeleteMapping("/{challengeId}/categories/{categoryId}")
    public ResponseEntity<HttpStatus> removeCategoryFromChallenge(
            @PathVariable("challengeId") Long challengeId,
            @PathVariable("categoryId") Long categoryId) {
        try {
            List<WeeklyChallengeCategory> challengeCategories = challengeCategoryRepository.findByChallengeChallengeId(challengeId);
            
            Optional<WeeklyChallengeCategory> toRemove = challengeCategories.stream()
                    .filter(cc -> cc.getCategory().getCategoryId().equals(categoryId))
                    .findFirst();
            
            if (toRemove.isPresent()) {
                challengeCategoryRepository.delete(toRemove.get());
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 