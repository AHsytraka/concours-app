package com.example.Inscription.service;

import com.example.Inscription.model.Inscription;
import com.example.Inscription.repository.InscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
@Service
public class InscriptionServiceImpl implements InscriptionService {
    @Autowired
    private InscriptionRepository inscriptionRepository;
    @Override
    public List<Inscription> getAllInscriptions() {
        return inscriptionRepository.findAll();
    }
    @Override
    public Inscription addInscription(Inscription inscription) {
        return inscriptionRepository.save(inscription);
    }

    @Override
    public Optional<Inscription> getInscriptionById(int id) {
        return inscriptionRepository.findById(id);
    }

    @Override
    public void deleteInscription(int id) {
        inscriptionRepository.deleteById(id);
    }

    @Override
    public void updateInscription(Inscription inscription) {
        inscriptionRepository.save(inscription);
    }

    @Override
    public String getStatut(int candidat_id) {
        return inscriptionRepository.getStatut(candidat_id);
    }

    @Override
    public void updateStatut(int candidat_id, String nouveauStatus) {
        inscriptionRepository.updateStatut(candidat_id, nouveauStatus);
    }

    @Override
    public Boolean verifAdmission(int candidat_id) {
        return inscriptionRepository.verifAdmission(candidat_id);
    }

    @Override
    public void updateLicence(int candidat_id, Boolean v) {
        inscriptionRepository.updateLicence(candidat_id,v);
    }

    @Override
    public void updateMaster(int candidat_id, Boolean v) {
        inscriptionRepository.updateMaster(candidat_id,v);
    }

    @Override
    public int nbLicence() {
        return inscriptionRepository.getNbLicence();
    }

    @Override
    public int nbMaster() {
        return inscriptionRepository.getNbMaster();
    }

    @Override
    public int nbParStatut(String statut) {
        return inscriptionRepository.getNbParStatut(statut);
    }

    @Override
    public Boolean verifPaiement(int candidat_id) {
        return inscriptionRepository.getPaiement(candidat_id);
    }

    @Override
    public Optional<Inscription> findById(int inscriptionId) {
        return inscriptionRepository.findById(inscriptionId);
    }
}
