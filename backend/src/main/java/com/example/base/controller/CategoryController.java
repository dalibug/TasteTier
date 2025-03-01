package com.example.base.controller;

import com.example.base.entity.Category;
import com.example.base.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    // Get all categories
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        try {
            List<Category> categories = categoryRepository.findAll();
            return new ResponseEntity<>(categories, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get active categories
    @GetMapping("/active")
    public ResponseEntity<List<Category>> getActiveCategories() {
        try {
            List<Category> categories = categoryRepository.findByIsActiveTrue();
            return new ResponseEntity<>(categories, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get categories active on a specific date
    @GetMapping("/active-on/{date}")
    public ResponseEntity<List<Category>> getCategoriesActiveOnDate(@PathVariable("date") String dateStr) {
        try {
            LocalDate date = LocalDate.parse(dateStr);
            List<Category> categories = categoryRepository.findByActiveFromLessThanEqualAndActiveUntilGreaterThanEqual(date, date);
            return new ResponseEntity<>(categories, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get category by ID
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable("id") Long id) {
        Optional<Category> categoryData = categoryRepository.findById(id);
        
        if (categoryData.isPresent()) {
            return new ResponseEntity<>(categoryData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Create a new category
    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        try {
            Category savedCategory = categoryRepository.save(category);
            return new ResponseEntity<>(savedCategory, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update a category
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable("id") Long id, @RequestBody Category category) {
        Optional<Category> categoryData = categoryRepository.findById(id);
        
        if (categoryData.isPresent()) {
            Category existingCategory = categoryData.get();
            
            // Update fields
            if (category.getName() != null) {
                existingCategory.setName(category.getName());
            }
            if (category.getDescription() != null) {
                existingCategory.setDescription(category.getDescription());
            }
            if (category.getActiveFrom() != null) {
                existingCategory.setActiveFrom(category.getActiveFrom());
            }
            if (category.getActiveUntil() != null) {
                existingCategory.setActiveUntil(category.getActiveUntil());
            }
            if (category.getIsActive() != null) {
                existingCategory.setIsActive(category.getIsActive());
            }
            
            return new ResponseEntity<>(categoryRepository.save(existingCategory), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a category
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteCategory(@PathVariable("id") Long id) {
        try {
            categoryRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Search categories by name
    @GetMapping("/search")
    public ResponseEntity<List<Category>> searchCategories(@RequestParam("name") String name) {
        try {
            List<Category> categories = categoryRepository.findByNameContainingIgnoreCase(name);
            return new ResponseEntity<>(categories, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 