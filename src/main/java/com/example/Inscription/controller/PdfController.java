package com.example.Inscription.controller;

import com.example.Inscription.model.BordereauData;
import com.example.Inscription.service.PdfService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/pdf")
@CrossOrigin("*")
@Tag(name = "PDF Processing", description = "PDF extraction and OCR operations")
public class PdfController {
    @Autowired
    private PdfService pdfService;

    @GetMapping("/extract")
    @Operation(summary = "Extract bordereau data from PDF", description = "Extracts structured data from PDF documents using OCR and text extraction")
    @ApiResponse(responseCode = "200", description = "Data extracted successfully")
    public BordereauData extraireBordereau() throws Exception {
        return pdfService.extraireBordereau();
    }

    @GetMapping("/verificationAutomatique")
    @Operation(summary = "Verify all bordereaux", description = "Automatically verifies and processes all unverified bordereau documents")
    @ApiResponse(responseCode = "200", description = "Verification completed")
    public void verificationAuto() throws Exception {
        pdfService.verifierTousLesBordereaux();
    }
}
