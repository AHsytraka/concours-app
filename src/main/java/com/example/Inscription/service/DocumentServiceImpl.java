package com.example.Inscription.service;

import com.example.Inscription.model.Document;
import com.example.Inscription.repository.DocumentRepository;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.pdf.config.PdfDocumentReaderConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class DocumentServiceImpl implements DocumentService {
    @Autowired
    private DocumentRepository documentRepository;
    @Override
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    @Override
    public Document addDocument(Document document) {
        return documentRepository.save(document);
    }

    @Override
    public Optional<Document> getDocumentById(int id) {
        return documentRepository.findById(id);
    }

    @Override
    public void deleteDocument(int id) {
        documentRepository.deleteById(id);
    }

    @Override
    public void updateDocument(Document document) {
        documentRepository.save(document);
    }

    @Override
    public void updateValidation(int inscription_id, Boolean valide) {
        documentRepository.updateValide(inscription_id, valide);
    }

    @Override
    public void updateVerifie(int inscription_id, Boolean verifie) {
        documentRepository.updateVerifie(inscription_id, verifie);
    }

    @Override
    public String lirePdf(String url){
        return "test";
    }

    @Override
    public List<Document> nonVerifies() {
        return documentRepository.findByValideFalse();
    }
}
