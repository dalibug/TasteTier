package com.example.base.controller;

import com.example.base.entity.User;
import com.example.base.entity.TierList;
import com.example.base.repository.UserRepository;
import com.example.base.repository.TierListRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.HashMap;

@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000", "http://localhost"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TierListRepository tierListRepository;
    
    @PersistenceContext
    private EntityManager entityManager;

    // Get all users
    @SuppressWarnings("null")
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            if (users.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get user by id
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<User> getUserById(@PathVariable("id") Long id) {
        Optional<User> userData = userRepository.findById(id);
        if (userData.isPresent()) {
            return new ResponseEntity<>(userData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Create a new user
    @SuppressWarnings("null")
    @PostMapping
    @Transactional
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            // Check if user with this OAuth ID already exists
            if (user.getOauthId() != null && user.getOauthProvider() != null) {
                Optional<User> existingUser = userRepository.findByOauthProviderAndOauthId(
                    user.getOauthProvider(), user.getOauthId());
                if (existingUser.isPresent()) {
                    // Update existing user with new data if needed
                    User updatedUser = existingUser.get();
                    if (user.getUsername() != null) {
                        updatedUser.setUsername(user.getUsername());
                    }
                    if (user.getEmail() != null) {
                        updatedUser.setEmail(user.getEmail());
                    }
                    if (user.getPictureUrl() != null) {
                        updatedUser.setPictureUrl(user.getPictureUrl());
                    }
                    return new ResponseEntity<>(userRepository.save(updatedUser), HttpStatus.OK);
                }
            }
            
            // Set creation time
            user.setCreatedAt(LocalDateTime.now());
            
            // Create new user
            User newUser = userRepository.save(user);
            return new ResponseEntity<>(newUser, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update a user
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<User> updateUser(@PathVariable("id") Long id, @RequestBody User user) {
        Optional<User> userData = userRepository.findById(id);
        
        if (userData.isPresent()) {
            User existingUser = userData.get();
            
            // Update fields if provided
            if (user.getUsername() != null) {
                existingUser.setUsername(user.getUsername());
            }
            if (user.getEmail() != null) {
                existingUser.setEmail(user.getEmail());
            }
            if (user.getPictureUrl() != null) {
                existingUser.setPictureUrl(user.getPictureUrl());
            }
            if (user.getOauthId() != null) {
                existingUser.setOauthId(user.getOauthId());
            }
            if (user.getOauthProvider() != null) {
                existingUser.setOauthProvider(user.getOauthProvider());
            }
            if (user.getAccessToken() != null) {
                existingUser.setAccessToken(user.getAccessToken());
            }
            if (user.getRefreshToken() != null) {
                existingUser.setRefreshToken(user.getRefreshToken());
            }
            if (user.getTokenExpiresAt() != null) {
                existingUser.setTokenExpiresAt(user.getTokenExpiresAt());
            }
            
            existingUser.setLastLogin(LocalDateTime.now());

            return new ResponseEntity<>(userRepository.save(existingUser), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a user
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<HttpStatus> deleteUser(@PathVariable("id") Long id) {
        try {
            userRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // OAuth login or register
    @SuppressWarnings("null")
    @PostMapping("/oauth")
    @Transactional
    public ResponseEntity<User> oauthLogin(@RequestBody Map<String, String> oauthData) {
        try {
            String provider = oauthData.get("provider");
            String oauthId = oauthData.get("oauthId");
            String email = oauthData.get("email");
            String username = oauthData.get("username");
            String pictureUrl = oauthData.get("pictureUrl");
            String accessToken = oauthData.get("accessToken");
            String refreshToken = oauthData.get("refreshToken");
            
            // First try to find by OAuth provider and ID
            Optional<User> existingUserByOauth = userRepository.findByOauthProviderAndOauthId(provider, oauthId);
            if (existingUserByOauth.isPresent()) {
                User user = existingUserByOauth.get();
                // Update user details
                user.setLastLogin(LocalDateTime.now());
                if (pictureUrl != null) user.setPictureUrl(pictureUrl);
                if (accessToken != null) user.setAccessToken(accessToken);
                if (refreshToken != null) user.setRefreshToken(refreshToken);
                user.setTokenExpiresAt(LocalDateTime.now().plusHours(1));
                return new ResponseEntity<>(userRepository.save(user), HttpStatus.OK);
            }
            
            // Then try by email
            Optional<User> existingUserByEmail = userRepository.findByEmail(email);
            if (existingUserByEmail.isPresent()) {
                User user = existingUserByEmail.get();
                // Link OAuth ID to existing email account
                user.setOauthProvider(provider);
                user.setOauthId(oauthId);
                user.setLastLogin(LocalDateTime.now());
                if (pictureUrl != null) user.setPictureUrl(pictureUrl);
                if (accessToken != null) user.setAccessToken(accessToken);
                if (refreshToken != null) user.setRefreshToken(refreshToken);
                user.setTokenExpiresAt(LocalDateTime.now().plusHours(1));
                return new ResponseEntity<>(userRepository.save(user), HttpStatus.OK);
            }
            
            // Create new user
            User newUser = new User();
            newUser.setOauthProvider(provider);
            newUser.setOauthId(oauthId);
            newUser.setEmail(email);
            newUser.setPictureUrl(pictureUrl);
            // Generate username based on email if not provided
            newUser.setUsername(username != null ? username : email.split("@")[0]);
            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setLastLogin(LocalDateTime.now());
            newUser.setAccessToken(accessToken);
            newUser.setRefreshToken(refreshToken);
            newUser.setTokenExpiresAt(LocalDateTime.now().plusHours(1));
            
            return new ResponseEntity<>(userRepository.save(newUser), HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get tier list count for a user
    @GetMapping("/{id}/tierlist-count")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getUserTierListCount(@PathVariable("id") Long id) {
        try {
            Optional<User> userData = userRepository.findById(id);
            
            if (!userData.isPresent()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            
            // Count tier lists for this user
            @SuppressWarnings("unchecked")
            Long count = (Long) entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM tier_lists WHERE user_id = ?")
                .setParameter(1, id)
                .getSingleResult();
            
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            System.out.println("DEBUG TIER LIST: Error using direct SQL queries: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 