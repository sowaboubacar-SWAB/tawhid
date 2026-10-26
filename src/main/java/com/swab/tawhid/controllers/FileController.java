package com.swab.tawhid.controllers;

import com.swab.tawhid.entites.Audio;
import com.swab.tawhid.services.AudioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final AudioService audioService;
    private final String uploadDir = "uploads/";

    // Modification : on accepte plusieurs fichiers "files[]"
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "titre", required = false) String titre,
            @RequestParam(value = "artiste", required = false) String artiste,
            @RequestParam("playlistId") Long playlistId) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            int count = 0;
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                String originalFilename = file.getOriginalFilename();
                if (originalFilename == null) continue;

                // Extraire l'extension
                String extension = originalFilename.substring(originalFilename.lastIndexOf("."));

                // --- NOUVEAU : Extraire le nom sans l'extension ---
                String titreFichier = originalFilename.substring(0, originalFilename.lastIndexOf("."));

                // Remplacer les underscores ou tirets par des espaces (optionnel, pour faire plus propre)
                titreFichier = titreFichier.replace("_", " ");

                // Générer le nouveau nom unique pour le stockage
                String newFilename = UUID.randomUUID().toString() + extension;
                Path filePath = uploadPath.resolve(newFilename);
                Files.copy(file.getInputStream(), filePath);

                // Créer l'objet Audio
                Audio audio = new Audio();

                // --- NOUVEAU : Si le champ "titre" est vide, on utilise le nom du fichier ---
                if (titre == null || titre.trim().isEmpty()) {
                    audio.setTitre(titreFichier);
                } else {
                    // Si l'utilisateur a mis un titre, on l'utilise (pour un seul fichier)
                    // ou on ajoute un numéro (pour plusieurs fichiers)
                    audio.setTitre(files.length > 1 ? titre + " - " + titreFichier : titre);
                }

                audio.setArtiste(artiste);
                audio.setUrlFichier(newFilename);

                audioService.addAudioToPlaylist(playlistId, audio);
                count++;
            }

            return ResponseEntity.ok(count + " fichier(s) uploadé(s) avec succès !");

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'upload : " + e.getMessage());
        }
    }
    // 2. Route pour écouter un fichier (streaming)
    @GetMapping("/{filename}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, "audio/mpeg")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}