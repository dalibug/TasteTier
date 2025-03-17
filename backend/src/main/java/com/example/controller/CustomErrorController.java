package com.example.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.Map;

@Controller
public class CustomErrorController implements ErrorController {

    private static final Logger logger = LoggerFactory.getLogger(CustomErrorController.class);

    @RequestMapping("/error")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        Object exception = request.getAttribute(RequestDispatcher.ERROR_EXCEPTION);
        Object path = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
        
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("path", path != null ? path : request.getRequestURI());
        errorDetails.put("timestamp", System.currentTimeMillis());
        
        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());
            errorDetails.put("status", statusCode);
            errorDetails.put("error", HttpStatus.valueOf(statusCode).getReasonPhrase());
            
            logger.error("Error occurred: status={}, path={}", statusCode, path);
            
            if (message != null) {
                errorDetails.put("message", message);
                logger.error("Error message: {}", message);
            }
            
            if (exception != null) {
                errorDetails.put("exception", exception.toString());
                logger.error("Exception: {}", exception);
                
                if (exception instanceof Exception) {
                    Exception ex = (Exception) exception;
                    logger.error("Exception details", ex);
                }
            }
            
            return ResponseEntity.status(statusCode).body(errorDetails);
        }
        
        // Default error response
        errorDetails.put("status", 500);
        errorDetails.put("error", "Internal Server Error");
        errorDetails.put("message", "An unexpected error occurred");
        
        logger.error("Unhandled error occurred for path: {}", request.getRequestURI());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorDetails);
    }
} 