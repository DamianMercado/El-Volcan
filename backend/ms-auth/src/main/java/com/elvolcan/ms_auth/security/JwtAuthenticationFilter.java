package com.elvolcan.ms_auth.security;

import com.elvolcan.ms_auth.enums.EstadoSesion;
import com.elvolcan.ms_auth.model.SesionAuth;
import com.elvolcan.ms_auth.repository.SesionAuthRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String HEADER_INTERNAL_KEY = "X-Internal-Service-Key";

    private final JwtUtil jwtUtil;
    private final ObjectProvider<SesionAuthRepository> sesionAuthRepositoryProvider;

    @Value("${internal.service.key:ElVolcanInternalServiceKey2026Segura}")
    private String internalServiceKey;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String internalHeader = request.getHeader(HEADER_INTERNAL_KEY);
        boolean esLlamadaInterna = internalServiceKey != null
                && !internalServiceKey.isBlank()
                && internalServiceKey.equals(internalHeader);

        String path = request.getRequestURI();
        if (esLlamadaInterna && path != null && path.startsWith("/api/v1/auth/validar")) {
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    "internal-service",
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_INTERNAL"))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            if (!token.isBlank() && jwtUtil.validarTokenCriptografico(token)) {
                boolean sesionRevocada = false;
                SesionAuthRepository repo = sesionAuthRepositoryProvider.getIfAvailable();
                if (repo != null) {
                    Optional<SesionAuth> sesionOpt = repo.findByToken(token);
                    if (sesionOpt.isPresent() && sesionOpt.get().getEstado() != EstadoSesion.ACTIVA) {
                        sesionRevocada = true;
                    }
                }

                if (!sesionRevocada) {
                    Claims claims = jwtUtil.extraerClaims(token);
                    String email = claims.get("email", String.class);
                    if (email == null || email.isBlank()) {
                        email = claims.getSubject();
                    }
                    String rol = claims.get("rol", String.class);
                    if (rol == null || rol.isBlank()) {
                        rol = claims.get("perfil", String.class);
                    }
                    String rolNormalizado = normalizarRol(rol);

                    List<GrantedAuthority> authorities = new ArrayList<>();
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + rolNormalizado));
                    if (esLlamadaInterna) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_INTERNAL"));
                    }

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(email, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    SecurityContextHolder.clearContext();
                }
            } else {
                SecurityContextHolder.clearContext();
            }
        } else if (esLlamadaInterna) {
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    "internal-service",
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_INTERNAL"))
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String normalizarRol(String rol) {
        if (rol == null || rol.isBlank()) {
            return "CLIENTE";
        }
        String upper = rol.trim().toUpperCase();
        if (upper.startsWith("ROLE_")) {
            upper = upper.substring(5);
        }
        if ("ADMINISTRADOR".equals(upper)) {
            return "ADMIN";
        }
        return upper;
    }
}
