package com.example.base.repository;

import com.example.base.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    List<Category> findByIsActiveTrue();
    
    List<Category> findByActiveFromLessThanEqualAndActiveUntilGreaterThanEqual(LocalDate date, LocalDate sameDate);
    
    List<Category> findByNameContainingIgnoreCase(String name);
    
    Optional<Category> findByName(String name);
} 