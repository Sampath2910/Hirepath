package com.hirepath.ai.controller;

import com.hirepath.ai.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "${cors.allowed-origins:http://localhost:3000}")
public class AIController {

    @Autowired
    private AIService aiService;

    @PostMapping("/chat")
    public ResponseEntity<String> chat(@RequestBody Map<String, Object> request) {
        String message = (String) request.get("message");
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body("Message cannot be empty.");
        }

        String context = "You are HirePath AI, a professional career coach for Indian tech students. " +
                "Help them with resumes, interview tips, and job searching. Be encouraging and concise. " +
                "Focus on the Indian job market including companies like Infosys, TCS, Wipro, Razorpay, Swiggy, etc.";

        // Use the dedicated chatbotResponse() method (not generateCoverLetter)
        String response = aiService.chatbotResponse(message, context);
        return ResponseEntity.ok(response);
    }
}
