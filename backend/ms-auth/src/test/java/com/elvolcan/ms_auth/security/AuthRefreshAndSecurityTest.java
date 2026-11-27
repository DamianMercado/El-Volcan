package com.elvolcan.ms_auth.security;

import com.elvolcan.ms_auth.client.UsuarioClient;
import com.elvolcan.ms_auth.dto.response.AuthResponse;
import com.elvolcan.ms_auth.enums.EstadoSesion;
import com.elvolcan.ms_auth.mapper.AuthMapper;
import com.elvolcan.ms_auth.model.SesionAuth;
import com.elvolcan.ms_auth.repository.SesionAuthRepository;
import com.elvolcan.ms_auth.service.AuthService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthRefreshAndSecurityTest {

    @Mock
    private SesionAuthRepository sesionAuthRepository;

    @Mock
    private AuthMapper authMapper;

    @Mock
    private UsuarioClient usuarioClient;

    @Mock
    private ObjectProvider<SesionAuthRepository> sesionRepoProvider;

    private JwtUtil jwtUtil;
    private AuthService authService;
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", "ElVolcanSecretKeyParaAutenticacionMicroserviciosJWT2026Segura123456");
        ReflectionTestUtils.setField(jwtUtil, "expirationMs", 3600000L);

        authService = new AuthService(sesionAuthRepository, authMapper, usuarioClient, jwtUtil);

        jwtAuthenticationFilter = new JwtAuthenticationFilter(jwtUtil, sesionRepoProvider);
        ReflectionTestUtils.setField(jwtAuthenticationFilter, "internalServiceKey", "ElVolcanInternalServiceKey2026Segura");
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("renovarToken rota el JWT activo, cierra la sesión anterior y emite un token nuevo")
    void renovarToken_RotaSesionCorrectamente() {
        String tokenOriginal = jwtUtil.generarToken(1L, "Andrea Muñoz", "admin@el-volcan.com", "ADMIN");
        SesionAuth sesionPrevia = SesionAuth.builder()
                .id(10L)
                .idUsuario(1L)
                .nombreUsuario("Andrea Muñoz")
                .email("admin@el-volcan.com")
                .rol("ADMIN")
                .token(tokenOriginal)
                .fechaInicio(LocalDateTime.now().minusHours(1))
                .fechaExpiracion(LocalDateTime.now().plusHours(23))
                .estado(EstadoSesion.ACTIVA)
                .build();

        when(sesionAuthRepository.findByToken(tokenOriginal)).thenReturn(Optional.of(sesionPrevia));
        when(sesionAuthRepository.save(any(SesionAuth.class))).thenAnswer(inv -> inv.getArgument(0));
        when(authMapper.toResponse(any(SesionAuth.class))).thenAnswer(inv -> {
            SesionAuth s = inv.getArgument(0);
            return AuthResponse.builder()
                    .idUsuario(s.getIdUsuario())
                    .email(s.getEmail())
                    .rol(s.getRol())
                    .token(s.getToken())
                    .estado(s.getEstado())
                    .build();
        });

        AuthResponse renovada = authService.renovarToken("Bearer " + tokenOriginal);

        assertNotNull(renovada.getToken());
        assertNotEquals(tokenOriginal, renovada.getToken());
        assertEquals(EstadoSesion.ACTIVA, renovada.getEstado());
        assertEquals(EstadoSesion.CERRADA, sesionPrevia.getEstado());
        assertTrue(jwtUtil.validarTokenCriptografico(renovada.getToken()));
        verify(sesionAuthRepository, times(2)).save(any(SesionAuth.class));
    }

    @Test
    @DisplayName("renovarToken rechaza tokens revocados o con sesión cerrada")
    void renovarToken_RechazaSesionCerrada() {
        String tokenCerrado = jwtUtil.generarToken(4L, "Cliente Usuario", "cliente@el-volcan.com", "CLIENTE");
        SesionAuth sesionCerrada = SesionAuth.builder()
                .id(11L)
                .token(tokenCerrado)
                .estado(EstadoSesion.CERRADA)
                .build();

        when(sesionAuthRepository.findByToken(tokenCerrado)).thenReturn(Optional.of(sesionCerrada));

        assertThrows(IllegalArgumentException.class, () -> authService.renovarToken("Bearer " + tokenCerrado));
    }

    @Test
    @DisplayName("JwtAuthenticationFilter asigna ROLE_ADMIN en SecurityContextHolder para un JWT válido activo")
    void filtroJwt_AsignaRolAdmin() throws Exception {
        String tokenAdmin = jwtUtil.generarToken(1L, "Andrea Muñoz", "admin@el-volcan.com", "ADMIN");
        when(sesionRepoProvider.getIfAvailable()).thenReturn(sesionAuthRepository);
        when(sesionAuthRepository.findByToken(tokenAdmin)).thenReturn(Optional.of(
                SesionAuth.builder().token(tokenAdmin).estado(EstadoSesion.ACTIVA).build()
        ));

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/auth/sesiones");
        request.addHeader("Authorization", "Bearer " + tokenAdmin);

        jwtAuthenticationFilter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertEquals("admin@el-volcan.com", auth.getName());
        assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
    }

    @Test
    @DisplayName("JwtAuthenticationFilter bloquea tokens revocados limpiando el SecurityContextHolder")
    void filtroJwt_BloqueaTokenRevocado() throws Exception {
        String tokenRevocado = jwtUtil.generarToken(1L, "Andrea Muñoz", "admin@el-volcan.com", "ADMIN");
        when(sesionRepoProvider.getIfAvailable()).thenReturn(sesionAuthRepository);
        when(sesionAuthRepository.findByToken(tokenRevocado)).thenReturn(Optional.of(
                SesionAuth.builder().token(tokenRevocado).estado(EstadoSesion.CERRADA).build()
        ));

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/auth/sesiones");
        request.addHeader("Authorization", "Bearer " + tokenRevocado);

        jwtAuthenticationFilter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
