package com.example.base.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

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
    @JoinColumn(name = "original_item_id", nullable = false)
    private Recipe originalItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tier_id", nullable = false)
    private Tier tier;

    @Column(name = "position", nullable = false)
    private Integer position;
    
    @Column(name = "added_at")
    private LocalDateTime addedAt;

    // Default constructor
    public TierlistItem() {
    }

    // Constructor with required fields
    public TierlistItem(TierList tierList, Recipe originalItem, Tier tier, Integer position) {
        this.tierList = tierList;
        this.originalItem = originalItem;
        this.tier = tier;
        this.position = position;
        this.addedAt = LocalDateTime.now();
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

    public Recipe getOriginalItem() {
        return originalItem;
    }

    public void setOriginalItem(Recipe originalItem) {
        this.originalItem = originalItem;
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
    
    public LocalDateTime getAddedAt() {
        return addedAt;
    }
    
    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
    
    @PrePersist
    protected void onCreate() {
        if (addedAt == null) {
            addedAt = LocalDateTime.now();
        }
    }
} 