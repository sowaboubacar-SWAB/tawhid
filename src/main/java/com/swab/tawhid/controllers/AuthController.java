package com.swab.tawhid.controllers;

import com.swab.tawhid.entites.User;
import com.swab.tawhid.repositories.UserRepository;
import com.swab.tawhid.security.JwtService;
import com.swab.tawhid.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user){
        Optional<User> optionalUser = userRepository.findByUsername(user.getUsername());

        if(optionalUser.isEmpty()){
            return ResponseEntity.status(401).body(Map.of("Error","Utilisateur introuvable"));
        }
        User userDb = optionalUser.get();

        // Verification de l'utilisateur si mdp correspond
        if(!passwordEncoder.matches(user.getPassword(),userDb.getPassword())){
            return ResponseEntity.status(401).body(Map.of("Error","Mot de passe incorrecte"));
        }

        //Generer le token
        String token = jwtService.generateToken(userDb.getUsername(), userDb.getRole());

        //renvoyer le token
        return ResponseEntity.ok(Map.of("token",token));
    }
    @PostMapping("/register-admin")
    public ResponseEntity<String> registerAdmin(@Valid @RequestBody User user) {
        userService.registerAdmin(user);
        return ResponseEntity.ok("Administrateur créé avec succès !");
    }
    //route pour inscription
    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody User user) {
        userService.registerUser(user);
        return ResponseEntity.ok("Utilisateur cree avec succes !");
    }
}
