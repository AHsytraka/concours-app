package com.example.Inscription.controller;

import com.example.Inscription.model.Document;
import com.example.Inscription.model.Inscription;
import com.example.Inscription.service.DocumentService;
import com.example.Inscription.service.InscriptionService;
import com.example.Inscription.service.PdfService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/document")
@Tag(name = "Document", description = "Manage documents and file uploads")
public class DocumentController {
    @Autowired
    private DocumentService documentService;

    @Autowired
    private InscriptionService inscriptionService;

    @Autowired
    private PdfService pdfService;

    @PostMapping("/add")
    @Operation(summary = "Upload a document", description = "Uploads a document file for an inscription")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Document uploaded successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid file or inscription ID")
    })
    public String add(
            @RequestParam("inscriptionId") int inscriptionId,
            @RequestParam("nom_fic") String nomFic,
            @RequestParam("verifie") Boolean verifie,
            @RequestParam("fichier") MultipartFile fichier,
            @RequestParam("valide") Boolean valide
    ) throws IOException {

        Document document = new Document();

        Inscription ins = inscriptionService.findById(inscriptionId)
                .orElseThrow(() -> new RuntimeException("Inscription not found with id " + inscriptionId));
        document.setInscription(ins);
        document.setNom_fic(nomFic);
        document.setVerifie(verifie);
        document.setFichier(fichier.getBytes());
        document.setValide(valide);

        documentService.addDocument(document);

        return "Document added";
    }

    @GetMapping("/")
    public List<Document> getDocuments(){
        return documentService.getAllDocuments();
    }
    @GetMapping("/{id}")
    public Optional<Document> getDocumentById(@PathVariable int id){
        return documentService.getDocumentById(id);
    }
    @GetMapping("/text")
    public String getText() throws IOException {
        /*Document doc = (Document) documentService.nonVerifies().get(0);
        byte[] pdfBytes = doc.getFichier();
        String fileText = pdfService.extractTextFromPDF(pdfBytes);
        return fileText;*/
        byte[] pdfBytes = Files.readAllBytes(Paths.get("D:\\Utilisateurs\\Koloina\\Projets\\InscriptionService\\documents\\bordereau\\BFV1.pdf"));
        String text = pdfService.extractTextFromPDF(pdfBytes);
        System.out.println("Texte extrait : " + text);
        return text;
    }
    @GetMapping("/textOCR")
    public String getTextFromOCR() throws Exception {
        /*Document doc = (Document) documentService.nonVerifies().get(0);
        byte[] pdfBytes = doc.getFichier();
        String fileText = pdfService.extractTextFromPDF(pdfBytes);
        return fileText;*/
        byte[] pdfBytes = Files.readAllBytes(Paths.get("D:\\Utilisateurs\\Koloina\\Projets\\InscriptionService\\documents\\bordereau\\BFV1.pdf"));
        String text = pdfService.extractTextWithOCR(pdfBytes);
        System.out.println("Texte extrait : " + text);
        return text;
    }

    @DeleteMapping("/delete/{id}")
    public String deleteDocumentById(@PathVariable int id){
        documentService.deleteDocument(id);
        return "Document deleted";
    }

    @PutMapping(value = "/modify", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String updateDocument(
            @RequestParam("id") int id,
            @RequestParam("inscription_id") int inscriptionId,
            @RequestParam("nom_fic") String nomFic,
            @RequestParam("verifie") Boolean verifie,
            @RequestParam(value = "fichier", required = false) MultipartFile fichier,
            @RequestParam("valide") Boolean valide
    ) throws IOException {

        Document document = new Document();
        document.setId(id);

        Inscription ins = inscriptionService.findById(inscriptionId)
                .orElseThrow(() -> new RuntimeException("Inscription not found with id " + inscriptionId));
        document.setInscription(ins);

        document.setNom_fic(nomFic);
        document.setVerifie(verifie);

        if (fichier != null && !fichier.isEmpty()) {
            document.setFichier(fichier.getBytes());
        }

        document.setValide(valide);

        documentService.updateDocument(document);
        return "Document updated";
    }

    @PostMapping("/validation/{id}/{valide}")
    public String validateDocument(@PathVariable int id, @PathVariable Boolean valide){
        documentService.updateValidation(id, valide);
        return "Document validation updated";
    }

    @PostMapping("/verification/{id}/{verifie}")
    public String verifeDocument(@PathVariable int id, @PathVariable Boolean verifie){
        documentService.updateVerifie(id, verifie);
        return "Document verification updated";
    }
}
