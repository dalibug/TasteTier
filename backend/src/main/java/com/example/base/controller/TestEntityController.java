package com.example.base.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.base.entity.TestEntity;
import com.example.base.repository.TestEntityRepository;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/test-entities")
public class TestEntityController {

    @Autowired
    private TestEntityRepository testEntityRepository;

    // Create a new TestEntity
    @PostMapping
    public ResponseEntity<TestEntity> createTestEntity(@RequestBody TestEntity testEntity) {
        try {
            TestEntity savedEntity = testEntityRepository.save(testEntity);
            return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Retrieve all TestEntities
    @GetMapping
    public ResponseEntity<List<TestEntity>> getAllTestEntities() {
        try {
            List<TestEntity> entities = testEntityRepository.findAll();
            
            if (entities.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            
            return new ResponseEntity<>(entities, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Retrieve a TestEntity by id
    @GetMapping("/{id}")
    public ResponseEntity<TestEntity> getTestEntityById(@PathVariable("id") Long id) {
        Optional<TestEntity> entityData = testEntityRepository.findById(id);

        if (entityData.isPresent()) {
            return new ResponseEntity<>(entityData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Update a TestEntity
    @PutMapping("/{id}")
    public ResponseEntity<TestEntity> updateTestEntity(@PathVariable("id") Long id, @RequestBody TestEntity testEntity) {
        Optional<TestEntity> entityData = testEntityRepository.findById(id);

        if (entityData.isPresent()) {
            TestEntity existingEntity = entityData.get();
            existingEntity.setName(testEntity.getName());
            existingEntity.setDescription(testEntity.getDescription());
            return new ResponseEntity<>(testEntityRepository.save(existingEntity), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a TestEntity
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteTestEntity(@PathVariable("id") Long id) {
        try {
            testEntityRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete all TestEntities
    @DeleteMapping
    public ResponseEntity<HttpStatus> deleteAllTestEntities() {
        try {
            testEntityRepository.deleteAll();
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Test database connection
    @GetMapping("/test-connection")
    public ResponseEntity<Map<String, Object>> testConnection() {
        try {
            Map<String, Object> response = new HashMap<>();
            long count = testEntityRepository.count();
            response.put("status", "success");
            response.put("message", "Database connection successful");
            response.put("entityCount", count);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Database connection failed: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 