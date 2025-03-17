package com.example.base.service;

import com.example.base.entity.User;
import com.example.base.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class OAuth2UserService extends OidcUserService {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2UserService.class);
    
    // List of admin email domains or specific emails
    private static final List<String> ADMIN_EMAILS = Arrays.asList(
        "admin@example.com",
        "admin@tastetier.com"
    );
    
    private static final List<String> ADMIN_DOMAINS = Arrays.asList(
        "admin.tastetier.com"
    );

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        logger.info("Loading OAuth2 user...");
        OidcUser oidcUser = super.loadUser(userRequest);
        logger.info("OAuth2 user loaded successfully: {}", oidcUser.getAttributes());
        
        try {
            // Extract token information
            String accessToken = userRequest.getAccessToken().getTokenValue();
            Instant expiresAt = userRequest.getAccessToken().getExpiresAt();
            
            // Process user and get the database user entity
            User user = processOAuth2User(oidcUser, accessToken, expiresAt);
            logger.info("OAuth2 user processed successfully");
            
            // Create authorities based on user's admin status
            Collection<GrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("USER"));
            
            if (user.getIsAdmin() != null && user.getIsAdmin()) {
                authorities.add(new SimpleGrantedAuthority("ADMIN"));
                logger.info("Added ADMIN authority to user {}", user.getEmail());
            }
            
            // Create a new OidcUser with the correct authorities
            return new DefaultOidcUser(authorities, oidcUser.getIdToken(), oidcUser.getUserInfo(), "email");
            
        } catch (Exception e) {
            logger.error("Error processing OAuth2 user: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    protected User processOAuth2User(OidcUser oidcUser, String accessToken, Instant expiresAt) {
        Map<String, Object> attributes = oidcUser.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String pictureUrl = (String) attributes.get("picture");
        String oauthId = (String) attributes.get("sub");
        String oauthProvider = "google"; // Since we're only using Google OAuth
        
        // Convert Instant to LocalDateTime
        LocalDateTime tokenExpiresAt = null;
        if (expiresAt != null) {
            tokenExpiresAt = LocalDateTime.ofInstant(expiresAt, ZoneId.systemDefault());
        }

        logger.info("Processing OAuth2 user - Email: {}, Name: {}, OAuth ID: {}", email, name, oauthId);

        try {
            // Find existing user by OAuth provider and ID
            Optional<User> existingUser = userRepository.findByOauthProviderAndOauthId(oauthProvider, oauthId);
            User user;

            if (existingUser.isPresent()) {
                logger.info("Updating existing user: {}", existingUser.get().getUsername());
                // Update existing user
                user = existingUser.get();
                user.setLastLogin(LocalDateTime.now());
                user.setEmail(email);
                user.setUsername(name);
                user.setPictureUrl(pictureUrl);
                
                // Update token information
                user.setAccessToken(accessToken);
                user.setTokenExpiresAt(tokenExpiresAt);
                
                user = userRepository.save(user);
                logger.info("User updated successfully");
            } else {
                logger.info("Creating new user with email: {}", email);
                // Create new user
                user = new User();
                user.setOauthProvider(oauthProvider);
                user.setOauthId(oauthId);
                user.setEmail(email);
                user.setUsername(name);
                user.setPictureUrl(pictureUrl);
                user.setCreatedAt(LocalDateTime.now());
                user.setLastLogin(LocalDateTime.now());
                
                // Set token information
                user.setAccessToken(accessToken);
                user.setTokenExpiresAt(tokenExpiresAt);
                
                // Check if user should be an admin
                boolean isAdmin = isAdminEmail(email);
                user.setIsAdmin(isAdmin);
                
                if (isAdmin) {
                    logger.info("User {} is set as admin", email);
                }
                
                user = userRepository.save(user);
                logger.info("New user created successfully with ID: {}", user.getUserId());
            }
            
            return user;
        } catch (Exception e) {
            logger.error("Error processing OAuth2 user: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process OAuth2 user", e);
        }
    }
    
    /**
     * Determines if an email should have admin privileges
     * @param email The user's email address
     * @return true if the email should have admin privileges
     */
    private boolean isAdminEmail(String email) {
        if (email == null) {
            return false;
        }
        
        // Check if email is in the admin list
        if (ADMIN_EMAILS.contains(email.toLowerCase())) {
            return true;
        }
        
        // Check if email domain is in the admin domains list
        String domain = email.substring(email.indexOf('@') + 1).toLowerCase();
        return ADMIN_DOMAINS.contains(domain);
    }
} 