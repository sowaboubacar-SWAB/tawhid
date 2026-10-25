package com.swab.tawhid.controllers;

import com.swab.tawhid.entites.Video;
import com.swab.tawhid.services.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {
    private final VideoService videoService;

    //Post: lister les videos..
    @PostMapping("/playlists/{playlistId}")
    public Video addVideo(@PathVariable("playlistId") Long playlistId, @RequestBody Video video) {
        return videoService.addVideoToPlaylist(playlistId, video);
    }

    // GET : Lister les videos de la playlist
    @GetMapping("/playlists/{playlistId}")
    public List<Video> getVideos(@PathVariable("playlistId") Long playlistId) {
        return videoService.getVideosByPlaylist(playlistId);
    }
    //Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVideo(@PathVariable Long id) {
        videoService.deleteVideo(id);
        return ResponseEntity.noContent().build();
    }
}
