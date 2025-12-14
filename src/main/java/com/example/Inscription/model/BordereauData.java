package com.example.Inscription.model;

public class BordereauData {
    private String montant;
    private String remettant;
    private String compte;

    public BordereauData() {
    }

    public BordereauData(String montant, String remettant, String compte) {
        this.montant = montant;
        this.remettant = remettant;
        this.compte = compte;
    }

    public String getMontant() {
        return montant;
    }

    public void setMontant(String montant) {
        this.montant = montant;
    }

    public String getRemettant() {
        return remettant;
    }

    public void setRemettant(String remettant) {
        this.remettant = remettant;
    }

    public String getCompte() {
        return compte;
    }

    public void setCompte(String compte) {
        this.compte = compte;
    }
}
