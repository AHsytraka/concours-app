package com.example.Inscription.controller;

import com.example.Inscription.service.GeminiService;
import com.google.genai.types.GenerateContentResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gemini/api")
@Tag(name = "Gemini AI", description = "AI-powered content generation and analysis")
public class GeminiController {
    @Autowired
    public GeminiService geminiService;

    @GetMapping("/ask")
    @Operation(summary = "Ask Gemini AI", description = "Sends a prompt to Google Gemini AI and returns the generated response (requires GOOGLE_API_KEY)")
    @ApiResponse(responseCode = "200", description = "Response generated successfully")
    public String askGeminiAPI(@RequestBody String prompt) {
        return geminiService.askGemini(prompt);
    }
}
