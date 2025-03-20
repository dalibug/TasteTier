package com.example.base.controller;

import com.example.base.entity.User;
import com.example.base.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/login")
    public ResponseEntity<Map<String, String>> login() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Please log in");
        response.put("google_login_url", "/oauth2/authorization/google");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "Authentication service is running");
        response.put("endpoints", new String[]{
            "/auth/login",
            "/oauth2/authorization/google"
        });
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/current-user")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser")) {
            Map<String, Object> response = new HashMap<>();
            response.put("authenticated", false);
            return ResponseEntity.ok(response);
        }
        
        try {
            OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
            String oauthId = oidcUser.getAttribute("sub");
            String oauthProvider = "google";
            
            Optional<User> userOptional = userRepository.findByOauthProviderAndOauthId(oauthProvider, oauthId);
            
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                Map<String, Object> userResponse = new HashMap<>();
                userResponse.put("authenticated", true);
                userResponse.put("userId", user.getUserId());
                userResponse.put("username", user.getUsername());
                userResponse.put("email", user.getEmail());
                userResponse.put("pictureUrl", user.getPictureUrl());
                userResponse.put("isAdmin", user.isAdmin());
                
                return ResponseEntity.ok(userResponse);
            }
        } catch (Exception e) {
            // Log the error but don't expose details to client
            e.printStackTrace();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", false);
        return ResponseEntity.ok(response);
    }
} 