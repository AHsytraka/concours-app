package com.example.Inscription.repository;

import com.example.Inscription.model.Document;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document,Integer> {
    //validation manuelle
    @Transactional
    @Modifying
    @Query("UPDATE Document d SET d.valide = :validation WHERE d.inscription.id = :id")
    void updateValide(@Param("id") int id, @Param("validation") Boolean validation);

    @Modifying(clearAutomatically = true)  // Indique que c'est une requête update
    @Transactional
    @Query("UPDATE Document d SET d.verifie = :validation WHERE d.inscription.id= :id")
    void updateVerifie(@Param("id") int id, @Param("validation") Boolean validation);

    @Modifying(clearAutomatically = true)  // Indique que c'est une requête update
    @Transactional
    @Query("SELECT d FROM Document d WHERE d.verifie = false")
    List<Document> findByValideFalse();
}
