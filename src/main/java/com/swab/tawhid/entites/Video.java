package com.swab.tawhid.entites;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "videos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(nullable = false , unique = true)
    private String youtubeId; // Id de la video youtube

    //plusieurs videos vont apartenir a une playlist
    @ManyToOne
    @JoinColumn(name = "playlist_id", nullable = false)
    private Playlist playlist;
}
