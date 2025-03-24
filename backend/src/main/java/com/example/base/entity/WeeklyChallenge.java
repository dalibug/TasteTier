package com.example.base.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "weekly_challenges")
public class WeeklyChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "challenge_id")
    private Long challengeId;

    @Column(name = "week_number", nullable = false)
    private Integer weekNumber;

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "challenge", cascade = CascadeType.ALL)
    private List<TierList> tierLists = new ArrayList<>();

    // Default constructor
    public WeeklyChallenge() {
    }

    // Constructor with required fields
    public WeeklyChallenge(Integer weekNumber, Integer year, LocalDate startDate, LocalDate endDate, String status) {
        this.weekNumber = weekNumber;
        this.year = year;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }

    // Getters and Setters
    public Long getChallengeId() {
        return challengeId;
    }

    public void setChallengeId(Long challengeId) {
        this.challengeId = challengeId;
    }

    public Integer getWeekNumber() {
        return weekNumber;
    }

    public void setWeekNumber(Integer weekNumber) {
        this.weekNumber = weekNumber;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<TierList> getTierLists() {
        return tierLists;
    }

    public void setTierLists(List<TierList> tierLists) {
        this.tierLists = tierLists;
    }

    // Helper methods for managing the bi-directional relationship
    public void addTierList(TierList tierList) {
        tierLists.add(tierList);
        tierList.setChallenge(this);
    }

    public void removeTierList(TierList tierList) {
        tierLists.remove(tierList);
        tierList.setChallenge(null);
    }
} 