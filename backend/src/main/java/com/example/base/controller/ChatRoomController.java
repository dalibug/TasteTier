package com.example.base.controller;

import com.example.base.entity.ChatRoom;
import com.example.base.entity.ChallengeResult;
import com.example.base.repository.ChatRoomRepository;
import com.example.base.repository.ChallengeResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/chat-rooms")
public class ChatRoomController {

    @Autowired
    private ChatRoomRepository chatRoomRepository;
    
    @Autowired
    private ChallengeResultRepository challengeResultRepository;

    // Get all chat rooms
    @GetMapping
    public ResponseEntity<List<ChatRoom>> getAllChatRooms() {
        try {
            List<ChatRoom> rooms = chatRoomRepository.findAll();
            return new ResponseEntity<>(rooms, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get chat room by ID
    @GetMapping("/{id}")
    public ResponseEntity<ChatRoom> getChatRoomById(@PathVariable("id") Long id) {
        Optional<ChatRoom> roomData = chatRoomRepository.findById(id);
        
        if (roomData.isPresent()) {
            return new ResponseEntity<>(roomData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Get chat room by challenge result ID
    @GetMapping("/result/{resultId}")
    public ResponseEntity<ChatRoom> getChatRoomByResultId(@PathVariable("resultId") Long resultId) {
        Optional<ChatRoom> roomData = chatRoomRepository.findByResultResultId(resultId);
        
        if (roomData.isPresent()) {
            return new ResponseEntity<>(roomData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Get chat rooms by week number and year
    @GetMapping("/week/{weekNumber}/year/{year}")
    public ResponseEntity<List<ChatRoom>> getChatRoomsByWeekAndYear(
            @PathVariable("weekNumber") Integer weekNumber,
            @PathVariable("year") Integer year) {
        try {
            List<ChatRoom> rooms = chatRoomRepository.findByChallengeWeekNumberAndYear(weekNumber, year);
            return new ResponseEntity<>(rooms, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get chat rooms for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ChatRoom>> getChatRoomsByUserId(@PathVariable("userId") Long userId) {
        try {
            List<ChatRoom> rooms = chatRoomRepository.findByUserUserId(userId);
            return new ResponseEntity<>(rooms, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get expired chat rooms
    @GetMapping("/expired")
    public ResponseEntity<List<ChatRoom>> getExpiredChatRooms() {
        try {
            List<ChatRoom> rooms = chatRoomRepository.findExpiredRooms(LocalDateTime.now());
            return new ResponseEntity<>(rooms, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Create a new chat room
    @PostMapping
    public ResponseEntity<ChatRoom> createChatRoom(@RequestBody ChatRoom chatRoom) {
        try {
            // Validate challenge result exists
            if (chatRoom.getResult() != null && chatRoom.getResult().getResultId() != null) {
                Optional<ChallengeResult> resultData = challengeResultRepository.findById(chatRoom.getResult().getResultId());
                if (!resultData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                chatRoom.setResult(resultData.get());
                
                // Check if a chat room already exists for this result
                Optional<ChatRoom> existingRoom = chatRoomRepository.findByResultResultId(chatRoom.getResult().getResultId());
                if (existingRoom.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.CONFLICT);
                }
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            // Set created at if not provided
            if (chatRoom.getCreatedAt() == null) {
                chatRoom.setCreatedAt(LocalDateTime.now());
            }
            
            // Set expires at if not provided (default 7 days from now)
            if (chatRoom.getExpiresAt() == null) {
                chatRoom.setExpiresAt(LocalDateTime.now().plusDays(7));
            }
            
            ChatRoom savedRoom = chatRoomRepository.save(chatRoom);
            return new ResponseEntity<>(savedRoom, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update a chat room
    @PutMapping("/{id}")
    public ResponseEntity<ChatRoom> updateChatRoom(@PathVariable("id") Long id, @RequestBody ChatRoom chatRoom) {
        Optional<ChatRoom> roomData = chatRoomRepository.findById(id);
        
        if (roomData.isPresent()) {
            ChatRoom existingRoom = roomData.get();
            
            // Update expires at
            if (chatRoom.getExpiresAt() != null) {
                existingRoom.setExpiresAt(chatRoom.getExpiresAt());
            }
            
            return new ResponseEntity<>(chatRoomRepository.save(existingRoom), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Extend chat room expiration
    @PutMapping("/{id}/extend")
    public ResponseEntity<ChatRoom> extendChatRoomExpiration(@PathVariable("id") Long id, @RequestParam("days") Integer days) {
        Optional<ChatRoom> roomData = chatRoomRepository.findById(id);
        
        if (roomData.isPresent()) {
            ChatRoom existingRoom = roomData.get();
            
            // Extend expiration by specified days
            existingRoom.setExpiresAt(existingRoom.getExpiresAt().plusDays(days));
            
            return new ResponseEntity<>(chatRoomRepository.save(existingRoom), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a chat room
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteChatRoom(@PathVariable("id") Long id) {
        try {
            chatRoomRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 