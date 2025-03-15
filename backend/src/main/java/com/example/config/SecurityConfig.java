package com.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.core.AuthenticationException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.IOException;
import java.util.Arrays;
import java.util.Enumeration;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring SecurityFilterChain");
        
        // Add a logging filter at the beginning of the chain
        http.addFilterBefore((request, response, chain) -> {
            HttpServletRequest req = (HttpServletRequest) request;
            logger.info("=== Incoming Request ===");
            logger.info("Method: {}", req.getMethod());
            logger.info("URI: {}", req.getRequestURI());
            logger.info("URL: {}", req.getRequestURL());
            logger.info("Query String: {}", req.getQueryString());
            logger.info("Remote Address: {}", req.getRemoteAddr());
            logger.info("Headers:");
            Enumeration<String> headerNames = req.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                logger.info("{}: {}", headerName, req.getHeader(headerName));
            }
            chain.doFilter(request, response);
        }, UsernamePasswordAuthenticationFilter.class);

        http
            .cors(cors -> {
                logger.info("Configuring CORS");
                cors.configurationSource(corsConfigurationSource());
            })
            .csrf(csrf -> {
                logger.info("Disabling CSRF");
                csrf.disable();
            })
            .authorizeHttpRequests(auth -> {
                logger.info("Configuring authorization rules");
                auth
                    .requestMatchers(
                        "/",
                        "/auth/**",
                        "/oauth2/**",
                        "/error",
                        "/login/**",
                        "/logout"
                    ).permitAll()
                    .anyRequest().authenticated();
            })
            .oauth2Login(oauth2 -> {
                logger.info("Configuring OAuth2 login");
                oauth2
                    .authorizationEndpoint(authorization -> authorization
                        .baseUri("/oauth2/authorization/google")
                        .authorizationRequestRepository(null) // Clear any stored auth requests
                    )
                    .defaultSuccessUrl("http://localhost:3000/tierlists", true)
                    .failureUrl("http://localhost:3000/login?error=true")
                    .successHandler((request, response, authentication) -> {
                        logger.info("=== OAuth2 Login Success ===");
                        logger.info("Request URI: {}", request.getRequestURI());
                        logger.info("Request URL: {}", request.getRequestURL());
                        logger.info("Query String: {}", request.getQueryString());
                        logger.info("Headers:");
                        Enumeration<String> headerNames = request.getHeaderNames();
                        while (headerNames.hasMoreElements()) {
                            String headerName = headerNames.nextElement();
                            logger.info("{}: {}", headerName, request.getHeader(headerName));
                        }
                        logger.info("Authentication: {}", authentication);
                        logger.info("Redirecting to: http://localhost:3000/tierlists");
                        
                        // Set CORS headers before redirect
                        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
                        response.setHeader("Access-Control-Allow-Credentials", "true");
                        response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
                        response.setHeader("Access-Control-Allow-Headers", "*");
                        
                        // Perform redirect
                        response.sendRedirect("http://localhost:3000/tierlists");
                    })
                    .failureHandler((request, response, exception) -> {
                        logger.error("=== OAuth2 Login Failure ===");
                        logger.error("Request URI: {}", request.getRequestURI());
                        logger.error("Request URL: {}", request.getRequestURL());
                        logger.error("Query String: {}", request.getQueryString());
                        logger.error("Error Message: {}", exception.getMessage());
                        logger.error("Error Class: {}", exception.getClass().getName());
                        logger.error("Stack Trace:", exception);
                        
                        // Set CORS headers before redirect
                        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
                        response.setHeader("Access-Control-Allow-Credentials", "true");
                        response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
                        response.setHeader("Access-Control-Allow-Headers", "*");
                        
                        response.sendRedirect("http://localhost:3000/login?error=true");
                    });
            })
            .logout(logout -> logout
                .logoutUrl("/logout")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID")
                .logoutSuccessHandler((request, response, authentication) -> {
                    logger.info("=== Logout Success ===");
                    response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
                    response.setHeader("Access-Control-Allow-Credentials", "true");
                    response.sendRedirect("http://localhost:3000/login?logout=true");
                })
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
} 