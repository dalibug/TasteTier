package com.example.base.controller;

import com.example.base.entity.TierlistItem;
import com.example.base.entity.TierList;
import com.example.base.entity.Recipe;
import com.example.base.entity.Tier;
import com.example.base.repository.TierlistItemRepository;
import com.example.base.repository.TierListRepository;
import com.example.base.repository.RecipeRepository;
import com.example.base.repository.TierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/tierlist-items")
public class TierlistItemController {

    @Autowired
    private TierlistItemRepository tierlistItemRepository;
    
    @Autowired
    private TierListRepository tierListRepository;
    
    @Autowired
    private RecipeRepository recipeRepository;
    
    @Autowired
    private TierRepository tierRepository;

    // Get all tierlist items
    @GetMapping
    public ResponseEntity<List<TierlistItem>> getAllTierlistItems() {
        try {
            List<TierlistItem> items = tierlistItemRepository.findAll();
            return new ResponseEntity<>(items, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tierlist items by tierlist ID
    @GetMapping("/tierlist/{tierlistId}")
    public ResponseEntity<List<TierlistItem>> getTierlistItemsByTierlistId(@PathVariable("tierlistId") Long tierlistId) {
        try {
            List<TierlistItem> items = tierlistItemRepository.findByTierListTierlistId(tierlistId);
            return new ResponseEntity<>(items, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tierlist items by tierlist ID and tier ID
    @GetMapping("/tierlist/{tierlistId}/tier/{tierId}")
    public ResponseEntity<List<TierlistItem>> getTierlistItemsByTierlistIdAndTierId(
            @PathVariable("tierlistId") Long tierlistId,
            @PathVariable("tierId") Long tierId) {
        try {
            List<TierlistItem> items = tierlistItemRepository.findByTierListTierlistIdAndTierTierId(tierlistId, tierId);
            return new ResponseEntity<>(items, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get tierlist item by ID
    @GetMapping("/{id}")
    public ResponseEntity<TierlistItem> getTierlistItemById(@PathVariable("id") Long id) {
        Optional<TierlistItem> itemData = tierlistItemRepository.findById(id);
        
        if (itemData.isPresent()) {
            return new ResponseEntity<>(itemData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Create a new tierlist item
    @PostMapping
    public ResponseEntity<TierlistItem> createTierlistItem(@RequestBody TierlistItem tierlistItem) {
        try {
            // Validate tierlist exists
            if (tierlistItem.getTierList() != null && tierlistItem.getTierList().getTierlistId() != null) {
                Optional<TierList> tierListData = tierListRepository.findById(tierlistItem.getTierList().getTierlistId());
                if (!tierListData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                tierlistItem.setTierList(tierListData.get());
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            // Validate recipe exists
            if (tierlistItem.getRecipe() != null && tierlistItem.getRecipe().getRecipeId() != null) {
                Optional<Recipe> recipeData = recipeRepository.findById(tierlistItem.getRecipe().getRecipeId());
                if (!recipeData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                tierlistItem.setRecipe(recipeData.get());
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            // Validate tier exists
            if (tierlistItem.getTier() != null && tierlistItem.getTier().getTierId() != null) {
                Optional<Tier> tierData = tierRepository.findById(tierlistItem.getTier().getTierId());
                if (!tierData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                tierlistItem.setTier(tierData.get());
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            TierlistItem savedItem = tierlistItemRepository.save(tierlistItem);
            return new ResponseEntity<>(savedItem, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update a tierlist item
    @PutMapping("/{id}")
    public ResponseEntity<TierlistItem> updateTierlistItem(@PathVariable("id") Long id, @RequestBody TierlistItem tierlistItem) {
        Optional<TierlistItem> itemData = tierlistItemRepository.findById(id);
        
        if (itemData.isPresent()) {
            TierlistItem existingItem = itemData.get();
            
            // Update position
            if (tierlistItem.getPosition() != null) {
                existingItem.setPosition(tierlistItem.getPosition());
            }
            
            // Update tier if provided
            if (tierlistItem.getTier() != null && tierlistItem.getTier().getTierId() != null) {
                Optional<Tier> tierData = tierRepository.findById(tierlistItem.getTier().getTierId());
                if (tierData.isPresent()) {
                    existingItem.setTier(tierData.get());
                }
            }
            
            return new ResponseEntity<>(tierlistItemRepository.save(existingItem), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a tierlist item
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteTierlistItem(@PathVariable("id") Long id) {
        try {
            tierlistItemRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete all items in a tierlist
    @DeleteMapping("/tierlist/{tierlistId}")
    public ResponseEntity<HttpStatus> deleteAllItemsInTierlist(@PathVariable("tierlistId") Long tierlistId) {
        try {
            tierlistItemRepository.deleteByTierListTierlistId(tierlistId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Batch create tierlist items
    @PostMapping("/batch")
    public ResponseEntity<List<TierlistItem>> createTierlistItemsBatch(@RequestBody List<TierlistItem> items) {
        try {
            // Validate and process each item
            for (TierlistItem item : items) {
                // Validate tierlist exists
                if (item.getTierList() != null && item.getTierList().getTierlistId() != null) {
                    Optional<TierList> tierListData = tierListRepository.findById(item.getTierList().getTierlistId());
                    if (tierListData.isPresent()) {
                        item.setTierList(tierListData.get());
                    } else {
                        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                    }
                } else {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                
                // Validate recipe exists
                if (item.getRecipe() != null && item.getRecipe().getRecipeId() != null) {
                    Optional<Recipe> recipeData = recipeRepository.findById(item.getRecipe().getRecipeId());
                    if (recipeData.isPresent()) {
                        item.setRecipe(recipeData.get());
                    } else {
                        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                    }
                } else {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                
                // Validate tier exists
                if (item.getTier() != null && item.getTier().getTierId() != null) {
                    Optional<Tier> tierData = tierRepository.findById(item.getTier().getTierId());
                    if (tierData.isPresent()) {
                        item.setTier(tierData.get());
                    } else {
                        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                    }
                } else {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
            }
            
            List<TierlistItem> savedItems = tierlistItemRepository.saveAll(items);
            return new ResponseEntity<>(savedItems, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 