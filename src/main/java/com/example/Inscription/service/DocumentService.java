package com.example.Inscription.service;

import com.example.Inscription.model.Document;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface DocumentService {
    public List<Document> getAllDocuments();
    public Document addDocument(Document document);
    public Optional<Document> getDocumentById(int id);
    public void deleteDocument(int id);
    public void updateDocument(Document document);
    public void updateValidation(int inscription_id, Boolean valide);
    public void updateVerifie(int inscription_id, Boolean verifie);
    public String lirePdf(String url);
    public List<Document> nonVerifies();
}
