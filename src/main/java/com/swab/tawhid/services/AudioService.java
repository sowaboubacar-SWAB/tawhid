package com.swab.tawhid.services;

import com.swab.tawhid.entites.Audio;
import com.swab.tawhid.entites.Playlist;
import com.swab.tawhid.repositories.AudioRepository;
import com.swab.tawhid.repositories.PlaylistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AudioService {

    private final AudioRepository audioRepository;
    private final PlaylistRepository playlistRepository;

    public Audio addAudioToPlaylist(Long playlistId, Audio audio) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist introuvable"));
        audio.setPlaylist(playlist);
        return audioRepository.save(audio);
    }

    public List<Audio> getAudiosByPlaylist(Long playlistId) {
        return audioRepository.findByPlaylist_Id(playlistId);
    }
}