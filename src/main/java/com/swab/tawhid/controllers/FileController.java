package com.swab.tawhid.controllers;

import com.swab.tawhid.entites.Audio;
import com.swab.tawhid.services.AudioService;
import com.swab.tawhid.services.R2Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final AudioService audioService;
    private final R2Service r2Service; // On injecte le service Cloudflare

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "titre", required = false) String titre,
            @RequestParam(value = "artiste", required = false) String artiste,
            @RequestParam("playlistId") Long playlistId) {
        try {
            int count = 0;
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                String originalFilename = file.getOriginalFilename();
                if (originalFilename == null) continue;

                // 1. Extraire le nom du fichier sans l'extension
                String titreFichier = originalFilename.substring(0, originalFilename.lastIndexOf("."))
                        .replace("_", " ");

                // 2. Envoyer le fichier sur Cloudflare R2 et récupérer son nouveau nom
                String newFilename = r2Service.uploadFile(file);

                // 3. Créer l'objet Audio
                Audio audio = new Audio();

                if (titre == null || titre.trim().isEmpty()) {
                    audio.setTitre(titreFichier);
                } else {
                    audio.setTitre(files.length > 1 ? titre + " - " + titreFichier : titre);
                }

                audio.setArtiste(artiste);
                audio.setUrlFichier(newFilename); // On stocke le nom du fichier R2 en base

                audioService.addAudioToPlaylist(playlistId, audio);
                count++;
            }

            return ResponseEntity.ok(count + " fichier(s) uploadé(s) avec succès sur Cloudflare !");

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'upload : " + e.getMessage());
        }
    }
}