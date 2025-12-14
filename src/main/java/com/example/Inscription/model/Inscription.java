package com.example.Inscription.model;
import jakarta.persistence.*;

import java.util.Date;

@Entity
public class Inscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column
    private int candidat_id;
    @Column
    private String nom;
    @Column
    private String prenom;
    @Column
    private String email;
    @Column
    private String statut; //valide ou invalide
    @Column(name = "date_visite",
            nullable = false,
            columnDefinition = "TIMESTAMP DEFAULT NOW()")
    private Date date_inscription;
    @Column
    private Boolean paiement_effectué;
    @Column
    private String Commentaire;
    @Column
    private Boolean admis;
    @Column(nullable = false)
    private Boolean licence = false;
    @Column(nullable = false)
    private Boolean master = false;

    public Inscription() {
    }

    public Inscription(int candidat_id) {
        this.candidat_id = candidat_id;
    }

    public Inscription(int candidat_id, String nom, String prenom, String email, String statut, Date date_inscription, Boolean paiement_effectué, String commentaire, Boolean admis, Boolean licence, Boolean master) {
        this.candidat_id = candidat_id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.statut = statut;
        this.date_inscription = date_inscription;
        this.paiement_effectué = paiement_effectué;
        Commentaire = commentaire;
        this.admis = admis;
        this.licence = licence;
        this.master = master;
    }

    public Inscription(int id, int candidat_id, String nom, String prenom, String email, String statut, Date date_inscription, Boolean paiement_effectué, String commentaire, Boolean admis, Boolean licence, Boolean master) {
        this.id = id;
        this.candidat_id = candidat_id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.statut = statut;
        this.date_inscription = date_inscription;
        this.paiement_effectué = paiement_effectué;
        Commentaire = commentaire;
        this.admis = admis;
        this.licence = licence;
        this.master = master;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getCandidat_id() {
        return candidat_id;
    }

    public void setCandidat_id(int candidat_id) {
        this.candidat_id = candidat_id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public Date getDate_inscription() {
        return date_inscription;
    }

    public void setDate_inscription(Date date_inscription) {
        this.date_inscription = date_inscription;
    }

    public Boolean getPaiement_effectué() {
        return paiement_effectué;
    }

    public void setPaiement_effectué(Boolean paiement_effectué) {
        this.paiement_effectué = paiement_effectué;
    }

    public String getCommentaire() {
        return Commentaire;
    }

    public void setCommentaire(String commentaire) {
        Commentaire = commentaire;
    }

    public Boolean getAdmis() {
        return admis;
    }

    public void setAdmis(Boolean admis) {
        this.admis = admis;
    }

    public Boolean getLicence() {
        return licence;
    }

    public void setLicence(Boolean licence) {
        this.licence = licence;
    }

    public Boolean getMaster() {
        return master;
    }

    public void setMaster(Boolean master) {
        this.master = master;
    }

    public boolean isMaster() {
        return master != null && master;
    }
}
