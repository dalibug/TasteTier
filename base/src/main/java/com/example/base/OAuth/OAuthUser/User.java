package com.example.base.OAuth.OAuthUser;

//public class User {
//    private String name;
//    private String email;
//    private String picture;
//
//    // Getters and setters
//
//    public User(String name, String email, String picture) {
//        this.name = name;
//        this.email = email;
//        this.picture = picture;
//    }
//
//    public User() {
//        this.name = "";
//        this.email = "";
//        this.picture = "";
//    }
//
//    // Getters and setters
//    public String getName() {
//        return name;
//    }
//
//    public void setName(String name) {
//        this.name = name;
//    }
//
//    public String getEmail() {
//        return email;
//    }
//
//    public void setEmail(String email) {
//        this.email = email;
//    }
//
//    public String getPicture() {
//        return picture;
//    }
//
//    public void setPicture(String picture) {
//        this.picture = picture;
//    }
//}


public class User {
    private Integer userId;
    private String username;
    private String email;
    private String oauthProvider;
    private String oauthId;
    private String pictureUrl;
    private Boolean isAdmin;
    private String accessToken;
    private String refreshToken;
    private String tokenExpiresAt;

    // Constructor
    public User(Integer userId, String username, String email, String oauthProvider, String oauthId,
                String pictureUrl, Boolean isAdmin, String accessToken, String refreshToken, String tokenExpiresAt) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.oauthProvider = oauthProvider;
        this.oauthId = oauthId;
        this.pictureUrl = pictureUrl;
        this.isAdmin = isAdmin;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenExpiresAt = tokenExpiresAt;
    }

    // Default Constructor
    public User() {
        this.userId = 0;
        this.username = "";
        this.email = "";
        this.oauthProvider = "";
        this.oauthId = "";
        this.pictureUrl = "";
        this.isAdmin = false;
        this.accessToken = "";
        this.refreshToken = "";
        this.tokenExpiresAt = "";
    }

    // Getters and Setters
    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOauthProvider() {
        return oauthProvider;
    }

    public void setOauthProvider(String oauthProvider) {
        this.oauthProvider = oauthProvider;
    }

    public String getOauthId() {
        return oauthId;
    }

    public void setOauthId(String oauthId) {
        this.oauthId = oauthId;
    }

    public String getPictureUrl() {
        return pictureUrl;
    }

    public void setPictureUrl(String pictureUrl) {
        this.pictureUrl = pictureUrl;
    }

    public Boolean getIsAdmin() {
        return isAdmin;
    }

    public void setIsAdmin(Boolean isAdmin) {
        this.isAdmin = isAdmin;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getTokenExpiresAt() {
        return tokenExpiresAt;
    }

    public void setTokenExpiresAt(String tokenExpiresAt) {
        this.tokenExpiresAt = tokenExpiresAt;
    }
}
