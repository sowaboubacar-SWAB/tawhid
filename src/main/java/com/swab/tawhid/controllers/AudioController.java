package com.swab.tawhid.controllers;

import com.swab.tawhid.entites.Audio;
import com.swab.tawhid.services.AudioService;
import lombok.RequiredArgsConstructor;
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
}