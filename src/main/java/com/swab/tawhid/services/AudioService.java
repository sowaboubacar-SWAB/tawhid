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
        // Vérification des doublons
        if (audioRepository.existsByTitreAndPlaylistId(audio.getTitre(), playlistId)) {
            throw new RuntimeException("Un audio avec ce titre existe déjà dans cette playlist.");
        }

        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist introuvable"));

        audio.setPlaylist(playlist);
        return audioRepository.save(audio);
    }

    public List<Audio> getAudiosByPlaylist(Long playlistId) {
        return audioRepository.findByPlaylist_Id(playlistId);
    }

    public void deleteAudio(Long id) {
        if (!audioRepository.existsById(id)) {
            throw new RuntimeException("Audio introuvable avec l'id : " + id);
        }
        audioRepository.deleteById(id);
    }
}