package com.example.base.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Transfer Object for TierList with its recipe items
 */
public class TierListWithDetailsDTO {
    private Long id;
    private String name;
    private String categoryName;
    private LocalDateTime createdAt;
    private List<TierListItemDTO> items = new ArrayList<>();
    
    // Simple nested class for tier list items
    public static class TierListItemDTO {
        private Long id;
        private String recipeName;
        private String tier;
        private Integer position;
        
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
        }
        
        public String getRecipeName() {
            return recipeName;
        }
        
        public void setRecipeName(String recipeName) {
            this.recipeName = recipeName;
        }
        
        public String getTier() {
            return tier;
        }
        
        public void setTier(String tier) {
            this.tier = tier;
        }
        
        public Integer getPosition() {
            return position;
        }
        
        public void setPosition(Integer position) {
            this.position = position;
        }
        
        @Override
        public String toString() {
            return "TierListItemDTO{" +
                    "id=" + id +
                    ", recipeName='" + recipeName + '\'' +
                    ", tier='" + tier + '\'' +
                    ", position=" + position +
                    '}';
        }
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
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
    
    public List<TierListItemDTO> getItems() {
        return items;
    }
    
    public void setItems(List<TierListItemDTO> items) {
        this.items = items;
    }
    
    public void addItem(TierListItemDTO item) {
        this.items.add(item);
    }
    
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("TierListWithDetailsDTO{");
        sb.append("id=").append(id);
        sb.append(", name='").append(name).append('\'');
        sb.append(", categoryName='").append(categoryName).append('\'');
        sb.append(", createdAt=").append(createdAt);
        sb.append(", itemsCount=").append(items.size());
        sb.append('}');
        
        if (!items.isEmpty()) {
            sb.append("\nSample items (up to 3):\n");
            for (int i = 0; i < Math.min(items.size(), 3); i++) {
                sb.append("  ").append(i + 1).append(". ").append(items.get(i)).append("\n");
            }
            if (items.size() > 3) {
                sb.append("  ... and ").append(items.size() - 3).append(" more item(s)\n");
            }
        }
        
        return sb.toString();
    }
} 