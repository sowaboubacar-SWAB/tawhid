package com.swab.tawhid.controllers;

import com.swab.tawhid.entites.User;
import com.swab.tawhid.repositories.UserRepository;
import com.swab.tawhid.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;

    // Lister tous les utilisateurs (accessible uniquement aux admins)
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    // Supprimer un utilisateur
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
