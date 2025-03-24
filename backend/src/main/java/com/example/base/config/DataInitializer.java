package com.example.base.config;

import com.example.base.entity.Category;
import com.example.base.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        // Initialize categories if they don't exist
        if (categoryRepository.count() == 0) {
            List<String> categoryNames = Arrays.asList(
                "Italian", "Mexican", "Chinese", "Japanese", "Indian", 
                "American", "French", "Thai", "Mediterranean"
            );
            
            for (int i = 0; i < categoryNames.size(); i++) {
                Category category = new Category();
                category.setName(categoryNames.get(i));
                category.setCategoryId((long) (i + 1)); // Using 1-based indexing
                categoryRepository.save(category);
            }
            
            System.out.println("Categories initialized successfully!");
        }
    }
} 