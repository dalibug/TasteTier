package com.example.base.repository;

import com.example.base.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    List<ChatMessage> findByRoomRoomId(Long roomId);
    
    List<ChatMessage> findByUserUserId(Long userId);
    
    List<ChatMessage> findByRoomRoomIdOrderBySentAtAsc(Long roomId);
    
    void deleteByRoomRoomId(Long roomId);
} 