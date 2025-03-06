package com.example.base;

import com.example.base.OAuth.OAuthUser.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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


    @GetMapping("testOAuth")
    public Object sayHello(@AuthenticationPrincipal OAuth2User principal) {
        // Map the OAuth2User to your custom User class
        String name = (String) principal.getAttributes().get("name");
        String email = (String) principal.getAttributes().get("email");
        String picture = (String) principal.getAttributes().get("picture");

        return new User(name, email, picture);  // This will return the user data in the response
    }
}










