package com.example.Inscription.service;

import com.google.genai.Client;
import com.google.genai.types.Blob;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
public class GeminiService {
    private final Client client;
    
    public GeminiService(@Nullable Client client){
        this.client = client;
    }

    /**
     * Envoie une requête texte à Gemini
     */
    public String askGemini(String prompt){
        if (client == null) {
            return "Gemini API not configured. Please set GOOGLE_API_KEY environment variable.";
        }

        GenerateContentResponse response =
                client.models.generateContent(
                        "gemini-2.5-flash",
                        prompt,
                        null);
        System.out.println("********DEBUT*********");
        System.out.println(response.text());
        System.out.println("********FIN*********");

        return response.text();
    }

    /**
     * Analyse une image (PDF converti ou image directe) avec Gemini Vision
     * @param imageBytes Les bytes de l'image
     * @param mimeType Le type MIME (image/png, image/jpeg, application/pdf)
     * @param prompt Le prompt d'analyse
     * @return La réponse de Gemini
     */
    public String analyzeImage(byte[] imageBytes, String mimeType, String prompt) {
        if (client == null) {
            return "{\"error\": \"Gemini API not configured. Please set GOOGLE_API_KEY environment variable.\"}";
        }

        try {
            // Créer le blob pour l'image
            Blob imageBlob = Blob.builder()
                .mimeType(mimeType)
                .data(imageBytes)
                .build();

            // Créer les parts: image + texte
            Part imagePart = Part.builder()
                .inlineData(imageBlob)
                .build();

            Part textPart = Part.builder()
                .text(prompt)
                .build();

            // Créer le contenu avec les deux parts
            List<Part> parts = new ArrayList<>();
            parts.add(imagePart);
            parts.add(textPart);

            Content content = Content.builder()
                .parts(parts)
                .build();

            // Appeler Gemini avec le contenu multimodal
            GenerateContentResponse response = client.models.generateContent(
                "gemini-1.5-flash",
                content,
                null
            );

            System.out.println("********GEMINI VISION DEBUT*********");
            System.out.println(response.text());
            System.out.println("********GEMINI VISION FIN*********");

            return response.text();
            
        } catch (Exception e) {
            System.out.println("Erreur Gemini Vision: " + e.getMessage());
            e.printStackTrace();
            return "{\"error\": \"" + e.getMessage().replace("\"", "'") + "\"}";
        }
    }

    /**
     * Vérifie si Gemini est configuré
     */
    public boolean isConfigured() {
        return client != null;
    }
}
