package com.example.base.controller;

import com.example.base.entity.ItemSynonym;
import com.example.base.entity.Recipe;
import com.example.base.repository.ItemSynonymRepository;
import com.example.base.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/item-synonyms")
public class ItemSynonymController {

    @Autowired
    private ItemSynonymRepository itemSynonymRepository;
    
    @Autowired
    private RecipeRepository recipeRepository;

    // Get all item synonyms
    @GetMapping
    public ResponseEntity<List<ItemSynonym>> getAllItemSynonyms() {
        try {
            List<ItemSynonym> synonyms = itemSynonymRepository.findAll();
            return new ResponseEntity<>(synonyms, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get item synonyms by recipe ID
    @GetMapping("/recipe/{recipeId}")
    public ResponseEntity<List<ItemSynonym>> getItemSynonymsByRecipeId(@PathVariable("recipeId") Long recipeId) {
        try {
            List<ItemSynonym> synonyms = itemSynonymRepository.findByItemRecipeId(recipeId);
            return new ResponseEntity<>(synonyms, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get item synonyms by keyword
    @GetMapping("/search")
    public ResponseEntity<List<ItemSynonym>> getItemSynonymsByKeyword(@RequestParam("keyword") String keyword) {
        try {
            List<ItemSynonym> synonyms = itemSynonymRepository.findBySynonymContainingIgnoreCase(keyword);
            return new ResponseEntity<>(synonyms, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get item synonym by ID
    @GetMapping("/{id}")
    public ResponseEntity<ItemSynonym> getItemSynonymById(@PathVariable("id") Long id) {
        Optional<ItemSynonym> synonymData = itemSynonymRepository.findById(id);
        
        if (synonymData.isPresent()) {
            return new ResponseEntity<>(synonymData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Create a new item synonym
    @PostMapping
    public ResponseEntity<ItemSynonym> createItemSynonym(@RequestBody ItemSynonym itemSynonym) {
        try {
            // Validate recipe exists
            if (itemSynonym.getItem() != null && itemSynonym.getItem().getRecipeId() != null) {
                Optional<Recipe> recipeData = recipeRepository.findById(itemSynonym.getItem().getRecipeId());
                if (!recipeData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                itemSynonym.setItem(recipeData.get());
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            ItemSynonym savedSynonym = itemSynonymRepository.save(itemSynonym);
            return new ResponseEntity<>(savedSynonym, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update an item synonym
    @PutMapping("/{id}")
    public ResponseEntity<ItemSynonym> updateItemSynonym(@PathVariable("id") Long id, @RequestBody ItemSynonym itemSynonym) {
        Optional<ItemSynonym> synonymData = itemSynonymRepository.findById(id);
        
        if (synonymData.isPresent()) {
            ItemSynonym existingSynonym = synonymData.get();
            
            // Update synonym
            if (itemSynonym.getSynonym() != null) {
                existingSynonym.setSynonym(itemSynonym.getSynonym());
            }
            
            // Update similarity score
            if (itemSynonym.getSimilarityScore() != null) {
                existingSynonym.setSimilarityScore(itemSynonym.getSimilarityScore());
            }
            
            // Update recipe if provided
            if (itemSynonym.getItem() != null && itemSynonym.getItem().getRecipeId() != null) {
                Optional<Recipe> recipeData = recipeRepository.findById(itemSynonym.getItem().getRecipeId());
                if (recipeData.isPresent()) {
                    existingSynonym.setItem(recipeData.get());
                }
            }
            
            return new ResponseEntity<>(itemSynonymRepository.save(existingSynonym), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete an item synonym
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteItemSynonym(@PathVariable("id") Long id) {
        try {
            itemSynonymRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete all synonyms for a recipe
    @DeleteMapping("/recipe/{recipeId}")
    public ResponseEntity<HttpStatus> deleteAllSynonymsForRecipe(@PathVariable("recipeId") Long recipeId) {
        try {
            itemSynonymRepository.deleteByItemRecipeId(recipeId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 