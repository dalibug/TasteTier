package com.example.base.service;

import com.example.base.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class RecipeService {
    private static final Logger logger = LoggerFactory.getLogger(RecipeService.class);

    @Autowired
    private RecipeRepository recipeRepository;
    
    /**
     * Deletes all recipes if force is true
     */
    public boolean clearRecipesIfRequested(boolean force) {
        if (force) {
            recipeRepository.deleteAll();
            return true;
        }
        return false;
    }
} 