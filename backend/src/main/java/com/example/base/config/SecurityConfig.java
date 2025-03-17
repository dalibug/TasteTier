package com.example.base.config;

import com.example.base.service.OAuth2UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    @Autowired
    private OAuth2UserService customOAuth2UserService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        logger.debug("Configuring SecurityFilterChain");
        
        http
            .csrf(csrf -> {
                logger.debug("Disabling CSRF protection");
                csrf.disable();
            })
            .cors(cors -> {
                logger.debug("Configuring CORS");
                cors.configurationSource(corsConfigurationSource());
            })
            .headers(headers -> headers
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000)
                    .disable() // Disable HSTS for local development
                )
            )
            .authorizeHttpRequests(auth -> {
                logger.debug("Configuring authorization rules");
                auth
                    // Public endpoints
                    .requestMatchers("/", "/error", "/h2-console/**").permitAll()
                    .requestMatchers("/api/health").permitAll()
                    .requestMatchers("/auth/login").permitAll()
                    .requestMatchers("/auth/status").permitAll()
                    .requestMatchers("/api/test-entities/**").permitAll()
                    .requestMatchers("/oauth2/**", "/login/**").permitAll()
                    
                    // Admin-only endpoints
                    .requestMatchers("/api/admin/**").hasAuthority("ADMIN")
                    .requestMatchers(HttpMethod.POST, "/api/categories/**").hasAuthority("ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasAuthority("ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasAuthority("ADMIN")
                    
                    // Authenticated endpoints
                    .requestMatchers("/api/**").hasAuthority("USER")
                    .requestMatchers("/auth/user").hasAuthority("USER")
                    .requestMatchers("/auth/logout").authenticated()
                    
                    // Allow all other requests
                    .anyRequest().permitAll();
            })
            .oauth2Login(oauth2 -> {
                logger.debug("Configuring OAuth2 login");
                oauth2
                    .userInfoEndpoint(userInfo -> {
                        logger.debug("Configuring userInfoEndpoint with customOAuth2UserService");
                        userInfo.oidcUserService(customOAuth2UserService);
                    })
                    .successHandler((request, response, authentication) -> {
                        logger.info("OAuth2 login successful, redirecting to frontend");
                        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
                        response.setHeader("Access-Control-Allow-Credentials", "true");
                        response.sendRedirect("http://localhost:3000/tierlists");
                    })
                    .failureHandler((request, response, exception) -> {
                        logger.error("OAuth2 login failed: {}", exception.getMessage(), exception);
                        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
                        response.setHeader("Access-Control-Allow-Credentials", "true");
                        response.sendRedirect("http://localhost:3000/login?error=true");
                    });
            })
            .logout(logout -> {
                logger.debug("Configuring logout");
                logout
                    .logoutUrl("/auth/logout")
                    .logoutSuccessUrl("http://localhost:3000/login?logout=true")
                    .invalidateHttpSession(true)
                    .clearAuthentication(true)
                    .deleteCookies("JSESSIONID");
            })
            .exceptionHandling(ex -> {
                logger.debug("Configuring exception handling");
                ex.authenticationEntryPoint((request, response, authException) -> {
                    logger.error("Authentication error: {}", authException.getMessage(), authException);
                    response.sendError(401, "Authentication required");
                });
            });

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        logger.debug("Creating CORS configuration");
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        configuration.setExposedHeaders(Arrays.asList(
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials"
        ));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
 