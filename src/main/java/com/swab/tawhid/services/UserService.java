package com.swab.tawhid.services;

import com.swab.tawhid.entites.User;
import com.swab.tawhid.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User registerUser(User user){
        if(userRepository.findByUsername(user.getUsername()).isPresent()){
            throw new RuntimeException("Ce nom d'utilisateur est deja pris !");
        }
        //2.hachage ici
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("ROLE_USER");
        //3.sauvegarde
        return userRepository.save(user);
    }

    public User registerAdmin(User user){
        if(userRepository.findByUsername(user.getUsername()).isPresent()){
            throw new RuntimeException("Ce nom d'utilisateur est deja pris !");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("ROLE_ADMIN");//role administateur
        return userRepository.save(user);
    }
}
