package com.example.Inscription.service;

import com.example.Inscription.model.BordereauData;
import com.example.Inscription.model.Document;
import com.example.Inscription.model.Inscription;
import com.example.Inscription.repository.DocumentRepository;
import com.google.genai.types.GenerateContentResponse;
import org.apache.commons.text.similarity.LevenshteinDistance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.apache.pdfbox.pdmodel.PDDocument;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.text.PDFTextStripper;
import java.io.File;
import java.nio.file.Files;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;

import java.io.DataInput;
import java.io.IOException;
import java.util.List;

@Service
public class PdfService {

    @Autowired
    private DocumentService documentService;

    @Autowired
    @Nullable
    private GeminiService geminiService;

    public BordereauData extraireBordereau() throws Exception {

        Document doc = documentService.nonVerifies().get(0);
        byte[] pdfBytes = doc.getFichier();

        // Extraction texte normale
        String fileText = extractTextFromPDF(pdfBytes);

        // Si PDFBox trouve rien → OCR
        if (fileText.trim().isEmpty()) {
            System.out.println("PDF vide -> utilisation de l'OCR...");
            fileText = extractTextWithOCR(pdfBytes);
        }

        System.out.println("Texte extrait final : " + fileText);

        // Prompt Gemini
        String prompt ="Analyse le texte ci-dessous et retourne uniquement un objet JSON strict, sans explication, sans mise en forme, sans texte avant ou après, sans blocs de code. \n" +
                "Le JSON doit contenir : montant, remettant, compte.\n" +
                "\n" +
                "Format EXACT attendu :\n" +
                "{\"montant\": \"...\", \"remettant\": \"...\", \"compte\": \"...\"}\n" +
                "\n" +
                "et n'ajoute JAMAIS une introduction ou ``` ou ```json ou autre de ce forme dans ta réponse."+
                "Texte à analyser :\n" + fileText;
        String response = geminiService.askGemini(prompt);

        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(response, BordereauData.class);
    }


    public String extractTextFromPDF(byte[] pdfBytes) throws IOException {
        try (PDDocument document = PDDocument.load(pdfBytes)) {
            PDFTextStripper pdfStripper = new PDFTextStripper();
            return pdfStripper.getText(document);
        }
    }
    public String extractTextWithOCR(byte[] pdfBytes) throws Exception {
        // Sauvegarder temporairement le PDF
        File tempPdf = File.createTempFile("ocr_input", ".pdf");
        Files.write(tempPdf.toPath(), pdfBytes);

        // OCR
        Tesseract tesseract = new Tesseract();
        tesseract.setDatapath("src/main/resources/tessdata");
        tesseract.setLanguage("fra+eng");

        String ocrText = tesseract.doOCR(tempPdf);
        tempPdf.delete(); // nettoyage
        System.out.println(ocrText);

        return ocrText;
    }
    private boolean fuzzyMatch(String a, String b, int maxDistance) {
        a = a.toLowerCase().trim();
        b = b.toLowerCase().trim();

        int[][] dp = new int[a.length() + 1][b.length() + 1];

        for (int i = 0; i <= a.length(); i++) dp[i][0] = i;
        for (int i = 0; i <= b.length(); i++) dp[0][i] = i;

        for (int i = 1; i <= a.length(); i++) {
            for (int j = 1; j <= b.length(); j++) {
                int cost = (a.charAt(i - 1) == b.charAt(j - 1)) ? 0 : 1;
                dp[i][j] = Math.min(
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + cost
                );
            }
        }

        return dp[a.length()][b.length()] <= maxDistance;
    }

    public void verifierTousLesBordereaux() throws Exception {
        List<Document> documents = documentService.nonVerifies();
        LevenshteinDistance ld = new LevenshteinDistance();

        for (Document doc : documents) {
            Inscription ins = doc.getInscription();
            byte[] pdfBytes = doc.getFichier();

            // Extraction texte
            String fileText = extractTextFromPDF(pdfBytes);
            if (fileText.trim().isEmpty()) {
                fileText = extractTextWithOCR(pdfBytes);
            }

            // Appel Gemini pour extraire JSON
            String prompt = "Analyse le texte ci-dessous et retourne uniquement un objet JSON strict, sans explication, sans mise en forme, sans texte avant ou après, sans blocs de code. \n" +
                    "Le JSON doit contenir : montant, remettant, compte.\n" +
                    "\n" +
                    "Format EXACT attendu :\n" +
                    "{\"montant\": \"...\", \"remettant\": \"...\", \"compte\": \"...\"}\n" +
                    "\n" +
                    "et n'ajoute JAMAIS une introduction ou ``` ou ```json ou autre de ce forme dans ta réponse."+
                    "Texte à analyser :\n" + fileText;
            String response = geminiService.askGemini(prompt);

            ObjectMapper mapper = new ObjectMapper();
            BordereauData bd = mapper.readValue(response, BordereauData.class);

            // -------------------
            // Vérification remettant
            // -------------------
            String nomComplet = (ins.getNom() + " " + ins.getPrenom()).toLowerCase().trim();
            String remettant = bd.getRemettant().toLowerCase().trim();
            int matchCount = 0;
            for (String part : nomComplet.split(" ")) {
                if (remettant.contains(part)) {
                    matchCount++;
                }
            }
            // on valide si au moins 2 parties du nom complet sont présentes
            boolean remettantOk = matchCount >= 2;

            // -------------------
            // Vérification montant
            // -------------------
            double montantBordereau = parseMontant(bd.getMontant());
            boolean montantOk = true;
            if (ins.isMaster()) {
                montantOk = montantBordereau == 682500.0 || montantBordereau == 341250.0;
            } else if (ins.getLicence() != null && ins.getLicence()) {
                montantOk = montantBordereau == 350000.0 || montantBordereau == 175000.0;
            }

            // -------------------
            // Vérification compte
            // -------------------
            String compteRef = "21000135638-01";
            boolean compteOk = ld.apply(compteRef, bd.getCompte()) <= 2; // tolérance 2 caractères

            // -------------------
            // Debug
            // -------------------
            System.out.println("Document ID: " + doc.getId());
            System.out.println("Montant: " + bd.getMontant() + " -> " + montantBordereau + ", montantOk=" + montantOk);
            System.out.println("Remettant: " + bd.getRemettant() + ", matchCount=" + matchCount + ", remettantOk=" + remettantOk);
            System.out.println("Compte: " + bd.getCompte() + ", compteOk=" + compteOk);
            System.out.println("isMaster=" + ins.isMaster());

            // -------------------
            // Validation finale
            // -------------------
            doc.setValide(remettantOk && montantOk && compteOk);
            doc.setVerifie(true);
            documentService.updateDocument(doc);

            System.out.println("Document validé: " + doc.getValide());
            System.out.println("--------------------------------------------------");
        }
    }




    private double parseMontant(String montant) {
        if (montant == null) return 0;

        montant = montant.replace("MGA","")
                .replace(" ", "")
                .replace(".", "")
                .replace(",", ".");

        try {
            return Double.parseDouble(montant.trim());
        } catch (Exception e) {
            return 0;
        }
    }


}
