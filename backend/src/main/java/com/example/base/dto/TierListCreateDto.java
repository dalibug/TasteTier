package com.example.base.dto;

import java.util.List;

public class TierListCreateDto {
    
    private String name;
    private Long userId;
    private Long categoryId;
    private Long challengeId;
    private Boolean isPublic;
    private List<RecipeItem> recipes;
    
    // Inner class for recipe items
    public static class RecipeItem {
        private Long recipeId;
        private Long tierId;
        private Integer position;
        
        // Getters and setters
        public Long getRecipeId() {
            return recipeId;
        }
        
        public void setRecipeId(Long recipeId) {
            this.recipeId = recipeId;
        }
        
        public Long getTierId() {
            return tierId;
        }
        
        public void setTierId(Long tierId) {
            this.tierId = tierId;
        }
        
        public Integer getPosition() {
            return position;
        }
        
        public void setPosition(Integer position) {
            this.position = position;
        }
    }
    
    // Getters and setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Long getCategoryId() {
        return categoryId;
    }
    
    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
    
    public Long getChallengeId() {
        return challengeId;
    }
    
    public void setChallengeId(Long challengeId) {
        this.challengeId = challengeId;
    }
    
    public Boolean getIsPublic() {
        return isPublic;
    }
    
    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }
    
    public List<RecipeItem> getRecipes() {
        return recipes;
    }
    
    public void setRecipes(List<RecipeItem> recipes) {
        this.recipes = recipes;
    }
} 