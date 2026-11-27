package com.elvolcan.ms_auth.controller;

import com.elvolcan.ms_auth.dto.request.LoginRequest;
import com.elvolcan.ms_auth.dto.request.RegistroAuthRequest;
import com.elvolcan.ms_auth.dto.response.AuthResponse;
import com.elvolcan.ms_auth.dto.response.ValidacionAuthResponse;
import com.elvolcan.ms_auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación (ms-auth)", description = "Operaciones de login, registro y validación de autenticación para todos los microservicios")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión y obtener token JWT de autenticación")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Inicio de sesión exitoso"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "401", description = "Credenciales inválidas")
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/recuperar-clave")
    @Operation(summary = "Restablecer contraseña por correo electrónico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contraseña restablecida y sesión JWT emitida"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "401", description = "Cuenta no encontrada")
    })
    public ResponseEntity<AuthResponse> recuperarClave(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.recuperarClave(request));
    }

    @PostMapping("/registro")
    @Operation(summary = "Registrar un nuevo usuario y generar sesión autenticada")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuario registrado y autenticado"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o duplicados")
    })
    public ResponseEntity<AuthResponse> registrar(@Valid @RequestBody RegistroAuthRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.registrarYAutenticar(request));
    }

    @GetMapping("/validar")
    @Operation(summary = "Validar un token JWT de autenticación (usado por frontend y microservicios)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Resultado de validación del token"),
            @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public ResponseEntity<ValidacionAuthResponse> validarToken(
            @RequestParam(value = "token", required = false) String token,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String tokenEfectivo = (token != null && !token.isBlank()) ? token : authHeader;
        return ResponseEntity.ok(authService.validarToken(tokenEfectivo));
    }

    @GetMapping("/validar-usuario/{idUsuario}")
    @Operation(summary = "Validar si un usuario está autenticado/activo ante ms-auth")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Resultado de validación del usuario"),
            @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public ResponseEntity<ValidacionAuthResponse> validarUsuario(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(authService.validarUsuarioAutenticado(idUsuario));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar token JWT vigente con rotación segura de sesión")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Token JWT renovado correctamente"),
            @ApiResponse(responseCode = "401", description = "Token inválido, expirado o revocado")
    })
    public ResponseEntity<AuthResponse> refresh(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "token", required = false) String token) {
        String tokenEfectivo = (authHeader != null && !authHeader.isBlank()) ? authHeader : token;
        return ResponseEntity.ok(authService.renovarToken(tokenEfectivo));
    }

    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesión invalidando el token JWT activo")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Sesión cerrada y token revocado"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "404", description = "Sesión no encontrada")
    })
    public ResponseEntity<AuthResponse> logout(
            @RequestParam(value = "token", required = false) String token,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String tokenEfectivo = (token != null && !token.isBlank()) ? token : authHeader;
        return ResponseEntity.ok(authService.cerrarSesion(tokenEfectivo));
    }

    @GetMapping("/sesiones")
    @Operation(summary = "Listar todas las sesiones de autenticación (Requiere rol ADMIN)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de sesiones"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado: requiere rol ADMIN")
    })
    public ResponseEntity<List<AuthResponse>> listarSesiones() {
        return ResponseEntity.ok(authService.obtenerTodasLasSesiones());
    }

    @GetMapping("/sesiones/{id}")
    @Operation(summary = "Obtener sesión por ID (Requiere rol ADMIN)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Sesión encontrada"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado: requiere rol ADMIN"),
            @ApiResponse(responseCode = "404", description = "Sesión no encontrada")
    })
    public ResponseEntity<AuthResponse> obtenerSesionPorId(@PathVariable Long id) {
        return ResponseEntity.ok(authService.obtenerSesionPorId(id));
    }
}
