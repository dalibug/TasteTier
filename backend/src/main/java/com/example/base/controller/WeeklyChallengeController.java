package com.example.base.controller;

import com.example.base.entity.WeeklyChallenge;
import com.example.base.entity.Category;
import com.example.base.repository.WeeklyChallengeRepository;
import com.example.base.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/challenges")
public class WeeklyChallengeController {

    @Autowired
    private WeeklyChallengeRepository challengeRepository;
    
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
    
    // Get active challenges
    @GetMapping("/active")
    public ResponseEntity<List<WeeklyChallenge>> getActiveChallenges() {
        try {
            List<WeeklyChallenge> challenges = challengeRepository.findByIsActiveTrue();
            return new ResponseEntity<>(challenges, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get most recent active challenge
    @GetMapping("/active/latest")
    public ResponseEntity<WeeklyChallenge> getLatestActiveChallenge() {
        try {
            Optional<WeeklyChallenge> challenge = challengeRepository.findMostRecentActiveChallenge();
            if (challenge.isPresent()) {
                return new ResponseEntity<>(challenge.get(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get challenges by category
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<WeeklyChallenge>> getChallengesByCategory(@PathVariable("categoryId") Long categoryId) {
        try {
            List<WeeklyChallenge> challenges = challengeRepository.findByCategoryCategoryId(categoryId);
            return new ResponseEntity<>(challenges, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Create a new challenge
    @PostMapping
    public ResponseEntity<WeeklyChallenge> createChallenge(@RequestBody WeeklyChallenge challenge) {
        try {
            // Validate category exists if provided
            if (challenge.getCategory() != null && challenge.getCategory().getCategoryId() != null) {
                Optional<Category> categoryData = categoryRepository.findById(challenge.getCategory().getCategoryId());
                if (!categoryData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                challenge.setCategory(categoryData.get());
            }
            
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
            
            // Update basic fields
            if (challenge.getTitle() != null) {
                existingChallenge.setTitle(challenge.getTitle());
            }
            if (challenge.getDescription() != null) {
                existingChallenge.setDescription(challenge.getDescription());
            }
            if (challenge.getStartDate() != null) {
                existingChallenge.setStartDate(challenge.getStartDate());
            }
            if (challenge.getEndDate() != null) {
                existingChallenge.setEndDate(challenge.getEndDate());
            }
            if (challenge.getIsActive() != null) {
                existingChallenge.setIsActive(challenge.getIsActive());
            }
            
            // Update category if provided
            if (challenge.getCategory() != null && challenge.getCategory().getCategoryId() != null) {
                Optional<Category> categoryData = categoryRepository.findById(challenge.getCategory().getCategoryId());
                if (categoryData.isPresent()) {
                    existingChallenge.setCategory(categoryData.get());
                }
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
} 