package com.elvolcan.ms_inventario.security;

import com.elvolcan.ms_inventario.client.AuthClient;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String HEADER_INTERNAL_KEY = "X-Internal-Service-Key";
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Value("${jwt.secret:ElVolcanSecretKeyParaAutenticacionMicroserviciosJWT2026Segura123456}")
    private String secret;

    @Value("${internal.service.key:ElVolcanInternalServiceKey2026Segura}")
    private String internalServiceKey;

    private final ObjectProvider<AuthClient> authClientProvider;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

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

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            try {
                Claims claims = Jwts.parser()
                        .verifyWith(getSigningKey())
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                if (claims.getExpiration() != null && claims.getExpiration().after(new Date())) {
                    boolean autorizadoPorMsAuth = true;
                    AuthClient authClient = authClientProvider.getIfAvailable();
                    if (authClient != null && !esLlamadaInterna) {
                        try {
                            Map<String, Object> validacion = authClient.validarToken(token);
                            if (validacion != null && Boolean.FALSE.equals(validacion.get("valido"))) {
                                autorizadoPorMsAuth = false;
                            }
                        } catch (Exception e) {
                            log.debug("Validación local JWT aplicada en ms-inventario: {}", e.getMessage());
                        }
                    }

                    if (autorizadoPorMsAuth) {
                        String email = claims.get("email", String.class);
                        if (email == null || email.isBlank()) {
                            email = claims.getSubject();
                        }
                        String rol = claims.get("rol", String.class);
                        if (rol == null || rol.isBlank()) {
                            rol = claims.get("perfil", String.class);
                        }
                        List<GrantedAuthority> authorities = new ArrayList<>();
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + normalizarRol(rol)));
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
            } catch (Exception e) {
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
