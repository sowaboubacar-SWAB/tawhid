package com.swab.tawhid.repositories;

import com.swab.tawhid.entites.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {
    //Spring Jpa genere la requete SQL
    Optional<User> findByUsername(String username);
}
