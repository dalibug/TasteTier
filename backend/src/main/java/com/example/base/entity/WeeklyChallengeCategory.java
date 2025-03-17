package com.example.base.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "weekly_challenge_categories")
public class WeeklyChallengeCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "weekly_category_id")
    private Long weeklyCategoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    private WeeklyChallenge challenge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    // Default constructor
    public WeeklyChallengeCategory() {
    }

    // Constructor with required fields
    public WeeklyChallengeCategory(WeeklyChallenge challenge, Category category) {
        this.challenge = challenge;
        this.category = category;
    }

    // Getters and Setters
    public Long getWeeklyCategoryId() {
        return weeklyCategoryId;
    }

    public void setWeeklyCategoryId(Long weeklyCategoryId) {
        this.weeklyCategoryId = weeklyCategoryId;
    }

    public WeeklyChallenge getChallenge() {
        return challenge;
    }

    public void setChallenge(WeeklyChallenge challenge) {
        this.challenge = challenge;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
} 