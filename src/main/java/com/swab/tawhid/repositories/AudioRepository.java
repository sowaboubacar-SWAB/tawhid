package com.swab.tawhid.repositories;

import com.swab.tawhid.entites.Audio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AudioRepository extends JpaRepository<Audio, Long> {

    // Pour lister les audios d'une playlist
    List<Audio> findByPlaylist_Id(Long playlistId);

    // NOUVEAU : Vérifier si un audio avec ce titre existe déjà dans cette playlist
    boolean existsByTitreAndPlaylistId(String titre, Long playlistId);
}