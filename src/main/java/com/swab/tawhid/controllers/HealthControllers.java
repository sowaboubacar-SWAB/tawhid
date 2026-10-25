package com.swab.tawhid.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthControllers {

    @GetMapping("/health")
    public Map<String,String> healthCheck(){
        return Map.of(
                "status","Ok",
                "message" ,"Bienvenue sur l'Api Tawhid !"
        );
    }
}
