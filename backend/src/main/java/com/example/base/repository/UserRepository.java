package com.example.base.repository;

import com.example.base.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByOauthProviderAndOauthId(String oauthProvider, String oauthId);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
} 