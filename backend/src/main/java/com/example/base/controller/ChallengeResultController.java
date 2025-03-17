package com.example.base.controller;

import com.example.base.entity.ChallengeResult;
import com.example.base.entity.WeeklyChallenge;
import com.example.base.repository.ChallengeResultRepository;
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
@RequestMapping("/api/challenge-results")
public class ChallengeResultController {

    @Autowired
    private ChallengeResultRepository challengeResultRepository;
    
    @Autowired
    private WeeklyChallengeRepository weeklyChallengeRepository;

    // Get all challenge results
    @GetMapping
    public ResponseEntity<List<ChallengeResult>> getAllChallengeResults() {
        try {
            List<ChallengeResult> results = challengeResultRepository.findAll();
            return new ResponseEntity<>(results, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get challenge results by challenge ID
    @GetMapping("/challenge/{challengeId}")
    public ResponseEntity<List<ChallengeResult>> getChallengeResultsByChallengeId(@PathVariable("challengeId") Long challengeId) {
        try {
            List<ChallengeResult> results = challengeResultRepository.findByChallengeChallengeId(challengeId);
            return new ResponseEntity<>(results, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get challenge results by week number and year
    @GetMapping("/week/{weekNumber}/year/{year}")
    public ResponseEntity<List<ChallengeResult>> getChallengeResultsByWeekAndYear(
            @PathVariable("weekNumber") Integer weekNumber,
            @PathVariable("year") Integer year) {
        try {
            List<ChallengeResult> results = challengeResultRepository.findByChallengeWeekNumberAndChallengeYear(weekNumber, year);
            return new ResponseEntity<>(results, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get most similar challenge results
    @GetMapping("/most-similar")
    public ResponseEntity<List<ChallengeResult>> getMostSimilarChallengeResults() {
        try {
            List<ChallengeResult> results = challengeResultRepository.findByIsMostSimilarTrue();
            return new ResponseEntity<>(results, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get most unique challenge results
    @GetMapping("/most-unique")
    public ResponseEntity<List<ChallengeResult>> getMostUniqueChallengeResults() {
        try {
            List<ChallengeResult> results = challengeResultRepository.findByIsMostUniqueTrue();
            return new ResponseEntity<>(results, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get challenge result by ID
    @GetMapping("/{id}")
    public ResponseEntity<ChallengeResult> getChallengeResultById(@PathVariable("id") Long id) {
        Optional<ChallengeResult> resultData = challengeResultRepository.findById(id);
        
        if (resultData.isPresent()) {
            return new ResponseEntity<>(resultData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Create a new challenge result
    @PostMapping
    public ResponseEntity<ChallengeResult> createChallengeResult(@RequestBody ChallengeResult challengeResult) {
        try {
            // Validate challenge exists
            if (challengeResult.getChallenge() != null && challengeResult.getChallenge().getChallengeId() != null) {
                Optional<WeeklyChallenge> challengeData = weeklyChallengeRepository.findById(challengeResult.getChallenge().getChallengeId());
                if (!challengeData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                challengeResult.setChallenge(challengeData.get());
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            // Set created at if not provided
            if (challengeResult.getCreatedAt() == null) {
                challengeResult.setCreatedAt(LocalDateTime.now());
            }
            
            ChallengeResult savedResult = challengeResultRepository.save(challengeResult);
            return new ResponseEntity<>(savedResult, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update a challenge result
    @PutMapping("/{id}")
    public ResponseEntity<ChallengeResult> updateChallengeResult(@PathVariable("id") Long id, @RequestBody ChallengeResult challengeResult) {
        Optional<ChallengeResult> resultData = challengeResultRepository.findById(id);
        
        if (resultData.isPresent()) {
            ChallengeResult existingResult = resultData.get();
            
            // Update similarity score
            if (challengeResult.getSimilarityScore() != null) {
                existingResult.setSimilarityScore(challengeResult.getSimilarityScore());
            }
            
            // Update most similar flag
            if (challengeResult.getIsMostSimilar() != null) {
                existingResult.setIsMostSimilar(challengeResult.getIsMostSimilar());
            }
            
            // Update most unique flag
            if (challengeResult.getIsMostUnique() != null) {
                existingResult.setIsMostUnique(challengeResult.getIsMostUnique());
            }
            
            // Update challenge if provided
            if (challengeResult.getChallenge() != null && challengeResult.getChallenge().getChallengeId() != null) {
                Optional<WeeklyChallenge> challengeData = weeklyChallengeRepository.findById(challengeResult.getChallenge().getChallengeId());
                if (challengeData.isPresent()) {
                    existingResult.setChallenge(challengeData.get());
                }
            }
            
            return new ResponseEntity<>(challengeResultRepository.save(existingResult), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a challenge result
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteChallengeResult(@PathVariable("id") Long id) {
        try {
            challengeResultRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 