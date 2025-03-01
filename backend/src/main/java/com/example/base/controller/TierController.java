package com.example.base.controller;

import com.example.base.entity.Tier;
import com.example.base.repository.TierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/tiers")
public class TierController {

    @Autowired
    private TierRepository tierRepository;

    // Get all tiers
    @GetMapping
    public ResponseEntity<List<Tier>> getAllTiers() {
        try {
            List<Tier> tiers = tierRepository.findAll();
            return new ResponseEntity<>(tiers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all tiers ordered by rank
    @GetMapping("/ordered")
    public ResponseEntity<List<Tier>> getAllTiersOrdered() {
        try {
            List<Tier> tiers = tierRepository.findAllByOrderByRankOrderAsc();
            return new ResponseEntity<>(tiers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tier by ID
    @GetMapping("/{id}")
    public ResponseEntity<Tier> getTierById(@PathVariable("id") Long id) {
        Optional<Tier> tierData = tierRepository.findById(id);
        
        if (tierData.isPresent()) {
            return new ResponseEntity<>(tierData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Get tier by name
    @GetMapping("/name/{name}")
    public ResponseEntity<Tier> getTierByName(@PathVariable("name") String name) {
        Optional<Tier> tierData = tierRepository.findByName(name);
        
        if (tierData.isPresent()) {
            return new ResponseEntity<>(tierData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Create a new tier
    @PostMapping
    public ResponseEntity<Tier> createTier(@RequestBody Tier tier) {
        try {
            Tier savedTier = tierRepository.save(tier);
            return new ResponseEntity<>(savedTier, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update a tier
    @PutMapping("/{id}")
    public ResponseEntity<Tier> updateTier(@PathVariable("id") Long id, @RequestBody Tier tier) {
        Optional<Tier> tierData = tierRepository.findById(id);
        
        if (tierData.isPresent()) {
            Tier existingTier = tierData.get();
            
            // Update fields
            if (tier.getName() != null) {
                existingTier.setName(tier.getName());
            }
            if (tier.getRankOrder() != null) {
                existingTier.setRankOrder(tier.getRankOrder());
            }
            
            return new ResponseEntity<>(tierRepository.save(existingTier), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a tier
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteTier(@PathVariable("id") Long id) {
        try {
            tierRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 