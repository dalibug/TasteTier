package com.example.base.OAuth.UserAuthentication;

import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;

import com.example.base.OAuth.OAuthUser.User;

import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.stereotype.Service;

import java.time.Instant;

//@Service
//public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
//
//    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
//
//    @Override
//    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
//        OAuth2User oAuth2User = delegate.loadUser(userRequest);
//
//        // Extract user information and populate your user class here
//        String username = oAuth2User.getAttribute("sub");
//        String name = oAuth2User.getAttribute("name");
//        String email = oAuth2User.getAttribute("email");
//        String picture = oAuth2User.getAttribute("picture");
//
//        // Create your custom user object (e.g., User)
//        User customUser = new User();
//        customUser.setName(name);
//        customUser.setEmail(email);
//        customUser.setPicture(picture);
//
//        // Return the custom user or wrap the OAuth2User into a custom user object
//        return oAuth2User;
//    }
//}


@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        // Extract OAuth provider details
        String oauthProvider = userRequest.getClientRegistration().getRegistrationId();
        String oauthId = oAuth2User.getAttribute("sub"); // Adjust as per provider
        String username = oAuth2User.getAttribute("name");
        String email = oAuth2User.getAttribute("email");
        String pictureUrl = oAuth2User.getAttribute("picture");

        // Extract tokens and expiration
        String accessToken = userRequest.getAccessToken().getTokenValue();
        String refreshToken = userRequest.getAdditionalParameters().get("refresh_token") != null
                ? userRequest.getAdditionalParameters().get("refresh_token").toString()
                : null;
        Instant tokenExpiresAt = userRequest.getAccessToken().getExpiresAt();

        // Creating User instance
        User customUser = new User();
        customUser.setUsername(username);
        customUser.setEmail(email);
        customUser.setOauthProvider(oauthProvider);
        customUser.setOauthId(oauthId);
        customUser.setPictureUrl(pictureUrl);
        customUser.setIsAdmin(false); // Business logic
        customUser.setAccessToken(accessToken);
        customUser.setRefreshToken(refreshToken);
        customUser.setTokenExpiresAt(tokenExpiresAt != null ? tokenExpiresAt.toString() : null);

        // You may want to save or update the user in your database here

        return oAuth2User;
    }
}
