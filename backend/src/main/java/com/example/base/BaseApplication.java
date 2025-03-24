package com.example.base;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationStartedEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication  // This will automatically scan components, repositories, and entities
public class BaseApplication {

    private static final Logger logger = LoggerFactory.getLogger(BaseApplication.class);
    private final Environment env;

    public BaseApplication(Environment env) {
        this.env = env;
    }

    public static void main(String[] args) {
        SpringApplication.run(BaseApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @EventListener
    public void onApplicationStarted(ApplicationStartedEvent event) {
        logger.info("Application started, checking OAuth2 configuration...");
        String clientId = env.getProperty("spring.security.oauth2.client.registration.google.client-id");
        String clientSecret = env.getProperty("spring.security.oauth2.client.registration.google.client-secret");
        String redirectUri = env.getProperty("spring.security.oauth2.client.registration.google.redirect-uri");
        
        logger.info("OAuth2 Configuration:");
        logger.info("Client ID present: {}", clientId != null && !clientId.startsWith("${"));
        logger.info("Client Secret present: {}", clientSecret != null && !clientSecret.startsWith("${"));
        logger.info("Redirect URI: {}", redirectUri);
    }
}


