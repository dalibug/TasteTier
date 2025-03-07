package com.example.base;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/simple-test") // Updated path to avoid conflicts
public class SimpleTestController {

    @GetMapping
    public String testEndpoint() {
        return "Test endpoint is working!";
    }
}










