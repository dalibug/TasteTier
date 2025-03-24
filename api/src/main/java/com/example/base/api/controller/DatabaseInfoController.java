package com.example.base.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000", "http://localhost"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/db-info")
public class DatabaseInfoController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/tables")
    public ResponseEntity<List<String>> getAllTables() {
        String sql = "SHOW TABLES";
        List<String> tables = jdbcTemplate.queryForList(sql, String.class);
        return ResponseEntity.ok(tables);
    }
    
    @GetMapping("/schema/{tableName}")
    public ResponseEntity<List<Map<String, Object>>> getTableSchema(@PathVariable String tableName) {
        String sql = "DESCRIBE " + tableName;
        List<Map<String, Object>> schema = jdbcTemplate.queryForList(sql);
        return ResponseEntity.ok(schema);
    }
    
    @GetMapping("/count/{tableName}")
    public ResponseEntity<Integer> getTableRowCount(@PathVariable String tableName) {
        String sql = "SELECT COUNT(*) FROM " + tableName;
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/data/{tableName}")
    public ResponseEntity<List<Map<String, Object>>> getTableData(@PathVariable String tableName) {
        String sql = "SELECT * FROM " + tableName + " LIMIT 10";
        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/all-items")
    public ResponseEntity<List<Map<String, Object>>> getAllItems() {
        String sql = "SELECT * FROM items ORDER BY item_id";
        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
        return ResponseEntity.ok(data);
    }
} 