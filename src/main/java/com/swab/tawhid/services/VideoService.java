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

    //ajout vers une playlist specifique

    public Video addVideoToPlaylist(Long playlistId, Video video) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(()-> new RuntimeException("Playlist introuvable avec l'Id : " + playlistId));

        video.setPlaylist(playlist);// On lie la video a la playlist
        return videoRepository.save(video);
    }
    // Recup tts les videos d'une playlist
    public List<Video> getVideosByPlaylist(Long  playlistId) {
        return videoRepository.findByPlaylist_Id(playlistId);
    }
    // Supprimer video par id
    public void deleteVideo(Long id){
        if(!videoRepository.existsById(id)){
            throw new RuntimeException("Video introuvable avec l'id : " + id);
        }
        videoRepository.deleteById(id);
    }

}
