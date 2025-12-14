package com.example.Inscription.model;

public enum ResultStatus {
    PASSED("Réussi"),
    FAILED("Échoué"),
    PENDING_DELIBERATION("En attente de délibération"),
    PENDING("En attente"),
    WAITING_LIST("Liste d'attente");
    
    private final String displayName;
    
    ResultStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
