package com.elvolcan.ms_auth.model;

import com.elvolcan.ms_auth.enums.EstadoSesion;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "sesion_auth")
public class SesionAuth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sesion")
    private Long id;

    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

    @Column(name = "nombre_usuario", nullable = false, length = 150)
    private String nombreUsuario;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "rol", nullable = false, length = 30)
    private String rol;

    @Column(name = "token", nullable = false, unique = true, length = 512)
    private String token;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_expiracion", nullable = false)
    private LocalDateTime fechaExpiracion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    private EstadoSesion estado;
}
