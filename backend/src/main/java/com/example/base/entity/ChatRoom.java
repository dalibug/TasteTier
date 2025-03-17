package com.example.base.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chat_rooms")
public class ChatRoom implements Serializable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long roomId;
    
    @OneToOne
    @JoinColumn(name = "result_id", nullable = false)
    private ChallengeResult result;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessage> messages = new ArrayList<>();
    
    // Constructors
    public ChatRoom() {
        this.createdAt = LocalDateTime.now();
        // Default expiration is 7 days from creation
        this.expiresAt = this.createdAt.plusDays(7);
    }
    
    public ChatRoom(ChallengeResult result) {
        this.result = result;
        this.createdAt = LocalDateTime.now();
        // Default expiration is 7 days from creation
        this.expiresAt = this.createdAt.plusDays(7);
    }
    
    public ChatRoom(ChallengeResult result, LocalDateTime expiresAt) {
        this.result = result;
        this.createdAt = LocalDateTime.now();
        this.expiresAt = expiresAt;
    }
    
    // Getters and Setters
    public Long getRoomId() {
        return roomId;
    }
    
    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }
    
    public ChallengeResult getResult() {
        return result;
    }
    
    public void setResult(ChallengeResult result) {
        this.result = result;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public List<ChatMessage> getMessages() {
        return messages;
    }
    
    public void setMessages(List<ChatMessage> messages) {
        this.messages = messages;
    }
    
    // Helper methods
    public void addMessage(ChatMessage message) {
        messages.add(message);
        message.setRoom(this);
    }
    
    public void removeMessage(ChatMessage message) {
        messages.remove(message);
        message.setRoom(null);
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
    
    @Override
    public String toString() {
        return "ChatRoom{" +
                "roomId=" + roomId +
                ", result=" + (result != null ? result.getResultId() : null) +
                ", createdAt=" + createdAt +
                ", expiresAt=" + expiresAt +
                '}';
    }
} 