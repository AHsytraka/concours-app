package com.example.Inscription.model;

public enum RegistrationStatus {
    PENDING("En attente"),
    UNDER_REVIEW("En cours d'examen"),
    FORM_INCOMPLETE("Fiche incomplète"),
    PAYMENT_PENDING("Paiement en attente"),
    PAYMENT_VERIFIED("Paiement vérifié"),
    APPROVED("Approuvée"),
    REJECTED("Rejetée"),
    CANCELLED("Annulée");
    
    private final String displayName;
    
    RegistrationStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
