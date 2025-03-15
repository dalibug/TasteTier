package com.example.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @GetMapping("/login")
    public ResponseEntity<Map<String, String>> login() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Please log in");
        response.put("google_login_url", "/oauth2/authorization/google");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/success")
    public ResponseEntity<Map<String, String>> success() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Successfully logged in!");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/error")
    public ResponseEntity<Map<String, String>> error() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Authentication failed");
        response.put("retry_url", "/auth/login");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "Authentication service is running");
        response.put("endpoints", new String[]{
            "/auth/login",
            "/oauth2/authorization/google",
            "/auth/success",
            "/auth/error"
        });
        return ResponseEntity.ok(response);
    }
} 