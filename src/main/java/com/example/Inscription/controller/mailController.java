package com.example.Inscription.controller;

import com.example.Inscription.service.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailSender;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mail")
public class mailController {
    @Autowired
    private MailService mailService;

    @GetMapping("/send")
    public String sendEmail() {
        mailService.sendSimpleEmail(
                "koloina.arilala@gmail.com",
                "Bonjour !",
                "Ceci est un test d’envoi d'email avec Spring Boot."
        );
        return "Email envoyé avec succès !";
    }

    @GetMapping("/send/{to}/{sujet}/{texte}")
    public String sendEmailTo(@PathVariable String to, @PathVariable String sujet, @PathVariable String texte) {
        mailService.sendSimpleEmail(
                to,
                sujet,
                texte
        );
        return "Email envoyé avec succès !";
    }
}
