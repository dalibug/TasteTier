package com.example.base.controller;

import com.example.base.dto.TierDTO;
import com.example.base.entity.Tier;
import com.example.base.repository.TierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000", "http://localhost"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/tiers")
public class TierController {

    @Autowired
    private TierRepository tierRepository;

    // Get all tiers
    @SuppressWarnings("null")
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<TierDTO>> getAllTiers() {
        try {
            List<Tier> tiers = tierRepository.findAll();
            List<TierDTO> tierDTOs = tiers.stream()
                .map(TierDTO::new)
                .collect(Collectors.toList());
            return new ResponseEntity<>(tierDTOs, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all tiers ordered by rank
    @SuppressWarnings("null")
    @GetMapping("/ordered")
    @Transactional(readOnly = true)
    public ResponseEntity<List<TierDTO>> getAllTiersOrdered() {
        try {
            List<Tier> tiers = tierRepository.findAllByOrderByRankOrderAsc();
            List<TierDTO> tierDTOs = tiers.stream()
                .map(TierDTO::new)
                .collect(Collectors.toList());
            return new ResponseEntity<>(tierDTOs, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tier by ID
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<TierDTO> getTierById(@PathVariable("id") Long id) {
        Optional<Tier> tierData = tierRepository.findById(id);
        
        if (tierData.isPresent()) {
            return new ResponseEntity<>(new TierDTO(tierData.get()), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Get tier by name
    @GetMapping("/name/{name}")
    @Transactional(readOnly = true)
    public ResponseEntity<TierDTO> getTierByName(@PathVariable("name") String name) {
        Optional<Tier> tierData = tierRepository.findByName(name);
        
        if (tierData.isPresent()) {
            return new ResponseEntity<>(new TierDTO(tierData.get()), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Create a new tier
    @SuppressWarnings("null")
    @PostMapping
    @Transactional
    public ResponseEntity<TierDTO> createTier(@RequestBody Tier tier) {
        try {
            Tier savedTier = tierRepository.save(tier);
            return new ResponseEntity<>(new TierDTO(savedTier), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update a tier
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<TierDTO> updateTier(@PathVariable("id") Long id, @RequestBody Tier tier) {
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
            
            return new ResponseEntity<>(new TierDTO(tierRepository.save(existingTier)), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a tier
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<HttpStatus> deleteTier(@PathVariable("id") Long id) {
        try {
            tierRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 