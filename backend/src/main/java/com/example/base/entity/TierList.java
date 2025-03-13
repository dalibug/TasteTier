package com.example.base.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tier_lists")
public class TierList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tierlist_id")
    private Long tierlistId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "last_modified")
    private LocalDateTime lastModified;

    @OneToMany(mappedBy = "tierList", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TierlistItem> tierlistItems = new ArrayList<>();

    // Default constructor
    public TierList() {
    }

    // Constructor with required fields
    public TierList(User user, Category category, String name) {
        this.user = user;
        this.category = category;
        this.name = name;
        this.createdAt = LocalDateTime.now();
        this.lastModified = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getTierlistId() {
        return tierlistId;
    }

    public void setTierlistId(Long tierlistId) {
        this.tierlistId = tierlistId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
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

    public List<TierlistItem> getTierlistItems() {
        return tierlistItems;
    }

    public void setTierlistItems(List<TierlistItem> tierlistItems) {
        this.tierlistItems = tierlistItems;
    }

    // Helper methods
    public void addTierlistItem(TierlistItem item) {
        tierlistItems.add(item);
        item.setTierList(this);
    }

    public void removeTierlistItem(TierlistItem item) {
        tierlistItems.remove(item);
        item.setTierList(null);
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastModified = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastModified = LocalDateTime.now();
    }
} 