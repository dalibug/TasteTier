package com.example.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000", "http://localhost"}, allowCredentials = "true")
@RestController
public class TestController {

    private final ClientRegistrationRepository clientRegistrationRepository;

    public TestController(ClientRegistrationRepository clientRegistrationRepository) {
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

    @GetMapping("/oauth2-info")
    public Map<String, Object> getOAuth2Info() {
        Map<String, Object> info = new HashMap<>();
        ClientRegistration google = clientRegistrationRepository.findByRegistrationId("google");
        
        if (google != null) {
            info.put("provider", "google");
            info.put("clientId", google.getClientId());
            info.put("scopes", google.getScopes());
            info.put("redirectUri", google.getRedirectUri());
            info.put("authorizationUri", google.getProviderDetails().getAuthorizationUri());
        } else {
            info.put("error", "Google OAuth2 configuration not found");
        }
        
        return info;
    }
} 