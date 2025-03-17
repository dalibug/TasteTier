package com.example.base.entity;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "challenge_group_members")
public class ChallengeGroupMember implements Serializable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_member_id")
    private Long groupMemberId;
    
    @ManyToOne
    @JoinColumn(name = "result_id", nullable = false)
    private ChallengeResult result;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "tierlist_id", nullable = false)
    private TierList tierList;
    
    // Constructors
    public ChallengeGroupMember() {
    }
    
    public ChallengeGroupMember(ChallengeResult result, User user, TierList tierList) {
        this.result = result;
        this.user = user;
        this.tierList = tierList;
    }
    
    // Getters and Setters
    public Long getGroupMemberId() {
        return groupMemberId;
    }
    
    public void setGroupMemberId(Long groupMemberId) {
        this.groupMemberId = groupMemberId;
    }
    
    public ChallengeResult getResult() {
        return result;
    }
    
    public void setResult(ChallengeResult result) {
        this.result = result;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public TierList getTierList() {
        return tierList;
    }
    
    public void setTierList(TierList tierList) {
        this.tierList = tierList;
    }
    
    @Override
    public String toString() {
        return "ChallengeGroupMember{" +
                "groupMemberId=" + groupMemberId +
                ", result=" + (result != null ? result.getResultId() : null) +
                ", user=" + (user != null ? user.getUserId() : null) +
                ", tierList=" + (tierList != null ? tierList.getTierlistId() : null) +
                '}';
    }
} 