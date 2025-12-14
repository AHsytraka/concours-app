package com.example.Inscription.model;

public enum BacSeries {
    L("Littéraire"),
    OSE("OSE (Littéraire)"),
    A("A (Littéraire)"),
    A2("A2 (Littéraire)"),
    C("Scientifique"),
    D("Scientifique"),
    S("Scientifique"),
    TECHNICAL("Technique");
    
    private final String displayName;
    
    BacSeries(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public Boolean isLitteral() {
        return this == L || this == OSE || this == A || this == A2;
    }
    
    public Boolean isScientific() {
        return this == C || this == D || this == S;
    }
    
    public Boolean isTechnical() {
        return this == TECHNICAL;
    }
}
