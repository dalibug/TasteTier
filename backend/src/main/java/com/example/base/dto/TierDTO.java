package com.example.base.dto;

import com.example.base.entity.Tier;

public class TierDTO {
    private Long tierId;
    private String name;
    private Integer rankOrder;
    
    // Default constructor
    public TierDTO() {
    }
    
    // Constructor from Tier entity
    public TierDTO(Tier tier) {
        this.tierId = tier.getTierId();
        this.name = tier.getName();
        this.rankOrder = tier.getRankOrder();
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
} 