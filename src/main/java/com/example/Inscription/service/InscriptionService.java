package com.example.Inscription.service;

import com.example.Inscription.model.Inscription;

import java.util.List;
import java.util.Optional;

public interface InscriptionService {

    public List<Inscription> getAllInscriptions();
    public Inscription addInscription(Inscription inscription);
    public Optional<Inscription> getInscriptionById(int id);
    public void deleteInscription(int id);
    public void updateInscription(Inscription inscription);
    public String getStatut(int candidat_id);
    public void updateStatut(int candidat_id, String nouveauStatus);
    public Boolean verifAdmission(int candidat_id);
    public void updateLicence(int candidat_id, Boolean v);
    public void updateMaster(int candidat_id, Boolean v);
    public int nbLicence();
    public int nbMaster();
    public int nbParStatut(String statut);
    public Boolean verifPaiement(int candidat_id);
    Optional<Inscription> findById(int inscriptionId);
}
