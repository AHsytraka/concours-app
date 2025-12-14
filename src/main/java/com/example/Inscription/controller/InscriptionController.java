package com.example.Inscription.controller;

import com.example.Inscription.model.Inscription;
import com.example.Inscription.service.InscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inscription")
@Tag(name = "Inscription", description = "Manage inscriptions")
public class InscriptionController {
    @Autowired
    private InscriptionService inscriptionService;

    @PostMapping("/add")
    @Operation(summary = "Add a new inscription", description = "Creates a new inscription record in the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Inscription added successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid inscription data")
    })
    public String add(@RequestBody Inscription inscription){
        inscriptionService.addInscription(inscription);
        return "Inscription added";
    }

    @GetMapping("/")
    @Operation(summary = "Get all inscriptions", description = "Retrieves a list of all inscriptions")
    @ApiResponse(responseCode = "200", description = "List of inscriptions retrieved successfully")
    public List<Inscription> getInscriptions(){
        return inscriptionService.getAllInscriptions();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get inscription by ID", description = "Retrieves a specific inscription by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Inscription found"),
            @ApiResponse(responseCode = "404", description = "Inscription not found")
    })
    public String getInscriptionById(@PathVariable int id){
        inscriptionService.getInscriptionById(id);
        return "Inscription found";
    }

    @DeleteMapping("/delete/{id}")
    @Operation(summary = "Delete inscription", description = "Deletes an inscription by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Inscription deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Inscription not found")
    })
    public String deleteInscriptionById(@PathVariable int id){
        inscriptionService.deleteInscription(id);
        return "Inscription deleted";
    }

    @PutMapping("/modify")
    @Operation(summary = "Update inscription", description = "Updates an existing inscription")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Inscription updated successfully"),
            @ApiResponse(responseCode = "404", description = "Inscription not found")
    })
    public String updateInscription(@RequestBody Inscription inscription){
        inscriptionService.updateInscription(inscription);
        return "Inscription updated";
    }

    @GetMapping("/statut/{id}")
    @Operation(summary = "Get inscription status", description = "Retrieves the status of a specific inscription")
    @ApiResponse(responseCode = "200", description = "Status retrieved successfully")
    public String statut(@PathVariable int id){
        return inscriptionService.getStatut(id);
    }

    @PostMapping("/statut/{id}/{nouvStatut}")
    @Operation(summary = "Update inscription status", description = "Updates the status of an inscription")
    @ApiResponse(responseCode = "200", description = "Status updated successfully")
    public String updateStatut(@PathVariable int id, @PathVariable String nouvStatut){
        inscriptionService.updateStatut(id, nouvStatut);
        return "Inscription status updated";
    }

    @GetMapping("/admission/{id}")
    public Boolean admission(@PathVariable int id){
        return inscriptionService.verifAdmission(id);
    }

    @PostMapping("/licence/{id}/{v}")
    public String updateLicence(@PathVariable int id, @PathVariable Boolean v){
        inscriptionService.updateLicence(id, v);
        return "licence updated";
    }

    @PostMapping("/master/{id}/{v}")
    public String updateMaster(@PathVariable int id, @PathVariable Boolean v){
        inscriptionService.updateMaster(id, v);
        return "master updated";
    }

    @GetMapping("/nbLicence")
    public int nbLicence(){
        return inscriptionService.nbLicence();
    }
    @GetMapping("/nbMaster")
    public int nbMaster(){
        return inscriptionService.nbMaster();
    }
    @GetMapping("/nb/{statut}")
    public int nbParStatut(@PathVariable String statut){
        return inscriptionService.nbParStatut(statut);
    }

    @GetMapping("/paiement/{id}")
    public Boolean getPaiement(@PathVariable int id){
        return inscriptionService.verifPaiement(id);
    }

}
