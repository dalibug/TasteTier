package com.example.base.dto;

import com.example.base.entity.Recipe;
import java.time.LocalDateTime;

public class RecipeDTO {
    private Long recipeId;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime createdAt;
    private String description;
    private String imageUrl;
    private String ingredients;
    private String instructions;
    private String title;
    
    public RecipeDTO() {
    }
    
    public RecipeDTO(Recipe recipe) {
        this.recipeId = recipe.getRecipeId();
        if (recipe.getCategory() != null) {
            this.categoryId = recipe.getCategory().getCategoryId();
            this.categoryName = recipe.getCategory().getName();
        }
        this.createdAt = recipe.getCreatedAt();
        this.description = recipe.getDescription();
        this.imageUrl = recipe.getImageUrl();
        this.ingredients = recipe.getIngredients();
        this.instructions = recipe.getInstructions();
        this.title = recipe.getTitle();
    }
    
    // Getters and Setters
    public Long getRecipeId() {
        return recipeId;
    }
    
    public void setRecipeId(Long recipeId) {
        this.recipeId = recipeId;
    }
    
    public Long getCategoryId() {
        return categoryId;
    }
    
    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
    
    public String getCategoryName() {
        return categoryName;
    }
    
    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public String getIngredients() {
        return ingredients;
    }
    
    public void setIngredients(String ingredients) {
        this.ingredients = ingredients;
    }
    
    public String getInstructions() {
        return instructions;
    }
    
    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    // Legacy getter/setter for name for compatibility
    public String getName() {
        return title;
    }
    
    public void setName(String name) {
        this.title = name;
    }
} 