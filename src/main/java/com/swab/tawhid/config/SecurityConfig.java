package com.swab.tawhid.config;

import com.swab.tawhid.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // 1. ROUTES PUBLIQUES (Auth, Swagger, Fichiers statiques)
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/", "/index.html", "/register.html", "/login.html", "/admin.html", "/css/**", "/js/**", "/favicon.ico").permitAll()
                        .requestMatchers("/error").permitAll()

                        // 2. LECTURE PUBLIQUE (Playlists, Vidéos, Audios)
                        .requestMatchers(HttpMethod.GET, "/api/playlists/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/videos/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/audios/**").permitAll()

                        // 3. FICHIERS STATIQUES (Écoute des MP3)
                        .requestMatchers(HttpMethod.GET, "/api/files/**").permitAll()

                        // 4. UPLOAD DE FICHIERS (Réservé aux ADMIN)
                        // Cette ligne doit être AVANT la règle générale POST
                        .requestMatchers(HttpMethod.POST, "/api/files/**").hasRole("ADMIN")

                        // 5. GESTION DES UTILISATEURS (Réservé aux ADMIN)
                        .requestMatchers("/api/users/**").hasRole("ADMIN")

                        // 6. ÉCRITURE GÉNÉRALE (POST, DELETE réservé aux ADMIN)
                        .requestMatchers(HttpMethod.POST, "/api/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")

                        // 7. TOUT LE RESTE NÉCESSITE UNE AUTHENTIFICATION
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}