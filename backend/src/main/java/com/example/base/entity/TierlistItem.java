package com.example.base.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tierlist_items")
public class TierlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tierlist_id", nullable = false)
    private TierList tierList;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tier_id", nullable = false)
    private Tier tier;

    @Column(name = "position", nullable = false)
    private Integer position;

    // Default constructor
    public TierlistItem() {
    }

    // Constructor with required fields
    public TierlistItem(TierList tierList, Recipe recipe, Tier tier, Integer position) {
        this.tierList = tierList;
        this.recipe = recipe;
        this.tier = tier;
        this.position = position;
    }

    // Getters and Setters
    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public TierList getTierList() {
        return tierList;
    }

    public void setTierList(TierList tierList) {
        this.tierList = tierList;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    public Tier getTier() {
        return tier;
    }

    public void setTier(Tier tier) {
        this.tier = tier;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }
} 