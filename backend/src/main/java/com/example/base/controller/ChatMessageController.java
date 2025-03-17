package com.example.base.controller;

import com.example.base.entity.ChatMessage;
import com.example.base.entity.ChatRoom;
import com.example.base.entity.User;
import com.example.base.repository.ChatMessageRepository;
import com.example.base.repository.ChatRoomRepository;
import com.example.base.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/chat-messages")
public class ChatMessageController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private ChatRoomRepository chatRoomRepository;
    
    @Autowired
    private UserRepository userRepository;

    // Get all chat messages
    @GetMapping
    public ResponseEntity<List<ChatMessage>> getAllChatMessages() {
        try {
            List<ChatMessage> messages = chatMessageRepository.findAll();
            return new ResponseEntity<>(messages, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get chat message by ID
    @GetMapping("/{id}")
    public ResponseEntity<ChatMessage> getChatMessageById(@PathVariable("id") Long id) {
        Optional<ChatMessage> messageData = chatMessageRepository.findById(id);
        
        if (messageData.isPresent()) {
            return new ResponseEntity<>(messageData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Get chat messages by room ID
    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<ChatMessage>> getChatMessagesByRoomId(@PathVariable("roomId") Long roomId) {
        try {
            List<ChatMessage> messages = chatMessageRepository.findByRoomRoomIdOrderBySentAtAsc(roomId);
            return new ResponseEntity<>(messages, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get chat messages by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ChatMessage>> getChatMessagesByUserId(@PathVariable("userId") Long userId) {
        try {
            List<ChatMessage> messages = chatMessageRepository.findByUserUserId(userId);
            return new ResponseEntity<>(messages, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Create a new chat message
    @PostMapping
    public ResponseEntity<ChatMessage> createChatMessage(@RequestBody ChatMessage chatMessage) {
        try {
            // Validate chat room exists
            if (chatMessage.getRoom() != null && chatMessage.getRoom().getRoomId() != null) {
                Optional<ChatRoom> roomData = chatRoomRepository.findById(chatMessage.getRoom().getRoomId());
                if (!roomData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                
                ChatRoom room = roomData.get();
                chatMessage.setRoom(room);
                
                // Check if room is expired
                if (room.isExpired()) {
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                }
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            // Validate user exists
            if (chatMessage.getUser() != null && chatMessage.getUser().getUserId() != null) {
                Optional<User> userData = userRepository.findById(chatMessage.getUser().getUserId());
                if (!userData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                chatMessage.setUser(userData.get());
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            // Set sent at if not provided
            if (chatMessage.getSentAt() == null) {
                chatMessage.setSentAt(LocalDateTime.now());
            }
            
            ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
            return new ResponseEntity<>(savedMessage, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update a chat message
    @PutMapping("/{id}")
    public ResponseEntity<ChatMessage> updateChatMessage(@PathVariable("id") Long id, @RequestBody ChatMessage chatMessage) {
        Optional<ChatMessage> messageData = chatMessageRepository.findById(id);
        
        if (messageData.isPresent()) {
            ChatMessage existingMessage = messageData.get();
            
            // Update message content
            if (chatMessage.getMessage() != null) {
                existingMessage.setMessage(chatMessage.getMessage());
            }
            
            return new ResponseEntity<>(chatMessageRepository.save(existingMessage), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a chat message
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteChatMessage(@PathVariable("id") Long id) {
        try {
            chatMessageRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete all messages in a room
    @DeleteMapping("/room/{roomId}")
    public ResponseEntity<HttpStatus> deleteAllMessagesInRoom(@PathVariable("roomId") Long roomId) {
        try {
            chatMessageRepository.deleteByRoomRoomId(roomId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 