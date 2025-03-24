package com.example.base.controller;

import com.example.base.dto.CategoryDTO;
import com.example.base.entity.Category;
import com.example.base.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000", "http://localhost"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    // Get all categories
    @SuppressWarnings("null")
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        try {
            List<Category> categories = categoryRepository.findAll();
            List<CategoryDTO> categoryDTOs = categories.stream()
                .map(CategoryDTO::new)
                .collect(Collectors.toList());
            return new ResponseEntity<>(categoryDTOs, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get active categories
    @SuppressWarnings("null")
    @GetMapping("/active")
    @Transactional(readOnly = true)
    public ResponseEntity<List<CategoryDTO>> getActiveCategories() {
        try {
            List<Category> categories = categoryRepository.findByIsActiveTrue();
            List<CategoryDTO> categoryDTOs = categories.stream()
                .map(CategoryDTO::new)
                .collect(Collectors.toList());
            return new ResponseEntity<>(categoryDTOs, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get categories active on a specific date
    @SuppressWarnings("null")
    @GetMapping("/active-on/{date}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<CategoryDTO>> getCategoriesActiveOnDate(@PathVariable("date") String dateStr) {
        try {
            LocalDate date = LocalDate.parse(dateStr);
            List<Category> categories = categoryRepository.findByActiveFromLessThanEqualAndActiveUntilGreaterThanEqual(date, date);
            List<CategoryDTO> categoryDTOs = categories.stream()
                .map(CategoryDTO::new)
                .collect(Collectors.toList());
            return new ResponseEntity<>(categoryDTOs, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get category by ID
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable("id") Long id) {
        Optional<Category> categoryData = categoryRepository.findById(id);
        
        if (categoryData.isPresent()) {
            return new ResponseEntity<>(new CategoryDTO(categoryData.get()), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Create a new category
    @SuppressWarnings("null")
    @PostMapping
    @Transactional
    public ResponseEntity<CategoryDTO> createCategory(@RequestBody Category category) {
        try {
            Category savedCategory = categoryRepository.save(category);
            return new ResponseEntity<>(new CategoryDTO(savedCategory), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update a category
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable("id") Long id, @RequestBody Category category) {
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
            
            Category updatedCategory = categoryRepository.save(existingCategory);
            return new ResponseEntity<>(new CategoryDTO(updatedCategory), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a category
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<HttpStatus> deleteCategory(@PathVariable("id") Long id) {
        try {
            categoryRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Search categories by name
    @SuppressWarnings("null")
    @GetMapping("/search")
    @Transactional(readOnly = true)
    public ResponseEntity<List<CategoryDTO>> searchCategories(@RequestParam("name") String name) {
        try {
            List<Category> categories = categoryRepository.findByNameContainingIgnoreCase(name);
            List<CategoryDTO> categoryDTOs = categories.stream()
                .map(CategoryDTO::new)
                .collect(Collectors.toList());
            return new ResponseEntity<>(categoryDTOs, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}