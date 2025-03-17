package com.example.base.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage implements Serializable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long messageId;
    
    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private ChatRoom room;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "sent_at")
    private LocalDateTime sentAt;
    
    // Constructors
    public ChatMessage() {
        this.sentAt = LocalDateTime.now();
    }
    
    public ChatMessage(ChatRoom room, User user, String message) {
        this.room = room;
        this.user = user;
        this.message = message;
        this.sentAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getMessageId() {
        return messageId;
    }
    
    public void setMessageId(Long messageId) {
        this.messageId = messageId;
    }
    
    public ChatRoom getRoom() {
        return room;
    }
    
    public void setRoom(ChatRoom room) {
        this.room = room;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public LocalDateTime getSentAt() {
        return sentAt;
    }
    
    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }
    
    @Override
    public String toString() {
        return "ChatMessage{" +
                "messageId=" + messageId +
                ", room=" + (room != null ? room.getRoomId() : null) +
                ", user=" + (user != null ? user.getUserId() : null) +
                ", message='" + message + '\'' +
                ", sentAt=" + sentAt +
                '}';
    }
} 