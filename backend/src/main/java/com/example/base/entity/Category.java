package com.example.base.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "active_from", nullable = false)
    private LocalDate activeFrom = LocalDate.of(2020, 1, 1); // Default to a safe date

    @Column(name = "active_until", nullable = false)
    private LocalDate activeUntil = LocalDate.of(2030, 12, 31); // Default to a safe future date

    @Column(name = "is_active")
    private Boolean isActive = true;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Recipe> recipes = new ArrayList<>();

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TierList> tierLists = new ArrayList<>();

    // Default constructor
    public Category() {
    }

    // Constructor with required fields
    public Category(String name, LocalDate activeFrom, LocalDate activeUntil) {
        this.name = name;
        this.activeFrom = activeFrom != null ? activeFrom : LocalDate.of(2020, 1, 1);
        this.activeUntil = activeUntil != null ? activeUntil : LocalDate.of(2030, 12, 31);
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
        this.activeFrom = activeFrom != null ? activeFrom : LocalDate.of(2020, 1, 1);
    }

    public LocalDate getActiveUntil() {
        return activeUntil;
    }

    public void setActiveUntil(LocalDate activeUntil) {
        this.activeUntil = activeUntil != null ? activeUntil : LocalDate.of(2030, 12, 31);
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public List<Recipe> getRecipes() {
        return recipes;
    }

    public void setRecipes(List<Recipe> recipes) {
        this.recipes = recipes;
    }

    public List<TierList> getTierLists() {
        return tierLists;
    }

    public void setTierLists(List<TierList> tierLists) {
        this.tierLists = tierLists;
    }

    // Helper methods
    public void addRecipe(Recipe recipe) {
        recipes.add(recipe);
        recipe.setCategory(this);
    }

    public void removeRecipe(Recipe recipe) {
        recipes.remove(recipe);
        recipe.setCategory(null);
    }

    public void addTierList(TierList tierList) {
        tierLists.add(tierList);
        tierList.setCategory(this);
    }

    public void removeTierList(TierList tierList) {
        tierLists.remove(tierList);
        tierList.setCategory(null);
    }
} 