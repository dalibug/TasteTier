package com.example.base.controller;

import com.example.base.entity.User;
import com.example.base.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") Long id) {
        Optional<User> userData = userRepository.findById(id);
        
        if (userData.isPresent()) {
            return new ResponseEntity<>(userData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Create a new user
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            // Check if username already exists
            if (userRepository.existsByUsername(user.getUsername())) {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }
            
            // Check if email already exists
            if (userRepository.existsByEmail(user.getEmail())) {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }
            
            // Set creation time
            user.setCreatedAt(LocalDateTime.now());
            
            User savedUser = userRepository.save(user);
            return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update a user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable("id") Long id, @RequestBody User user) {
        Optional<User> userData = userRepository.findById(id);
        
        if (userData.isPresent()) {
            User existingUser = userData.get();
            
            // Update fields
            if (user.getUsername() != null) {
                existingUser.setUsername(user.getUsername());
            }
            if (user.getEmail() != null) {
                existingUser.setEmail(user.getEmail());
            }
            if (user.getPictureUrl() != null) {
                existingUser.setPictureUrl(user.getPictureUrl());
            }
            if (user.getIsAdmin() != null) {
                existingUser.setIsAdmin(user.getIsAdmin());
            }
            if (user.getLastLogin() != null) {
                existingUser.setLastLogin(user.getLastLogin());
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
            
            return new ResponseEntity<>(userRepository.save(existingUser), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a user
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteUser(@PathVariable("id") Long id) {
        try {
            userRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // OAuth login/signup
    @PostMapping("/oauth")
    public ResponseEntity<User> oauthLogin(@RequestBody Map<String, String> oauthData) {
        try {
            String provider = oauthData.get("provider");
            String oauthId = oauthData.get("oauthId");
            String email = oauthData.get("email");
            String username = oauthData.get("username");
            String pictureUrl = oauthData.get("pictureUrl");
            String accessToken = oauthData.get("accessToken");
            String refreshToken = oauthData.get("refreshToken");
            
            // Find user by OAuth provider and ID
            Optional<User> existingUser = userRepository.findByOauthProviderAndOauthId(provider, oauthId);
            
            if (existingUser.isPresent()) {
                // Update existing user
                User user = existingUser.get();
                user.setLastLogin(LocalDateTime.now());
                user.setAccessToken(accessToken);
                user.setRefreshToken(refreshToken);
                user.setTokenExpiresAt(LocalDateTime.now().plusHours(1)); // Example expiry
                
                return new ResponseEntity<>(userRepository.save(user), HttpStatus.OK);
            } else {
                // Create new user
                User newUser = new User();
                newUser.setOauthProvider(provider);
                newUser.setOauthId(oauthId);
                newUser.setEmail(email);
                newUser.setUsername(username);
                newUser.setPictureUrl(pictureUrl);
                newUser.setCreatedAt(LocalDateTime.now());
                newUser.setLastLogin(LocalDateTime.now());
                newUser.setAccessToken(accessToken);
                newUser.setRefreshToken(refreshToken);
                newUser.setTokenExpiresAt(LocalDateTime.now().plusHours(1)); // Example expiry
                
                return new ResponseEntity<>(userRepository.save(newUser), HttpStatus.CREATED);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 