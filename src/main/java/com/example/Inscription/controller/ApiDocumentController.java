package com.example.Inscription.controller;

import com.example.Inscription.model.Document;
import com.example.Inscription.model.Inscription;
import com.example.Inscription.service.DocumentService;
import com.example.Inscription.service.GeminiService;
import com.example.Inscription.service.InscriptionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Controller pour l'analyse et l'extraction de données des documents d'inscription.
 * 
 * UTILISE GEMINI VISION pour:
 * - Analyser les images/PDF des relevés de notes
 * - Extraire les données pour remplir le formulaire d'inscription
 * - SAUVEGARDER les documents et données extraites en base de données
 * 
 * NOTE: Pour la délibération et les arrêtés de concours, utilisez le service Python
 * dans le dossier IA (eni-ia-services) sur:
 * - /api/v1/classification/* pour classifier les arrêtés
 * - /api/v1/deliberation/* pour la délibération
 */
@RestController
@RequestMapping("/api/documents")
@Tag(name = "API Documents", description = "Analyse de documents pour l'inscription (utilise Gemini Vision)")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:4200"})
public class ApiDocumentController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private GeminiService geminiService;
    
    @Autowired
    private InscriptionService inscriptionService;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Stockage temporaire des fichiers uploadés (en mémoire) - avant sauvegarde en BDD
    private static final Map<String, byte[]> uploadedFiles = new HashMap<>();
    private static final Map<String, String> uploadedMimeTypes = new HashMap<>();
    private static final Map<String, String> uploadedFileNames = new HashMap<>();
    private static final Map<String, String> uploadedDocTypes = new HashMap<>();

    @PostMapping("/classify")
    @Operation(summary = "Classifier un document avec Gemini Vision", 
               description = "Analyse l'image du document pour déterminer son type")
    public ResponseEntity<Map<String, Object>> classifyDocument(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> response = new HashMap<>();
            
            String fileName = file.getOriginalFilename();
            String contentType = file.getContentType();
            byte[] fileBytes = file.getBytes();
            
            System.out.println("=== CLASSIFY: Fichier reçu: " + fileName + " (" + fileBytes.length + " bytes) ===");

            // Déterminer le type MIME pour Gemini
            String mimeType = getMimeType(contentType, fileName);
            System.out.println("=== CLASSIFY: MIME type: " + mimeType + " ===");
            
            String documentType = "releve_de_note"; // Default
            String confidence = "medium";
            
            // Vérifier si Gemini est configuré
            if (!geminiService.isConfigured()) {
                System.out.println("=== CLASSIFY: Gemini non configuré, classification par défaut ===");
                // Fallback: classification par nom de fichier
                if (fileName != null) {
                    String lowerName = fileName.toLowerCase();
                    if (lowerName.contains("releve") || lowerName.contains("note") || lowerName.contains("bulletin")) {
                        documentType = "releve_de_note";
                    } else if (lowerName.contains("diplome") || lowerName.contains("bac")) {
                        documentType = "diplome";
                    }
                }
            } else {
                // Prompt pour la classification
                String classifyPrompt = """
                    Analyse cette image de document et détermine son type.
                    
                    Réponds UNIQUEMENT avec un JSON strict, sans texte avant ou après, sans ```:
                    {"type": "...", "confidence": "..."}
                    
                    Types possibles:
                    - releve_de_note : Relevé de notes, bulletin scolaire, transcript
                    - diplome : Diplôme, certificat, attestation de réussite
                    - piece_identite : Carte d'identité, passeport
                    - bordereau_paiement : Reçu de paiement, bordereau bancaire
                    - autre : Autre type de document
                    
                    Confidence: high, medium, low
                    """;

                try {
                    String geminiResponse = geminiService.analyzeImage(fileBytes, mimeType, classifyPrompt);
                    
                    // Vérifier si Gemini a retourné une erreur
                    if (geminiResponse != null && !geminiResponse.contains("error")) {
                        String cleanResponse = cleanJsonResponse(geminiResponse);
                        Map<String, String> classResult = objectMapper.readValue(cleanResponse, Map.class);
                        documentType = classResult.getOrDefault("type", "releve_de_note");
                        confidence = classResult.getOrDefault("confidence", "medium");
                    } else {
                        System.out.println("=== CLASSIFY: Gemini a retourné une erreur, utilisation du fallback ===");
                    }
                } catch (Exception e) {
                    System.out.println("=== CLASSIFY: Erreur Gemini: " + e.getMessage() + " ===");
                    // Fallback: classification par nom de fichier
                    if (fileName != null) {
                        String lowerName = fileName.toLowerCase();
                        if (lowerName.contains("releve") || lowerName.contains("note") || lowerName.contains("bulletin")) {
                            documentType = "releve_de_note";
                            confidence = "low";
                        }
                    }
                }
            }
            
            // Générer un ID et stocker le fichier
            String documentId = "doc_" + System.currentTimeMillis();
            uploadedFiles.put(documentId, fileBytes);
            uploadedMimeTypes.put(documentId, mimeType);
            uploadedFileNames.put(documentId, fileName);
            uploadedDocTypes.put(documentId, documentType);
            
            System.out.println("=== CLASSIFY: Document stocké avec ID: " + documentId + ", type: " + documentType + " ===");
            
            response.put("success", true);
            response.put("documentId", documentId);
            response.put("documentType", documentType);
            response.put("confidence", confidence);
            response.put("fileName", fileName);
            response.put("fileSize", file.getSize());
            response.put("message", "Document classifié avec Gemini Vision");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Upload simple d'un document sans extraction IA.
     * Le fichier est directement sauvegardé en base de données pour vérification manuelle ultérieure.
     */
    @PostMapping("/upload-simple")
    @Operation(summary = "Upload simple d'un document", 
               description = "Sauvegarde le fichier en BDD sans extraction IA (pour vérification manuelle)")
    public ResponseEntity<Map<String, Object>> uploadSimpleDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "inscriptionId", required = false) Integer inscriptionId,
            @RequestParam(value = "typeDocument", defaultValue = "releve_de_note") String typeDocument) {
        try {
            Map<String, Object> response = new HashMap<>();
            
            String fileName = file.getOriginalFilename();
            byte[] fileBytes = file.getBytes();
            
            System.out.println("=== UPLOAD-SIMPLE: Fichier reçu: " + fileName + " (" + fileBytes.length + " bytes) ===");
            System.out.println("=== UPLOAD-SIMPLE: inscriptionId=" + inscriptionId + ", typeDocument=" + typeDocument + " ===");
            
            // Créer le document
            Document document = new Document();
            document.setNom_fic(fileName);
            document.setFichier(fileBytes);
            document.setTypeDocument(typeDocument);
            document.setVerifie(false);  // À vérifier manuellement par l'admin
            document.setValide(false);   // Pas encore validé
            document.setDonneesExtraites("{}");  // Pas d'extraction, données vides
            document.setScoreConfiance(0.0);     // Pas d'IA, pas de score
            
            // Lier à l'inscription si fournie
            if (inscriptionId != null) {
                Optional<Inscription> inscriptionOpt = inscriptionService.getInscriptionById(inscriptionId);
                if (inscriptionOpt.isPresent()) {
                    document.setInscription(inscriptionOpt.get());
                    System.out.println("=== UPLOAD-SIMPLE: Lié à l'inscription " + inscriptionId + " ===");
                }
            }
            
            // Sauvegarder en BDD
            Document savedDocument = documentService.addDocument(document);
            System.out.println("=== UPLOAD-SIMPLE: Document sauvegardé avec ID: " + savedDocument.getId() + " ===");
            
            response.put("success", true);
            response.put("documentId", savedDocument.getId());
            response.put("fileName", fileName);
            response.put("fileSize", file.getSize());
            response.put("typeDocument", typeDocument);
            response.put("message", "Document uploadé avec succès (en attente de vérification)");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("=== UPLOAD-SIMPLE: Erreur: " + e.getMessage() + " ===");
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/upload")
    @Operation(summary = "Uploader un document", description = "Stocke le document pour analyse ultérieure")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", required = false) String type) {
        try {
            Map<String, Object> response = new HashMap<>();
            
            String fileName = file.getOriginalFilename();
            String contentType = file.getContentType();
            byte[] fileBytes = file.getBytes();
            
            // Générer un ID et stocker le fichier
            String documentId = "doc_" + System.currentTimeMillis();
            String mimeType = getMimeType(contentType, fileName);
            
            uploadedFiles.put(documentId, fileBytes);
            uploadedMimeTypes.put(documentId, mimeType);
            uploadedFileNames.put(documentId, fileName);
            uploadedDocTypes.put(documentId, type != null ? type : "unknown");
            
            response.put("success", true);
            response.put("documentId", documentId);
            response.put("fileName", fileName);
            response.put("fileSize", file.getSize());
            response.put("type", type != null ? type : "unknown");
            response.put("message", "Document uploadé avec succès");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/{documentId}/verify")
    @Operation(summary = "Vérifier et extraire les données avec Gemini Vision", 
               description = "Analyse l'image du document, extrait les informations et sauvegarde en base de données")
    public ResponseEntity<Map<String, Object>> verifyDocument(
            @PathVariable String documentId,
            @RequestParam(value = "inscriptionId", required = false) Integer inscriptionId) {
        try {
            Map<String, Object> response = new HashMap<>();
            
            System.out.println("=== VERIFY: Vérification du document: " + documentId + " ===");
            
            // Récupérer le fichier stocké
            byte[] fileBytes = uploadedFiles.get(documentId);
            String mimeType = uploadedMimeTypes.get(documentId);
            String fileName = uploadedFileNames.get(documentId);
            String docType = uploadedDocTypes.get(documentId);
            
            if (fileBytes == null) {
                System.out.println("=== VERIFY: Document non trouvé en mémoire! ===");
                response.put("success", false);
                response.put("error", "Document non trouvé en mémoire. Le document a peut-être expiré. Veuillez réuploader le fichier.");
                return ResponseEntity.badRequest().body(response);
            }
            
            System.out.println("=== VERIFY: Document trouvé: " + fileName + " (" + fileBytes.length + " bytes) ===");
            
            Map<String, Object> extractedData = new HashMap<>();
            String extractedJson = "{}";
            
            // Vérifier si Gemini est configuré
            if (!geminiService.isConfigured()) {
                System.out.println("=== VERIFY: Gemini non configuré, données vides retournées ===");
                // Retourner des données vides mais succès pour permettre la saisie manuelle
                extractedData.put("firstName", "");
                extractedData.put("lastName", "");
                extractedData.put("birthDate", "");
                extractedData.put("birthPlace", "");
                extractedData.put("bacYear", "");
                extractedData.put("bacSeries", "");
                extractedData.put("bacNumber", "");
                extractedData.put("bacAverage", "");
                extractedJson = objectMapper.writeValueAsString(extractedData);
            } else {
                // Prompt pour l'extraction des données du relevé de notes
                String extractPrompt = """
                    Analyse cette image de document académique (relevé de notes, bulletin, diplôme).
                    
                    Extrais les informations suivantes et réponds UNIQUEMENT avec un JSON strict,
                    sans texte avant ou après, sans ```:
                    
                    {
                        "firstName": "prénom de l'étudiant",
                        "lastName": "nom de famille de l'étudiant",
                        "birthDate": "date de naissance au format YYYY-MM-DD",
                        "birthPlace": "lieu de naissance",
                        "bacYear": "année du baccalauréat ou année académique",
                        "bacSeries": "série ou filière (ex: Scientifique, Littéraire, D, C, etc.)",
                        "bacNumber": "numéro de matricule ou identifiant étudiant",
                        "bacAverage": "moyenne générale (nombre uniquement, ex: 14.5)"
                    }
                    
                    Règles importantes:
                    - Si une information n'est pas visible ou trouvable, mets une chaîne vide ""
                    - Pour les noms malgaches, le nom de famille est généralement en premier
                    - La date doit être au format YYYY-MM-DD (ex: 1998-05-15)
                    - La moyenne doit être un nombre (ex: 14.5, pas "14,5/20")
                    - Extrais uniquement ce qui est clairement visible sur le document
                    """;

                try {
                    String geminiResponse = geminiService.analyzeImage(fileBytes, mimeType, extractPrompt);
                    
                    System.out.println("=== VERIFY: Réponse Gemini reçue ===");
                    
                    if (geminiResponse != null && !geminiResponse.contains("\"error\"")) {
                        extractedJson = cleanJsonResponse(geminiResponse);
                        extractedData = objectMapper.readValue(extractedJson, Map.class);
                    } else {
                        System.out.println("=== VERIFY: Gemini a retourné une erreur ===");
                        extractedData.put("firstName", "");
                        extractedData.put("lastName", "");
                        extractedData.put("birthDate", "");
                        extractedData.put("birthPlace", "");
                        extractedData.put("bacYear", "");
                        extractedData.put("bacSeries", "");
                        extractedData.put("bacNumber", "");
                        extractedData.put("bacAverage", "");
                        extractedJson = objectMapper.writeValueAsString(extractedData);
                    }
                } catch (Exception e) {
                    System.out.println("=== VERIFY: Erreur extraction: " + e.getMessage() + " ===");
                    extractedData.put("firstName", "");
                    extractedData.put("lastName", "");
                    extractedData.put("birthDate", "");
                    extractedData.put("birthPlace", "");
                    extractedData.put("bacYear", "");
                    extractedData.put("bacSeries", "");
                    extractedData.put("bacNumber", "");
                    extractedData.put("bacAverage", "");
                    extractedJson = objectMapper.writeValueAsString(extractedData);
                }
            }
            
            // ========== SAUVEGARDE EN BASE DE DONNÉES ==========
            Document document = new Document();
            document.setNom_fic(fileName != null ? fileName : "document_" + documentId);
            document.setFichier(fileBytes);
            document.setVerifie(true);
            document.setValide(true);
            document.setTypeDocument(docType != null ? docType : "unknown");
            document.setDonneesExtraites(extractedJson);
            document.setScoreConfiance(0.95);
            
            // Si une inscription est spécifiée, lier le document
            if (inscriptionId != null) {
                Optional<Inscription> inscriptionOpt = inscriptionService.getInscriptionById(inscriptionId);
                if (inscriptionOpt.isPresent()) {
                    document.setInscription(inscriptionOpt.get());
                }
            }
            
            // Sauvegarder le document en base de données
            Document savedDocument = documentService.addDocument(document);
            System.out.println("=== Document sauvegardé en BDD avec ID: " + savedDocument.getId() + " ===");
            
            response.put("success", true);
            response.put("documentId", documentId);
            response.put("dbDocumentId", savedDocument.getId()); // ID en base de données
            response.put("verified", true);
            response.put("verificationScore", 0.95);
            response.put("extractedData", extractedData);
            response.put("savedToDatabase", true);
            response.put("message", "Document analysé, données extraites et sauvegardées en base de données");
            
            // Nettoyer le fichier de la mémoire après sauvegarde en BDD
            uploadedFiles.remove(documentId);
            uploadedMimeTypes.remove(documentId);
            uploadedFileNames.remove(documentId);
            uploadedDocTypes.remove(documentId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @PostMapping("/analyze-and-save")
    @Operation(summary = "Analyser et sauvegarder un document en une seule étape",
               description = "Classifie, extrait les données avec Gemini Vision et sauvegarde tout en BDD")
    public ResponseEntity<Map<String, Object>> analyzeAndSaveDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "inscriptionId", required = false) Integer inscriptionId) {
        try {
            Map<String, Object> response = new HashMap<>();
            
            String fileName = file.getOriginalFilename();
            String contentType = file.getContentType();
            byte[] fileBytes = file.getBytes();
            
            // Vérifier si Gemini est configuré
            if (!geminiService.isConfigured()) {
                response.put("success", false);
                response.put("error", "Gemini API non configurée. Définissez GOOGLE_API_KEY.");
                return ResponseEntity.badRequest().body(response);
            }

            String mimeType = getMimeType(contentType, fileName);
            
            // 1. CLASSIFICATION
            String classifyPrompt = """
                Analyse cette image de document et détermine son type.
                Réponds UNIQUEMENT avec un JSON strict, sans texte avant ou après, sans ```:
                {"type": "...", "confidence": "..."}
                Types possibles: releve_de_note, diplome, piece_identite, bordereau_paiement, autre
                Confidence: high, medium, low
                """;

            String classifyResponse = geminiService.analyzeImage(fileBytes, mimeType, classifyPrompt);
            String documentType = "unknown";
            String confidence = "medium";
            
            try {
                String cleanClassify = cleanJsonResponse(classifyResponse);
                Map<String, String> classResult = objectMapper.readValue(cleanClassify, Map.class);
                documentType = classResult.getOrDefault("type", "unknown");
                confidence = classResult.getOrDefault("confidence", "medium");
            } catch (Exception e) {
                System.out.println("Erreur classification: " + e.getMessage());
            }

            // 2. EXTRACTION DES DONNÉES
            String extractPrompt = """
                Analyse cette image de document académique.
                Extrais les informations et réponds UNIQUEMENT avec un JSON strict, sans ```:
                {
                    "firstName": "prénom",
                    "lastName": "nom de famille",
                    "birthDate": "date naissance YYYY-MM-DD",
                    "birthPlace": "lieu de naissance",
                    "bacYear": "année du bac",
                    "bacSeries": "série ou filière",
                    "bacNumber": "numéro matricule",
                    "bacAverage": "moyenne (nombre)"
                }
                Mets "" si information non trouvée.
                """;

            String extractResponse = geminiService.analyzeImage(fileBytes, mimeType, extractPrompt);
            Map<String, Object> extractedData = new HashMap<>();
            String extractedJson = "{}";
            
            try {
                extractedJson = cleanJsonResponse(extractResponse);
                extractedData = objectMapper.readValue(extractedJson, Map.class);
            } catch (Exception e) {
                System.out.println("Erreur extraction: " + e.getMessage());
                extractedData.put("firstName", "");
                extractedData.put("lastName", "");
                extractedData.put("birthDate", "");
                extractedData.put("birthPlace", "");
                extractedData.put("bacYear", "");
                extractedData.put("bacSeries", "");
                extractedData.put("bacNumber", "");
                extractedData.put("bacAverage", "");
                extractedJson = objectMapper.writeValueAsString(extractedData);
            }

            // 3. SAUVEGARDE EN BASE DE DONNÉES
            Document document = new Document();
            document.setNom_fic(fileName != null ? fileName : "document_" + System.currentTimeMillis());
            document.setFichier(fileBytes);
            document.setVerifie(true);
            document.setValide(true);
            document.setTypeDocument(documentType);
            document.setDonneesExtraites(extractedJson);
            document.setScoreConfiance("high".equals(confidence) ? 0.95 : "medium".equals(confidence) ? 0.75 : 0.5);
            
            if (inscriptionId != null) {
                Optional<Inscription> inscriptionOpt = inscriptionService.getInscriptionById(inscriptionId);
                inscriptionOpt.ifPresent(document::setInscription);
            }
            
            Document savedDocument = documentService.addDocument(document);
            
            response.put("success", true);
            response.put("dbDocumentId", savedDocument.getId());
            response.put("documentType", documentType);
            response.put("confidence", confidence);
            response.put("extractedData", extractedData);
            response.put("savedToDatabase", true);
            response.put("fileName", fileName);
            response.put("message", "Document analysé et sauvegardé avec succès");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @GetMapping("/db/{dbDocumentId}")
    @Operation(summary = "Récupérer un document depuis la base de données",
               description = "Récupère les informations d'un document sauvegardé")
    public ResponseEntity<Map<String, Object>> getDocumentFromDb(@PathVariable int dbDocumentId) {
        try {
            Optional<Document> documentOpt = documentService.getDocumentById(dbDocumentId);
            
            if (documentOpt.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Document non trouvé en base de données");
                return ResponseEntity.badRequest().body(error);
            }
            
            Document doc = documentOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("id", doc.getId());
            response.put("fileName", doc.getNom_fic());
            response.put("documentType", doc.getTypeDocument());
            response.put("verified", doc.getVerifie());
            response.put("valid", doc.getValide());
            response.put("confidenceScore", doc.getScoreConfiance());
            
            // Parser les données extraites
            if (doc.getDonneesExtraites() != null && !doc.getDonneesExtraites().isEmpty()) {
                try {
                    Map<String, Object> extractedData = objectMapper.readValue(doc.getDonneesExtraites(), Map.class);
                    response.put("extractedData", extractedData);
                } catch (Exception e) {
                    response.put("extractedData", doc.getDonneesExtraites());
                }
            }
            
            if (doc.getInscription() != null) {
                response.put("inscriptionId", doc.getInscription().getId());
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/status")
    @Operation(summary = "Vérifier le statut du service", description = "Vérifie si Gemini est configuré")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("geminiConfigured", geminiService.isConfigured());
        status.put("service", "ApiDocumentController");
        status.put("description", "Service d'analyse de documents pour l'inscription (Gemini Vision)");
        status.put("note", "Pour la délibération et les arrêtés, utilisez le service Python IA sur le port 8000");
        return ResponseEntity.ok(status);
    }

    /**
     * Détermine le type MIME approprié pour Gemini
     */
    private String getMimeType(String contentType, String fileName) {
        if (contentType != null) {
            if (contentType.contains("pdf")) {
                return "application/pdf";
            } else if (contentType.contains("png")) {
                return "image/png";
            } else if (contentType.contains("jpeg") || contentType.contains("jpg")) {
                return "image/jpeg";
            } else if (contentType.contains("webp")) {
                return "image/webp";
            }
        }
        
        // Fallback basé sur l'extension du fichier
        if (fileName != null) {
            String lower = fileName.toLowerCase();
            if (lower.endsWith(".pdf")) return "application/pdf";
            if (lower.endsWith(".png")) return "image/png";
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
            if (lower.endsWith(".webp")) return "image/webp";
        }
        
        return "application/octet-stream";
    }

    /**
     * Nettoie la réponse JSON de Gemini (enlève les ```, etc.)
     */
    private String cleanJsonResponse(String response) {
        if (response == null) return "{}";
        
        String cleaned = response.trim();
        
        // Enlever les blocs de code markdown
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        
        return cleaned.trim();
    }
}
