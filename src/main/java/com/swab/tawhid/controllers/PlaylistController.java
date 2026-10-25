package com.swab.tawhid.controllers;

import com.swab.tawhid.entites.Playlist;
import com.swab.tawhid.services.PlaylistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/playlists")
@RequiredArgsConstructor
public class PlaylistController {
    private final PlaylistService playlistService;

    // Route pour recup ttes les playlists
    @GetMapping
    public List<Playlist> getAllPlaylists() {
        return playlistService.getAllPlaylists();
    }
    // 3. Récupérer une playlist par son ID (C'est celle qui manque !)
    @GetMapping("/{id}")
    public ResponseEntity<Playlist> getPlaylistById(@PathVariable Long id) {
        return ResponseEntity.ok(playlistService.getPlaylistById(id));
    }

    // Pour creer une playlist
    @PostMapping
    public Playlist createlaylist(@Valid @RequestBody Playlist playlist) {
        return playlistService.createPlaylist(playlist);

    }

    //Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlaylist(@PathVariable Long id) {
        playlistService.deletePlaylist(id);
        return ResponseEntity.noContent().build();// Renvoie un code 204 (No Content = succès, mais rien à afficher)
    }

}
