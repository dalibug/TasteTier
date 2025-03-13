package com.example.base;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/db-test")
public class DatabaseTestController {

    @Autowired
    private DataSource dataSource;

    @GetMapping
    public Map<String, Object> testDatabaseConnection() {
        Map<String, Object> response = new HashMap<>();
        
        try (Connection connection = dataSource.getConnection()) {
            response.put("connection", "Success");
            response.put("databaseProduct", connection.getMetaData().getDatabaseProductName());
            response.put("databaseVersion", connection.getMetaData().getDatabaseProductVersion());
            response.put("driverName", connection.getMetaData().getDriverName());
            response.put("url", connection.getMetaData().getURL());
            
            // Test a simple query
            response.put("queryResult", "Database connection successful!");
            
        } catch (SQLException e) {
            response.put("connection", "Failed");
            response.put("error", e.getMessage());
            response.put("errorType", e.getClass().getName());
        }
        
        return response;
    }
} 