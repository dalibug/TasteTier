package com.example.base.service;

import com.example.base.entity.User;
import com.example.base.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
public class OAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        processOAuth2User(oauth2User);
        return oauth2User;
    }

    @Transactional
    private void processOAuth2User(OAuth2User oauth2User) {
        Map<String, Object> attributes = oauth2User.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String pictureUrl = (String) attributes.get("picture");
        String oauthId = (String) attributes.get("sub");
        String oauthProvider = "google"; // Since we're only using Google OAuth

        // Find existing user by OAuth provider and ID
        Optional<User> existingUser = userRepository.findByOauthProviderAndOauthId(oauthProvider, oauthId);

        if (existingUser.isPresent()) {
            // Update existing user
            User user = existingUser.get();
            user.setLastLogin(LocalDateTime.now());
            user.setEmail(email);
            user.setUsername(name);
            user.setPictureUrl(pictureUrl);
            userRepository.save(user);
        } else {
            // Create new user
            User newUser = new User();
            newUser.setOauthProvider(oauthProvider);
            newUser.setOauthId(oauthId);
            newUser.setEmail(email);
            newUser.setUsername(name);
            newUser.setPictureUrl(pictureUrl);
            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setLastLogin(LocalDateTime.now());
            userRepository.save(newUser);
        }
    }
} 