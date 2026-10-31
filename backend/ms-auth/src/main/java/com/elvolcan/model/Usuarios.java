package com.elvolcan.model;

import com.elvolcan.enums.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
public class Usuarios {
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Entity
    @Table(name = "usuario")
    public class Usuario {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "id_usuario")
        private Long id;

        @Column(name = "nombres", nullable = false, length = 100)
        private String nombre;

        @Column(name = "apellidos", nullable = false, length = 100)
        private String apellido;

        @Column(name = "password", nullable = false, length = 100)
        private String password;

        @Column(name = "email", nullable = false, unique = true, length = 100)
        private String email;

        @Column(name = "rut", nullable = false, unique = true, length = 12)
        private String rut;

        @Enumerated(EnumType.STRING)
        @Column(name = "rol", nullable = false, length = 30)
        private Rol rol;
    }
}
