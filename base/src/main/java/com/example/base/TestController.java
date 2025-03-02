package com.example.base;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class TestController {

    @GetMapping("/test")
    public String testEndpoint(Model model) {
        model.addAttribute("message", "TasteTiers is Live!");
        return "index"; // Looks for index.html in templates/
    }
}












