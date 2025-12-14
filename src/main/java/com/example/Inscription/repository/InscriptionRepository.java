package com.example.Inscription.repository;

import com.example.Inscription.model.Inscription;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InscriptionRepository extends JpaRepository<Inscription,Integer> {
    @Query("SELECT i.statut FROM Inscription i WHERE i.candidat_id = :id")
    String getStatut(@Param("id") int id);

    @Transactional
    @Modifying
    @Query("UPDATE Inscription i SET i.statut = :nouveauStatut WHERE i.candidat_id = :id")
    void updateStatut(@Param("id") int id, @Param("nouveauStatut") String nouveauStatut);

    @Query("SELECT i.admis FROM Inscription i WHERE i.candidat_id = :id")
    Boolean verifAdmission(@Param("id") int id);

    @Transactional
    @Modifying
    @Query("UPDATE Inscription i SET i.licence = :vlicence WHERE i.candidat_id = :id")
    void updateLicence(@Param("id") int id, @Param("licence") Boolean vlicence);

    @Transactional
    @Modifying
    @Query("UPDATE Inscription i SET i.licence = :vmaster WHERE i.candidat_id = :id")
    void updateMaster(@Param("id") int id, @Param("master") Boolean vmaster);

    @Query("SELECT COUNT(i.id) FROM Inscription i WHERE i.admis = true AND i.licence = true")
    int getNbLicence();

    @Query("SELECT COUNT(i.id) FROM Inscription i WHERE i.admis = true AND i.master = true")
    int getNbMaster();

    @Query("SELECT COUNT(i.id) FROM Inscription i WHERE i.admis = true AND i.statut = :statut")
    int getNbParStatut(@Param("statut") String statut);

    @Query("SELECT i.paiement_effectué FROM Inscription i WHERE i.candidat_id = :candidat_id")
    Boolean getPaiement(@Param("candidat_id") int candidat_id);
    
    @Query("SELECT i FROM Inscription i WHERE i.email = :email")
    java.util.List<Inscription> findByEmail(@Param("email") String email);
}
