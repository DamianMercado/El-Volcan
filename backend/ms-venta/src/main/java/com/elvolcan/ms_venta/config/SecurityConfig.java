package com.elvolcan.ms_venta.config;

import com.elvolcan.ms_venta.security.JwtAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
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
                            body.put("mensaje", "Acceso denegado: tu rol no tiene permisos para esta operación de ventas");
                            mapper.writeValue(response.getOutputStream(), body);
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/doc/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/actuator/health").permitAll()
                        // Permite crear pedidos tanto a clientes autenticados como a compra de invitado en tienda
                        .requestMatchers(HttpMethod.POST, "/api/v1/ventas").permitAll()
                        // Seguimiento y consulta propia del cliente autenticado (aislamiento JWT aplicado en servicio)
                        .requestMatchers(HttpMethod.GET,
                                "/api/v1/ventas/mis-pedidos",
                                "/api/v1/ventas/mis-pedidos/paginado",
                                "/api/v1/ventas/usuario/**"
                        ).authenticated()
                        // Consultas operativas de todas las ventas para gestión y reparto
                        .requestMatchers(HttpMethod.GET,
                                "/api/v1/ventas",
                                "/api/v1/ventas/paginado",
                                "/api/v1/ventas/estado/**"
                        ).hasAnyRole("ADMIN", "REPARTIDOR", "OPERADOR", "INTERNAL")
                        // Detalle de venta para usuarios autenticados o llamadas internas de ms-pago
                        .requestMatchers(HttpMethod.GET, "/api/v1/ventas/{id}", "/api/v1/ventas/{id}/completa").authenticated()
                        // Confirmación de pago invocada por ms-pago o ADMIN
                        .requestMatchers(HttpMethod.PUT, "/api/v1/ventas/*/confirmar-pago").hasAnyRole("ADMIN", "INTERNAL")
                        // Flujo de despacho y entrega (ADMIN, REPARTIDOR, OPERADOR)
                        .requestMatchers(HttpMethod.PUT,
                                "/api/v1/ventas/*/asignar-repartidor",
                                "/api/v1/ventas/*/recalcular-ruta",
                                "/api/v1/ventas/*/entregar"
                        ).hasAnyRole("ADMIN", "REPARTIDOR", "OPERADOR", "INTERNAL")
                        // Cancelación y eliminación restringidas
                        .requestMatchers(HttpMethod.PUT, "/api/v1/ventas/*/cancelar").hasAnyRole("ADMIN", "OPERADOR", "INTERNAL")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/ventas/*").hasAnyRole("ADMIN", "INTERNAL")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
