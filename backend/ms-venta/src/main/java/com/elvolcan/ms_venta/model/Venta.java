package com.elvolcan.ms_venta.model;

import com.elvolcan.ms_venta.enums.EstadoVenta;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "venta")
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_venta")
    private Long id;

    @Column(name = "codigo_venta", nullable = false, unique = true, length = 30)
    private String codigoVenta;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "cliente", nullable = false, length = 150)
    private String cliente;

    @Column(name = "rut", length = 20)
    private String rut;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "telefono", length = 30)
    private String telefono;

    @Column(name = "direccion", nullable = false, length = 250)
    private String direccion;

    @Column(name = "comuna", length = 100)
    private String comuna;

    @Column(name = "observacion", length = 250)
    private String observacion;

    @Column(name = "detalle", length = 300)
    private String detalle;

    @Column(name = "total", nullable = false)
    private Double total;

    @Column(name = "metodo_pago", nullable = false, length = 40)
    private String metodoPago;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_venta", nullable = false, length = 30)
    private EstadoVenta estadoVenta;

    @Column(name = "estado_pago", nullable = false, length = 30)
    private String estadoPago;

    @Column(name = "id_pago")
    private Long idPago;

    @Column(name = "repartidor", length = 100)
    private String repartidor;

    @Column(name = "fecha_venta", nullable = false)
    private LocalDateTime fechaVenta;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<DetalleVenta> items = new ArrayList<>();
}
