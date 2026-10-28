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
        // 1. Vérifier si un audio avec le même titre existe déjà dans cette playlist
        if (audioRepository.existsByTitreAndPlaylistId(audio.getTitre(), playlistId)) {
            throw new RuntimeException("Un audio avec ce titre existe déjà dans cette playlist.");
        }

        // 2. Récupérer la playlist
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist introuvable"));

        // 3. Lier et sauvegarder
        audio.setPlaylist(playlist);
        return audioRepository.save(audio);
    }

    public List<Audio> getAudiosByPlaylist(Long playlistId) {
        return audioRepository.findByPlaylist_Id(playlistId);
    }

    // Méthode de suppression avec vérification
    public void deleteAudio(Long id) {
        // Vérifie si l'audio existe, sinon lève une exception (gérée par GlobalExceptionHandler)
        if (!audioRepository.existsById(id)) {
            throw new RuntimeException("Audio introuvable avec l'id : " + id);
        }
        audioRepository.deleteById(id);
    }
}