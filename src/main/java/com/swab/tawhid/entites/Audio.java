package com.swab.tawhid.entites;



import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "audios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Audio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    private String artiste;

    @Column(nullable = false)
    private String urlFichier; // Stocke le nom du fichier (ex: "uuid.mp3")

    // On lie l'audio à une playlist (pour plus tard)
    @ManyToOne
    @JoinColumn(name = "playlist_id", nullable = false)
    private Playlist playlist;
}