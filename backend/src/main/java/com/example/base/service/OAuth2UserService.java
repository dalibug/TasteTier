package com.example.base.service;

import com.example.base.entity.User;
import com.example.base.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
public class OAuth2UserService extends OidcUserService {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        logger.info("Loading OAuth2 user...");
        OidcUser oidcUser = super.loadUser(userRequest);
        logger.info("OAuth2 user loaded successfully: {}", oidcUser.getAttributes());
        
        try {
            processOAuth2User(oidcUser);
            logger.info("OAuth2 user processed successfully");
        } catch (Exception e) {
            logger.error("Error processing OAuth2 user: {}", e.getMessage(), e);
            throw e;
        }
        
        return oidcUser;
    }

    @Transactional
    protected void processOAuth2User(OidcUser oidcUser) {
        Map<String, Object> attributes = oidcUser.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String pictureUrl = (String) attributes.get("picture");
        String oauthId = (String) attributes.get("sub");
        String oauthProvider = "google"; // Since we're only using Google OAuth

        logger.info("Processing OAuth2 user - Email: {}, Name: {}, OAuth ID: {}", email, name, oauthId);

        try {
            // Find existing user by OAuth provider and ID
            Optional<User> existingUser = userRepository.findByOauthProviderAndOauthId(oauthProvider, oauthId);

            if (existingUser.isPresent()) {
                logger.info("Updating existing user: {}", existingUser.get().getUsername());
                // Update existing user
                User user = existingUser.get();
                user.setLastLogin(LocalDateTime.now());
                user.setEmail(email);
                user.setUsername(name);
                user.setPictureUrl(pictureUrl);
                userRepository.save(user);
                logger.info("User updated successfully");
            } else {
                logger.info("Creating new user with email: {}", email);
                // Create new user
                User newUser = new User();
                newUser.setOauthProvider(oauthProvider);
                newUser.setOauthId(oauthId);
                newUser.setEmail(email);
                newUser.setUsername(name);
                newUser.setPictureUrl(pictureUrl);
                newUser.setCreatedAt(LocalDateTime.now());
                newUser.setLastLogin(LocalDateTime.now());
                User savedUser = userRepository.save(newUser);
                logger.info("New user created successfully with ID: {}", savedUser.getUserId());
            }
        } catch (Exception e) {
            logger.error("Error processing OAuth2 user: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process OAuth2 user", e);
        }
    }
} 