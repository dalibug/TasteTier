package com.example.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000", "http://localhost"}, allowCredentials = "true")
@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, String>> home() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Welcome to TasteTier API");
        response.put("login_url", "/auth/login");
        response.put("status_url", "/auth/status");
        return ResponseEntity.ok(response);
    }
} 