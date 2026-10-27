package com.swab.tawhid.services;

import com.swab.tawhid.entites.Playlist;
import com.swab.tawhid.entites.Video;
import com.swab.tawhid.repositories.PlaylistRepository;
import com.swab.tawhid.repositories.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VideoService {

    private final VideoRepository videoRepository;
    private final PlaylistRepository playlistRepository;

    // Ajout vers une playlist specifique
    public Video addVideoToPlaylist(Long playlistId, Video video) {
        // 1. Vérifier si la vidéo existe déjà dans cette playlist
        if (videoRepository.existsByYoutubeIdAndPlaylistId(video.getYoutubeId(), playlistId)) {
            throw new RuntimeException("Cette vidéo est déjà présente dans cette playlist.");
        }

        // 2. Récupérer la playlist
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist introuvable avec l'Id : " + playlistId));

        // 3. Lier et sauvegarder
        video.setPlaylist(playlist);
        return videoRepository.save(video);
    }

    // Récupérer toutes les vidéos d'une playlist
    public List<Video> getVideosByPlaylist(Long playlistId) {
        return videoRepository.findByPlaylist_Id(playlistId);
    }

    // Supprimer une vidéo par son id
    public void deleteVideo(Long id) {
        if (!videoRepository.existsById(id)) {
            throw new RuntimeException("Vidéo introuvable avec l'id : " + id);
        }
        videoRepository.deleteById(id);
    }
}