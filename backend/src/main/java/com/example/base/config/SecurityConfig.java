package com.example.base.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        return new InMemoryClientRegistrationRepository(this.googleClientRegistration());
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())  // Disable CSRF for now
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(
                    "/",
                    "/test",
                    "/login",
                    "/login.html",
                    "/error",
                    "/css/**",
                    "/js/**",
                    "/images/**",
                    "/*.png",
                    "/*.ico",
                    "/static/**",
                    "/*.css",
                    "/styles.css",
                    "/background2.png",
                    "/api/test-entities/**",  // Allow test endpoints
                    "/db-test/**",            // Allow database test endpoint
                    "/simple-test/**"         // Allow simple test endpoint
                ).permitAll()
                .requestMatchers("/oauth2/**", "/login/**").permitAll()  // Allow OAuth2 endpoints
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .loginPage("/login.html")
                .defaultSuccessUrl("/", true)
                .failureUrl("/login.html?error=true")
            )
            .logout(logout -> logout
                .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                .logoutSuccessUrl("/login.html")
                .permitAll()
            );

        return http.build();
    }

    private ClientRegistration googleClientRegistration() {
        return ClientRegistration.withRegistrationId("google")
                .clientId("579266292777-5ib39aoa2gpe8bfbgkn15amsikls2ram.apps.googleusercontent.com")
                .clientSecret("GOCSPX-fi27sJzZiwx-tyN3gVjpUegDjx")
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("http://localhost:8082/login/oauth2/code/google")
                .scope("openid", "profile", "email")
                .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
                .tokenUri("https://www.googleapis.com/oauth2/v4/token")
                .userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo")
                .userNameAttributeName(IdTokenClaimNames.SUB)
                .jwkSetUri("https://www.googleapis.com/oauth2/v3/certs")
                .clientName("Google")
                .build();
    }
} 