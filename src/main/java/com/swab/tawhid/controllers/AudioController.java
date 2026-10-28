package com.swab.tawhid.controllers;

import com.swab.tawhid.entites.Audio;
import com.swab.tawhid.services.AudioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audios")
@RequiredArgsConstructor
public class AudioController {

    private final AudioService audioService;

    // GET /api/audios/playlists/{playlistId} -> Lister les audios d'une playlist
    @GetMapping("/playlists/{playlistId}")
    public List<Audio> getAudiosByPlaylist(@PathVariable Long playlistId) {
        return audioService.getAudiosByPlaylist(playlistId);
    }

    // DELETE /api/audios/{id} -> Supprimer un audio (vérifie s'il existe dans le service)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAudio(@PathVariable Long id) {
        audioService.deleteAudio(id);
        return ResponseEntity.noContent().build();
    }
}