package com.example.config;

import com.example.base.entity.User;
import com.example.base.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;

    public OAuth2LoginSuccessHandler(UserRepository userRepository) {
        this.userRepository = userRepository;
        setDefaultTargetUrl("/tierlists");
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) throws IOException, ServletException {
        
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();
        String provider = oauthToken.getAuthorizedClientRegistrationId();
        
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String oauthId = attributes.get("sub").toString();
        String email = attributes.get("email").toString();
        String name = attributes.get("name").toString();
        String pictureUrl = attributes.get("picture") != null ? attributes.get("picture").toString() : null;

        Optional<User> existingUser = userRepository.findByOauthProviderAndOauthId(provider, oauthId);
        
        User user;
        if (existingUser.isEmpty()) {
            // Create new user
            user = new User();
            user.setOauthProvider(provider);
            user.setOauthId(oauthId);
            user.setEmail(email);
            
            // Generate unique username if needed
            String baseUsername = name.toLowerCase().replaceAll("\\s+", "");
            String username = baseUsername;
            int counter = 1;
            while (userRepository.existsByUsername(username)) {
                username = baseUsername + counter++;
            }
            user.setUsername(username);
            
            user.setPictureUrl(pictureUrl);
            user.setCreatedAt(LocalDateTime.now());
        } else {
            user = existingUser.get();
            user.setPictureUrl(pictureUrl); // Update picture URL
        }
        
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        super.onAuthenticationSuccess(request, response, authentication);
    }
} 