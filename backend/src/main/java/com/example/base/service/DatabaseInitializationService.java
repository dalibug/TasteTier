package com.example.base.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class DatabaseInitializationService {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializationService.class);
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @PostConstruct
    public void initialize() {
        try {
            logger.info("Executing database initialization script to fix zero dates...");
            
            // Load the SQL script
            ClassPathResource resource = new ClassPathResource("sql/fix-zero-dates.sql");
            String sqlScript = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
            
            // Split by semicolon to execute each statement
            String[] statements = sqlScript.split(";");
            
            for (String statement : statements) {
                if (!statement.trim().isEmpty()) {
                    try {
                        logger.debug("Executing SQL: {}", statement);
                        jdbcTemplate.execute(statement);
                    } catch (Exception e) {
                        logger.warn("Error executing SQL statement: {}", e.getMessage());
                        // Continue with the next statement even if this one fails
                    }
                }
            }
            
            logger.info("Database initialization completed successfully");
        } catch (IOException e) {
            logger.error("Failed to read SQL initialization script: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("Error during database initialization: {}", e.getMessage());
        }
    }
} 