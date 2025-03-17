package com.example.base.repository;

import com.example.base.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    
    Optional<ChatRoom> findByResultResultId(Long resultId);
    
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.expiresAt < ?1")
    List<ChatRoom> findExpiredRooms(LocalDateTime currentTime);
    
    @Query("SELECT cr FROM ChatRoom cr JOIN cr.result r JOIN r.challenge c WHERE c.weekNumber = ?1 AND c.year = ?2")
    List<ChatRoom> findByChallengeWeekNumberAndYear(Integer weekNumber, Integer year);
    
    @Query("SELECT cr FROM ChatRoom cr JOIN cr.result r JOIN r.groupMembers gm WHERE gm.user.userId = ?1")
    List<ChatRoom> findByUserUserId(Long userId);
} 