package com.example.base.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:8000")
public class TestController {

    @Autowired
    private DataSource dataSource;

    @PostMapping("/test")
    public ResponseEntity<?> testDatabase(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try (Connection conn = dataSource.getConnection()) {
            response.put("status", "success");
            response.put("message", "Database connection successful");
            response.put("testData", request.get("testData"));
            
            // Test query
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT 1")) {
                if (rs.next()) {
                    response.put("queryTest", "successful");
                }
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
} 