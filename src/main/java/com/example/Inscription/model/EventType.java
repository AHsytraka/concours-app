package com.example.Inscription.model;

public enum EventType {
    CONTEST("Concours"),
    SELECTION("Sélection de dossier");
    
    private final String displayName;
    
    EventType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
