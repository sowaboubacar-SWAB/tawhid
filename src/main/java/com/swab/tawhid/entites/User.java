package com.swab.tawhid.entites;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le Nom est obligatoire")
    @Column(unique = true,nullable = false)
    private String username;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Column(nullable = false)
    private String password; //hache en Bcrypt

    //un role fixe en attendant !!
    @Column(nullable = false)
    private String role = "ROLE_USER";

    private LocalDateTime dateInscription = LocalDateTime.now();
}
