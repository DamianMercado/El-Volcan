package com.elvolcan.ms_pago.model;

import com.elvolcan.ms_pago.enums.EstadoPago;
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
@Table(name = "pago")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Long id;

    @Column(name = "id_venta", nullable = false)
    private Long idVenta;

    @Column(name = "monto_pago", nullable = false)
    private Double montoPago;

    @Column(name = "metodo_pago", nullable = false, length = 50)
    private String metodoPago;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_pago", nullable = false, length = 30)
    private EstadoPago estadoPago;

    @Column(name = "codigo_transaccion", nullable = false, length = 50)
    private String codigoTransaccion;

    @Column(name = "codigo_autorizacion", nullable = false, length = 50)
    private String codigoAutorizacion;

    @Column(name = "tarjeta_terminacion", length = 10)
    private String tarjetaTerminacion;

    @Column(name = "email_comprobante", length = 100)
    private String emailComprobante;

    @Column(name = "nombre_titular", length = 150)
    private String nombreTitular;

    @Column(name = "fecha_pago", nullable = false)
    private LocalDateTime fechaPago;
}
