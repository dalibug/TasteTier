package com.example.base.controller;

import com.example.base.service.AdminAuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminAuthController {
    private static final Logger logger = LoggerFactory.getLogger(AdminAuthController.class);

    @Autowired
    private AdminAuthService adminAuthService;

    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> credentials) {
        logger.info("Received admin login request for username: {}", credentials.get("username"));
        
        try {
            String username = credentials.get("username");
            String password = credentials.get("password");

            if (username == null || password == null) {
                logger.error("Missing username or password in request");
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Username and password are required"
                ));
            }

            if (adminAuthService.authenticateAdmin(username, password)) {
                logger.info("Admin login successful for username: {}", username);
                Map<String, Object> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "Admin login successful");
                return ResponseEntity.ok(response);
            }

            logger.warn("Admin login failed for username: {}", username);
            return ResponseEntity.status(401).body(Map.of(
                "status", "error",
                "message", "Invalid credentials"
            ));
        } catch (Exception e) {
            logger.error("Error during admin login: ", e);
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", "Internal server error: " + e.getMessage()
            ));
        }
    }
} 