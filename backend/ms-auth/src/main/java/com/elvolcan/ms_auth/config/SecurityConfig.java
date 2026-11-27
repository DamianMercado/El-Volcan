package com.elvolcan.ms_auth.config;

import com.elvolcan.ms_auth.security.JwtAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${internal.service.key:ElVolcanInternalServiceKey2026Segura}")
    private String internalServiceKey;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        ObjectMapper mapper = new ObjectMapper();

        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            Map<String, Object> body = new LinkedHashMap<>();
                            body.put("timestamp", LocalDateTime.now().toString());
                            body.put("status", 401);
                            body.put("error", "Unauthorized");
                            body.put("mensaje", "Acceso no autorizado: se requiere un token JWT Bearer válido");
                            mapper.writeValue(response.getOutputStream(), body);
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            Map<String, Object> body = new LinkedHashMap<>();
                            body.put("timestamp", LocalDateTime.now().toString());
                            body.put("status", 403);
                            body.put("error", "Forbidden");
                            body.put("mensaje", "Acceso denegado: tu rol no tiene permisos para este recurso");
                            mapper.writeValue(response.getOutputStream(), body);
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/doc/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/actuator/health").permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/api/v1/auth/login",
                                "/api/v1/auth/registro",
                                "/api/v1/auth/recuperar-clave"
                        ).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/logout", "/api/v1/auth/refresh").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/auth/validar", "/api/v1/auth/validar-usuario/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/auth/sesiones", "/api/v1/auth/sesiones/**").hasAnyRole("ADMIN", "INTERNAL")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public RequestInterceptor feignInternalAuthInterceptor() {
        return requestTemplate -> requestTemplate.header(
                JwtAuthenticationFilter.HEADER_INTERNAL_KEY,
                internalServiceKey
        );
    }
}
