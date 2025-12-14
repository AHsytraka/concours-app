package com.example.Inscription.model;

import jakarta.persistence.*;

@Entity
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @ManyToOne
    @JoinColumn(name = "inscription_id")   // clé étrangère
    private Inscription inscription;
    @Column
    private String nom_fic;
    @Column
    private Boolean verifie;
    @Column
    private byte[] fichier;
    @Column
    private Boolean valide;
    
    // Type de document (releve_de_note, diplome, piece_identite, bordereau_paiement, etc.)
    @Column
    private String typeDocument;
    
    // Données extraites par l'IA (stockées en JSON)
    @Column(columnDefinition = "TEXT")
    private String donneesExtraites;
    
    // Score de confiance de l'extraction (0.0 à 1.0)
    @Column
    private Double scoreConfiance;

    public Document() {
    }

    public Document(int id) {
        this.id = id;
    }

    public Document(Inscription inscription, String nom_fic, Boolean verifie, byte[] fichier, Boolean valide) {
        this.inscription = inscription;
        this.nom_fic = nom_fic;
        this.verifie = verifie;
        this.fichier = fichier;
        this.valide = valide;
    }

    public Document(int id, Inscription inscription, String nom_fic, Boolean verifie, byte[] fichier, Boolean valide) {
        this.id = id;
        this.inscription = inscription;
        this.nom_fic = nom_fic;
        this.verifie = verifie;
        this.fichier = fichier;
        this.valide = valide;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Inscription getInscription() {
        return inscription;
    }

    public void setInscription(Inscription inscription) {
        this.inscription = inscription;
    }

    public String getNom_fic() {
        return nom_fic;
    }

    public void setNom_fic(String nom_fic) {
        this.nom_fic = nom_fic;
    }

    public Boolean getVerifie() {
        return verifie;
    }

    public void setVerifie(Boolean verifie) {
        this.verifie = verifie;
    }

    public byte[] getFichier() {
        return fichier;
    }

    public void setFichier(byte[] fichier) {
        this.fichier = fichier;
    }

    public Boolean getValide() {
        return valide;
    }

    public void setValide(Boolean valide) {
        this.valide = valide;
    }

    public String getTypeDocument() {
        return typeDocument;
    }

    public void setTypeDocument(String typeDocument) {
        this.typeDocument = typeDocument;
    }

    public String getDonneesExtraites() {
        return donneesExtraites;
    }

    public void setDonneesExtraites(String donneesExtraites) {
        this.donneesExtraites = donneesExtraites;
    }

    public Double getScoreConfiance() {
        return scoreConfiance;
    }

    public void setScoreConfiance(Double scoreConfiance) {
        this.scoreConfiance = scoreConfiance;
    }
}
