package com.elvolcan.ms_inventario.model;

import com.elvolcan.ms_inventario.enums.EstadoStock;
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
@Table(name = "inventario")
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inventario")
    private Long id;

    @Column(name = "codigo_producto", nullable = false, unique = true, length = 30)
    private String codigoProducto;

    @Column(name = "nombre_producto", nullable = false, length = 150)
    private String nombreProducto;

    @Column(name = "stock_actual", nullable = false)
    private Integer stockActual;

    @Column(name = "stock_minimo", nullable = false)
    private Integer stockMinimo;

    @Column(name = "ubicacion_bodega", length = 100)
    private String ubicacionBodega;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_stock", nullable = false, length = 30)
    private EstadoStock estadoStock;

    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;
}
