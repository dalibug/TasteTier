package com.example.base.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tiers")
public class Tier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tier_id")
    private Long tierId;

    @Column(name = "name", length = 10, nullable = false)
    private String name;

    @Column(name = "rank_order", nullable = false)
    private Integer rankOrder;

    @OneToMany(mappedBy = "tier")
    private List<TierlistItem> tierlistItems = new ArrayList<>();

    // Default constructor
    public Tier() {
    }

    // Constructor with required fields
    public Tier(String name, Integer rankOrder) {
        this.name = name;
        this.rankOrder = rankOrder;
    }

    // Getters and Setters
    public Long getTierId() {
        return tierId;
    }

    public void setTierId(Long tierId) {
        this.tierId = tierId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getRankOrder() {
        return rankOrder;
    }

    public void setRankOrder(Integer rankOrder) {
        this.rankOrder = rankOrder;
    }

    public List<TierlistItem> getTierlistItems() {
        return tierlistItems;
    }

    public void setTierlistItems(List<TierlistItem> tierlistItems) {
        this.tierlistItems = tierlistItems;
    }
} 