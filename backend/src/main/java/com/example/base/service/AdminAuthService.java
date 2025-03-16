package com.example.base.service;

import com.example.base.model.AdminUser;
import com.example.base.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {
    
    @Autowired
    private AdminUserRepository adminUserRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    public boolean authenticateAdmin(String username, String password) {
        return adminUserRepository.findByUsername(username)
            .map(admin -> passwordEncoder.matches(password, admin.getPassword()))
            .orElse(false);
    }

    public AdminUser createAdmin(String username, String password) {
        AdminUser admin = new AdminUser();
        admin.setUsername(username);
        admin.setPassword(passwordEncoder.encode(password));
        return adminUserRepository.save(admin);
    }
} 