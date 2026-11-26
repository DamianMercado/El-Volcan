package com.elvolcan.ms_venta.controller;

import com.elvolcan.ms_venta.dto.request.VentaPagoRequest;
import com.elvolcan.ms_venta.dto.request.VentaRequest;
import com.elvolcan.ms_venta.dto.response.VentaCompletaResponse;
import com.elvolcan.ms_venta.dto.response.VentaResponse;
import com.elvolcan.ms_venta.enums.EstadoVenta;
import com.elvolcan.ms_venta.service.VentaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ventas")
@RequiredArgsConstructor
@Tag(name = "Ventas", description = "Generación y gestión de ventas de clientes de El Volcán")
public class VentaController {

    private final VentaService ventaService;

    @GetMapping
    @Operation(summary = "Obtener todas las ventas")
    public ResponseEntity<List<VentaResponse>> obtenerTodas(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        ventaService.autenticarConMsAuth(authHeader);
        return ResponseEntity.ok(ventaService.obtenerTodas());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener venta por ID")
    public ResponseEntity<VentaResponse> obtenerPorId(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        ventaService.autenticarConMsAuth(authHeader);
        return ResponseEntity.ok(ventaService.obtenerPorId(id));
    }

    @GetMapping("/{id}/completa")
    @Operation(summary = "Obtener venta completa enriquecida con datos de ms-usuario y ms-pago")
    public ResponseEntity<VentaCompletaResponse> obtenerVentaCompleta(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        ventaService.autenticarConMsAuth(authHeader);
        return ResponseEntity.ok(ventaService.obtenerVentaCompleta(id));
    }

    @GetMapping("/paginado")
    @Operation(summary = "Obtener todas las ventas de forma paginada")
    public ResponseEntity<Page<VentaResponse>> obtenerTodasPaginado(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) EstadoVenta estado,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        ventaService.autenticarConMsAuth(authHeader);
        return ResponseEntity.ok(ventaService.obtenerTodasPaginado(estado, page, size));
    }

    @GetMapping("/mis-pedidos")
    @Operation(summary = "Obtener únicamente los pedidos del usuario autenticado (JWT)")
    public ResponseEntity<List<VentaResponse>> obtenerMisPedidos(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        ventaService.autenticarConMsAuth(authHeader);
        return ResponseEntity.ok(ventaService.obtenerMisPedidos(authHeader));
    }

    @GetMapping("/mis-pedidos/paginado")
    @Operation(summary = "Obtener únicamente los pedidos paginados del usuario autenticado (JWT)")
    public ResponseEntity<Page<VentaResponse>> obtenerMisPedidosPaginado(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) EstadoVenta estado,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        ventaService.autenticarConMsAuth(authHeader);
        return ResponseEntity.ok(ventaService.obtenerMisPedidosPaginado(authHeader, estado, page, size));
    }

    @GetMapping("/usuario/{idUsuario}")
    @Operation(summary = "Obtener ventas de un cliente por su ID de usuario")
    public ResponseEntity<List<VentaResponse>> obtenerPorUsuario(
            @PathVariable Long idUsuario,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        ventaService.autenticarConMsAuth(authHeader);
        return ResponseEntity.ok(ventaService.obtenerPorUsuario(idUsuario, authHeader));
    }

    @GetMapping("/usuario/{idUsuario}/paginado")
    @Operation(summary = "Obtener ventas paginadas de un cliente para seguimiento")
    public ResponseEntity<Page<VentaResponse>> obtenerPorUsuarioPaginado(
            @PathVariable Long idUsuario,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) EstadoVenta estado,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        ventaService.autenticarConMsAuth(authHeader);
        return ResponseEntity.ok(ventaService.obtenerPorUsuarioPaginado(idUsuario, estado, page, size, authHeader));
    }

    @GetMapping("/estado/{estado}")
    @Operation(summary = "Obtener ventas por estado (PENDIENTE, EN_RUTA, ENTREGADO, CANCELADA)")
    public ResponseEntity<List<VentaResponse>> obtenerPorEstado(
            @PathVariable EstadoVenta estado,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        ventaService.autenticarConMsAuth(authHeader);
        return ResponseEntity.ok(ventaService.obtenerPorEstado(estado));
    }

    @PostMapping
    @Operation(summary = "Generar una nueva venta de cliente (consulta catálogo y descuenta stock en ms-inventario)")
    public ResponseEntity<VentaResponse> crearVenta(
            @Valid @RequestBody VentaRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        ventaService.autenticarConMsAuth(authHeader);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ventaService.crearVenta(request));
    }

    @PutMapping("/{id}/confirmar-pago")
    @Operation(summary = "Confirmar el pago de una venta (consumido por ms-pago)")
    public ResponseEntity<VentaResponse> confirmarPago(
            @PathVariable Long id,
            @Valid @RequestBody VentaPagoRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        ventaService.autenticarConMsAuth(authHeader);
        return ResponseEntity.ok(ventaService.confirmarPago(id, request));
    }

    @PutMapping("/{id}/asignar-repartidor")
    @Operation(summary = "Asignar un repartidor a una venta y cambiar su estado a EN_RUTA")
    public ResponseEntity<VentaResponse> asignarRepartidor(
            @PathVariable Long id,
            @RequestParam("repartidor") String repartidor,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        ventaService.autenticarConMsAuth(authHeader);
        return ResponseEntity.ok(ventaService.asignarRepartidor(id, repartidor));
    }

    @PutMapping("/{id}/recalcular-ruta")
    @Operation(summary = "Recalcular distancia y tiempo estimado real de despacho usando Nominatim + OSRM")
    public ResponseEntity<VentaResponse> recalcularRuta(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        ventaService.autenticarConMsAuth(authHeader);
        return ResponseEntity.ok(ventaService.recalcularRuta(id));
    }

    @PutMapping("/{id}/entregar")
    @Operation(summary = "Marcar una venta como ENTREGADO")
    public ResponseEntity<VentaResponse> marcarEntregada(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        ventaService.autenticarConMsAuth(authHeader);
        return ResponseEntity.ok(ventaService.marcarEntregada(id));
    }

    @PutMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar una venta y reponer su stock en ms-inventario")
    public ResponseEntity<VentaResponse> cancelarVenta(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        ventaService.autenticarConMsAuth(authHeader);
        return ResponseEntity.ok(ventaService.cancelarVenta(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una venta")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        ventaService.autenticarConMsAuth(authHeader);
        ventaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
