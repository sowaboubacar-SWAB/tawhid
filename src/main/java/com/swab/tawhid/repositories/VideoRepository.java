package com.swab.tawhid.repositories;

import com.swab.tawhid.entites.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoRepository extends JpaRepository<Video,Long> {

    //Trouver les videos d'une playlis..
    List<Video> findByPlaylist_Id(Long playlistId);
    // Pour vérifier si une vidéo existe déjà dans une playlist
    boolean existsByYoutubeIdAndPlaylistId(String youtubeId, Long playlistId);
}
