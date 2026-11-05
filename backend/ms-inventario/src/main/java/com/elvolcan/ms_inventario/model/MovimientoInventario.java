package com.elvolcan.ms_inventario.model;

import com.elvolcan.ms_inventario.enums.EstadoMovimiento;
import com.elvolcan.ms_inventario.enums.TipoMovimiento;
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
@Table(name = "movimiento_inventario")
public class MovimientoInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento")
    private Long id;

    @Column(name = "id_inventario", nullable = false)
    private Long idInventario;

    @Column(name = "codigo_producto", nullable = false, length = 30)
    private String codigoProducto;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_movimiento", nullable = false, length = 40)
    private TipoMovimiento tipoMovimiento;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "stock_anterior", nullable = false)
    private Integer stockAnterior;

    @Column(name = "stock_nuevo", nullable = false)
    private Integer stockNuevo;

    @Column(name = "observacion", length = 250)
    private String observacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_movimiento", nullable = false, length = 30)
    private EstadoMovimiento estadoMovimiento;

    @Column(name = "fecha_movimiento", nullable = false)
    private LocalDateTime fechaMovimiento;
}
