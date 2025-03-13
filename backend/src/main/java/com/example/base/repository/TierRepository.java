package com.example.base.repository;

import com.example.base.entity.Tier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TierRepository extends JpaRepository<Tier, Long> {
    
    Optional<Tier> findByName(String name);
    
    List<Tier> findAllByOrderByRankOrderAsc();
} 