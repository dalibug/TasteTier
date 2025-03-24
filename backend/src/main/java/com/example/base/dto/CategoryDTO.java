package com.example.base.dto;

import com.example.base.entity.Category;
import java.time.LocalDate;

public class CategoryDTO {
    private Long categoryId;
    private String name;
    private String description;
    private LocalDate activeFrom;
    private LocalDate activeUntil;
    private Boolean isActive;
    
    // Default constructor
    public CategoryDTO() {
    }
    
    // Constructor from Category entity
    public CategoryDTO(Category category) {
        this.categoryId = category.getCategoryId();
        this.name = category.getName();
        this.description = category.getDescription();
        this.activeFrom = category.getActiveFrom();
        this.activeUntil = category.getActiveUntil();
        this.isActive = category.getIsActive();
    }
    
    // Getters and Setters
    public Long getCategoryId() {
        return categoryId;
    }
    
    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public LocalDate getActiveFrom() {
        return activeFrom;
    }
    
    public void setActiveFrom(LocalDate activeFrom) {
        this.activeFrom = activeFrom;
    }
    
    public LocalDate getActiveUntil() {
        return activeUntil;
    }
    
    public void setActiveUntil(LocalDate activeUntil) {
        this.activeUntil = activeUntil;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
} 