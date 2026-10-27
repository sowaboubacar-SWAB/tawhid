package com.swab.tawhid.controllers;

import com.swab.tawhid.entites.Audio;
import com.swab.tawhid.services.AudioService;
import com.swab.tawhid.services.R2PresignService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final AudioService audioService;
    private final R2PresignService r2PresignService; // Le nouveau service

    // 1. Route pour obtenir les URLs d'upload direct (très léger pour Render)
    @PostMapping("/presign")
    public ResponseEntity<List<String>> getUploadUrls(@RequestBody List<String> filenames) {
        List<String> urls = new ArrayList<>();
        for (String filename : filenames) {
            urls.add(r2PresignService.generateUploadUrl(filename));
        }
        return ResponseEntity.ok(urls);
    }

    // 2. Route pour confirmer l'upload (une fois que le navigateur a fini d'envoyer à Cloudflare)
    @PostMapping("/confirm")
    public ResponseEntity<String> confirmUpload(@RequestBody List<AudioConfirmation> confirmations) {
        for (AudioConfirmation conf : confirmations) {
            Audio audio = new Audio();
            audio.setTitre(conf.titre());
            audio.setArtiste(conf.artiste());
            audio.setUrlFichier(conf.filename()); // Le nom généré par Cloudflare
            audioService.addAudioToPlaylist(conf.playlistId(), audio);
        }
        return ResponseEntity.ok("Upload confirmé et audios enregistrés !");
    }

    // Petit record pour recevoir les infos de confirmation depuis le JavaScript
    public record AudioConfirmation(Long playlistId, String titre, String artiste, String filename) {}
}