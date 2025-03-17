package com.example.base.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "challenge_results")
public class ChallengeResult implements Serializable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Long resultId;
    
    @ManyToOne
    @JoinColumn(name = "challenge_id", nullable = false)
    private WeeklyChallenge challenge;
    
    @Column(name = "group_id", nullable = false)
    private Integer groupId;
    
    @Column(name = "similarity_score", nullable = false)
    private Float similarityScore;
    
    @Column(name = "is_most_similar")
    private Boolean isMostSimilar = false;
    
    @Column(name = "is_most_unique")
    private Boolean isMostUnique = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "result", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChallengeGroupMember> groupMembers = new ArrayList<>();
    
    @OneToOne(mappedBy = "result", cascade = CascadeType.ALL, orphanRemoval = true)
    private ChatRoom chatRoom;
    
    // Constructors
    public ChallengeResult() {
        this.createdAt = LocalDateTime.now();
    }
    
    public ChallengeResult(WeeklyChallenge challenge, Integer groupId, Float similarityScore) {
        this.challenge = challenge;
        this.groupId = groupId;
        this.similarityScore = similarityScore;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getResultId() {
        return resultId;
    }
    
    public void setResultId(Long resultId) {
        this.resultId = resultId;
    }
    
    public WeeklyChallenge getChallenge() {
        return challenge;
    }
    
    public void setChallenge(WeeklyChallenge challenge) {
        this.challenge = challenge;
    }
    
    public Integer getGroupId() {
        return groupId;
    }
    
    public void setGroupId(Integer groupId) {
        this.groupId = groupId;
    }
    
    public Float getSimilarityScore() {
        return similarityScore;
    }
    
    public void setSimilarityScore(Float similarityScore) {
        this.similarityScore = similarityScore;
    }
    
    public Boolean getIsMostSimilar() {
        return isMostSimilar;
    }
    
    public void setIsMostSimilar(Boolean isMostSimilar) {
        this.isMostSimilar = isMostSimilar;
    }
    
    public Boolean getIsMostUnique() {
        return isMostUnique;
    }
    
    public void setIsMostUnique(Boolean isMostUnique) {
        this.isMostUnique = isMostUnique;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public List<ChallengeGroupMember> getGroupMembers() {
        return groupMembers;
    }
    
    public void setGroupMembers(List<ChallengeGroupMember> groupMembers) {
        this.groupMembers = groupMembers;
    }
    
    public ChatRoom getChatRoom() {
        return chatRoom;
    }
    
    public void setChatRoom(ChatRoom chatRoom) {
        this.chatRoom = chatRoom;
    }
    
    // Helper methods
    public void addGroupMember(ChallengeGroupMember member) {
        groupMembers.add(member);
        member.setResult(this);
    }
    
    public void removeGroupMember(ChallengeGroupMember member) {
        groupMembers.remove(member);
        member.setResult(null);
    }
    
    @Override
    public String toString() {
        return "ChallengeResult{" +
                "resultId=" + resultId +
                ", challenge=" + (challenge != null ? challenge.getChallengeId() : null) +
                ", groupId=" + groupId +
                ", similarityScore=" + similarityScore +
                ", isMostSimilar=" + isMostSimilar +
                ", isMostUnique=" + isMostUnique +
                ", createdAt=" + createdAt +
                '}';
    }
} 