package com.swab.tawhid.services;

import com.swab.tawhid.entites.Playlist;
import com.swab.tawhid.repositories.PlaylistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlaylistService {

    private final PlaylistRepository playlistRepository;

    //Recuperer tt les playlist
    public List<Playlist> getAllPlaylists() {
        return playlistRepository.findAll();
    }

    // Creer une playlist
    public Playlist createPlaylist(Playlist playlist) {
        return playlistRepository.save(playlist);
    }

    // recuperer playlist par id
    public Playlist getPlaylistById(Long id) {
        return playlistRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Playlist introuvable avec l'id : "+id));
    }

    // Suprimer playlist par son Id
    public void deletePlaylist(Long id) {
        //on verifie l'exitence !
        if(!playlistRepository.existsById(id)) {
            throw new RuntimeException("Playlist introuvable avec l'id : "+id);
        }
        playlistRepository.deleteById(id);
    }
}
