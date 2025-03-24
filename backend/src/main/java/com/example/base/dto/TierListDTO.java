package com.example.base.dto;

import com.example.base.entity.TierList;
import java.time.LocalDateTime;

public class TierListDTO {
    private Long tierlistId;
    private Long userId;
    private String userName;
    private Long categoryId;
    private String categoryName;
    private Long challengeId;
    private String challengeTitle;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime lastModified;
    private Boolean isPublic;
    
    // Default constructor
    public TierListDTO() {
    }
    
    // Constructor from TierList entity
    public TierListDTO(TierList tierList) {
        this.tierlistId = tierList.getTierlistId();
        this.name = tierList.getName();
        this.createdAt = tierList.getCreatedAt();
        this.lastModified = tierList.getLastModified();
        this.isPublic = tierList.getIsPublic();
        
        if (tierList.getUser() != null) {
            this.userId = tierList.getUser().getUserId();
            this.userName = tierList.getUser().getUsername();
        }
        
        if (tierList.getCategory() != null) {
            this.categoryId = tierList.getCategory().getCategoryId();
            this.categoryName = tierList.getCategory().getName();
        }
        
        if (tierList.getChallenge() != null) {
            this.challengeId = tierList.getChallenge().getChallengeId();
            this.challengeTitle = tierList.getChallenge().getTitle();
        }
    }
    
    // Getters and Setters
    public Long getTierlistId() {
        return tierlistId;
    }
    
    public void setTierlistId(Long tierlistId) {
        this.tierlistId = tierlistId;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
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
    
    public Long getChallengeId() {
        return challengeId;
    }
    
    public void setChallengeId(Long challengeId) {
        this.challengeId = challengeId;
    }
    
    public String getChallengeTitle() {
        return challengeTitle;
    }
    
    public void setChallengeTitle(String challengeTitle) {
        this.challengeTitle = challengeTitle;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getLastModified() {
        return lastModified;
    }
    
    public void setLastModified(LocalDateTime lastModified) {
        this.lastModified = lastModified;
    }
    
    public Boolean getIsPublic() {
        return isPublic;
    }
    
    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }
} 