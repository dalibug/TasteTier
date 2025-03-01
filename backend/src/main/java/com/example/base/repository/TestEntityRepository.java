package com.example.base.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.base.entity.TestEntity;

@Repository
public interface TestEntityRepository extends JpaRepository<TestEntity, Long> {
    // Spring Data JPA will automatically implement basic CRUD operations
    // We can add custom query methods here if needed
} 