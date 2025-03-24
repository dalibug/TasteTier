package com.example.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000", "http://localhost"}, allowCredentials = "true")
@RestController
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Map<String, Object> errorDetails = new HashMap<>();
        
        Object status = request.getAttribute("javax.servlet.error.status_code");
        Object message = request.getAttribute("javax.servlet.error.message");
        Object exception = request.getAttribute("javax.servlet.error.exception");
        
        errorDetails.put("status", status != null ? status : HttpStatus.INTERNAL_SERVER_ERROR.value());
        errorDetails.put("message", message != null ? message : "An unexpected error occurred");
        if (exception != null) {
            errorDetails.put("exception", exception.toString());
        }
        
        return ResponseEntity.status(status != null ? (Integer) status : HttpStatus.INTERNAL_SERVER_ERROR.value())
                           .body(errorDetails);
    }
} 