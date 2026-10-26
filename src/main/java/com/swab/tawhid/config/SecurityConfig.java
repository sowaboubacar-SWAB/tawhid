package com.swab.tawhid.config;

import com.swab.tawhid.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter  jwtAuthFilter; // On inject notre filtre

    // On l'indique Bcrypt
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    //Config le videur
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Routes publiques
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/", "/index.html","/register.html", "/login.html", "/admin.html", "/css/**", "/js/**", "/favicon.ico").permitAll()
                        .requestMatchers("/error").permitAll()

                        // Lecture : tout le monde peut voir les playlists et vidéos et audios
                        .requestMatchers(HttpMethod.GET, "/api/playlists/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/videos/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/files/**").permitAll()
                        .requestMatchers("/api/user/**").permitAll()
                        // Écriture (POST, DELETE) : Réservé aux ADMIN
                        .requestMatchers(HttpMethod.POST, "/api/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")

                        // Tout le reste nécessite une authentification
                        .anyRequest().authenticated()

                )
        // On ajoute notre filtre avant le filtre par défaut de Spring
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
