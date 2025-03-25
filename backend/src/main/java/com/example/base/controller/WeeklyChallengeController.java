package com.example.base.controller;

import com.example.base.entity.WeeklyChallenge;
import com.example.base.repository.WeeklyChallengeRepository;
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

    // Get all challenges
    @SuppressWarnings("null")
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
    @SuppressWarnings("null")
    @GetMapping("/active")
    public ResponseEntity<List<WeeklyChallenge>> getActiveChallenges() {
        try {
            List<WeeklyChallenge> challenges = challengeRepository.findByStatusEquals("active");
            return new ResponseEntity<>(challenges, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get most recent active challenge
    @SuppressWarnings("null")
    @GetMapping("/active/latest")
    public ResponseEntity<WeeklyChallenge> getLatestActiveChallenge() {
        try {
            Optional<WeeklyChallenge> challenge = challengeRepository.findFirstByStatusEqualsOrderByStartDateDesc("active");
            if (challenge.isPresent()) {
                return new ResponseEntity<>(challenge.get(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Create a new challenge
    @SuppressWarnings("null")
    @PostMapping
    public ResponseEntity<WeeklyChallenge> createChallenge(@RequestBody WeeklyChallenge challenge) {
        try {
            challenge.setCreatedAt(LocalDateTime.now());
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
} 