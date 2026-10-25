package com.swab.tawhid.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        // On ignore le filtre pour les routes d'authentification (login, register)
        return request.getServletPath().startsWith("/api/auth/");
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // DEBUG
        System.out.println("=== FILTRE JWT ===");
        System.out.println("URL : " + request.getServletPath());
        System.out.println("Header Authorization : " + authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("Pas de token Bearer trouvé, on laisse passer.");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String username = null;

        try {
            username = jwtService.extractUsername(token);
            System.out.println("Username extrait du token : " + username);
        } catch (Exception e) {
            System.out.println("Erreur lors de la lecture du token : " + e.getMessage());
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            //extraire le role
            String role  = jwtService.extractRole(token);
            //on cree le role de l'admin
            org.springframework.security.core.authority.SimpleGrantedAuthority authority =
                    new org.springframework.security.core.authority.SimpleGrantedAuthority(role);

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    username, null, java.util.List.of(authority)
            );
            SecurityContextHolder.getContext().setAuthentication(authToken);
            System.out.println("Utilisateur authentifié dans le contexte !");
        }

        filterChain.doFilter(request, response);
    }

}
