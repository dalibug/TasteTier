package com.example.base;

import com.example.base.OAuth.OAuthUser.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;


// This controller will only be active in production.
@Profile("prod")
// I was having issues with TestController when
// attempting to test api crud operations
// (which required an OAuth2AuthorizedClientService)
// causing the application startup to fail in
// development environment

@RestController
public class TestController {

    @GetMapping("/")
    public String HomeRoute() {

        return "Root";
    }

    @GetMapping("test")
    public String testEndpoint() {

        return "Test endpoint is working!";
    }


//    @GetMapping("testOAuth")
//    public Object sayHello(@AuthenticationPrincipal OAuth2User principal) {
//        // Map the OAuth2User to your custom User class
//        String name = (String) principal.getAttributes().get("name");
//        String email = (String) principal.getAttributes().get("email");
//        String picture = (String) principal.getAttributes().get("picture");
//
//        return new User(name, email, picture);  // This will return the user data in the response
//    }

    @Autowired
    private OAuth2AuthorizedClientService authorizedClientService;

    @GetMapping("testOAuth")
    public Object sayHello(@AuthenticationPrincipal OAuth2User principal, OAuth2AuthenticationToken authentication) {
        // Extract user details
        String username = principal.getAttribute("name");
        String email = principal.getAttribute("email");
        String pictureUrl = principal.getAttribute("picture");
        String oauthId = principal.getAttribute("sub");
        String oauthProvider = authentication.getAuthorizedClientRegistrationId();

        // Retrieve the OAuth2AuthorizedClient
        OAuth2AuthorizedClient authorizedClient = authorizedClientService.loadAuthorizedClient(
                authentication.getAuthorizedClientRegistrationId(), authentication.getName());

        // Extract tokens safely
        String accessToken = authorizedClient != null ? authorizedClient.getAccessToken().getTokenValue() : null;
        String refreshToken = (authorizedClient != null && authorizedClient.getRefreshToken() != null)
                ? authorizedClient.getRefreshToken().getTokenValue() : null;
        String tokenExpiresAt = (authorizedClient != null && authorizedClient.getAccessToken().getExpiresAt() != null)
                ? authorizedClient.getAccessToken().getExpiresAt().toString() : null;

        // Create and return the User object
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPictureUrl(pictureUrl);
        user.setOauthProvider(oauthProvider);
        user.setOauthId(oauthId);
        user.setIsAdmin(false);
        user.setAccessToken(accessToken);
        user.setRefreshToken(refreshToken);
        user.setTokenExpiresAt(tokenExpiresAt);

        return user;
    }
}










