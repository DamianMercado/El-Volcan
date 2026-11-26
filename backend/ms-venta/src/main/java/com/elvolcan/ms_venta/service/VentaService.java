package com.elvolcan.ms_venta.service;

import com.elvolcan.ms_venta.client.*;
import com.elvolcan.ms_venta.dto.request.ItemVentaRequest;
import com.elvolcan.ms_venta.dto.request.VentaPagoRequest;
import com.elvolcan.ms_venta.dto.request.VentaRequest;
import com.elvolcan.ms_venta.dto.response.ProductoCatalogoExternoResponse;
import com.elvolcan.ms_venta.dto.response.VentaCompletaResponse;
import com.elvolcan.ms_venta.dto.response.VentaResponse;
import com.elvolcan.ms_venta.enums.EstadoVenta;
import com.elvolcan.ms_venta.exception.VentaNoEncontradaException;
import com.elvolcan.ms_venta.mapper.VentaMapper;
import com.elvolcan.ms_venta.model.DetalleVenta;
import com.elvolcan.ms_venta.model.Venta;
import com.elvolcan.ms_venta.repository.VentaRepository;
import com.elvolcan.ms_venta.security.JwtAuthValidator;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VentaService {

    private static final Logger log = LoggerFactory.getLogger(VentaService.class);
    private static final ZoneId ZONA_CHILE = ZoneId.of("America/Santiago");
    private static final DateTimeFormatter FORMATO_HISTORIAL_CHILE =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final VentaRepository ventaRepository;
    private final VentaMapper ventaMapper;
    private final JwtAuthValidator jwtAuthValidator;
    private final RutaDespachoService rutaDespachoService;

    private final AuthClient authClient;
    private final UsuarioClient usuarioClient;
    private final CatalogoClient catalogoClient;
    private final InventarioClient inventarioClient;
    private final PagoClient pagoClient;

    public void autenticarConMsAuth(String authHeader) {
        if (authHeader != null && !authHeader.isBlank()) {
            String token = authHeader.replace("Bearer ", "").trim();
            try {
                Map<String, Object> validacion = authClient.validarToken(token);
                if (validacion == null || !Boolean.TRUE.equals(validacion.get("valido"))) {
                    throw new SecurityException("Token inválido o no autorizado por ms-auth");
                }
            } catch (SecurityException e) {
                throw e;
            } catch (Exception e) {
                log.warn("No se pudo verificar token contra ms-auth: {}", e.getMessage());
            }
        }
    }

    @Transactional(readOnly = true)
    public List<VentaResponse> obtenerTodas() {
        log.info("Obteniendo todas las ventas");
        return ventaMapper.toResponseList(ventaRepository.findAll());
    }

    @Transactional(readOnly = true)
    public VentaResponse obtenerPorId(Long id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new VentaNoEncontradaException(id));
        return ventaMapper.toResponse(venta);
    }

    private boolean perteneceAlUsuario(Venta venta, Long idUsuarioAuth, String emailAuth) {
        if (venta == null) {
            return false;
        }
        String emailVenta = venta.getEmail() != null ? venta.getEmail().trim() : "";
        String emailUsuario = emailAuth != null ? emailAuth.trim() : "";

        if (!emailVenta.isEmpty() && !emailUsuario.isEmpty()) {
            return emailVenta.equalsIgnoreCase(emailUsuario);
        }
        return idUsuarioAuth != null && idUsuarioAuth.equals(venta.getIdUsuario());
    }

    private List<Venta> buscarVentasDelUsuario(Long idUsuarioAuth, String emailAuth) {
        Map<Long, Venta> porId = new LinkedHashMap<>();
        if (idUsuarioAuth != null) {
            for (Venta v : ventaRepository.findByIdUsuario(idUsuarioAuth)) {
                if (perteneceAlUsuario(v, idUsuarioAuth, emailAuth)) {
                    porId.put(v.getId(), v);
                }
            }
        }
        if (emailAuth != null && !emailAuth.isBlank()) {
            for (Venta v : ventaRepository.findByEmailIgnoreCase(emailAuth.trim())) {
                if (perteneceAlUsuario(v, idUsuarioAuth, emailAuth)) {
                    porId.put(v.getId(), v);
                }
            }
        }
        List<Venta> resultado = new ArrayList<>(porId.values());
        for (Venta v : resultado) {
            enriquecerRutaSiFalta(v);
        }
        resultado.sort(Comparator
                .comparing(Venta::getFechaVenta, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(Venta::getId, Comparator.nullsLast(Comparator.reverseOrder())));
        return resultado;
    }

    private void enriquecerRutaSiFalta(Venta venta) {
        if (venta == null || rutaDespachoService == null) {
            return;
        }
        if (venta.getEstadoVenta() == EstadoVenta.ENTREGADO || venta.getEstadoVenta() == EstadoVenta.CANCELADA) {
            return;
        }
        Map<String, Object> entregaActual = venta.getEntrega();
        if (entregaActual != null && entregaActual.get("fuente_calculo") != null) {
            return;
        }
        try {
            boolean enRuta = venta.getEstadoVenta() == EstadoVenta.EN_RUTA;
            Map<String, Object> calculada = rutaDespachoService.calcularDatosEntrega(
                    venta.getDireccion(), venta.getComuna(), enRuta);
            if (calculada != null && !calculada.isEmpty()) {
                Map<String, Object> entrega = asegurarMapaEntrega(venta);
                entrega.putAll(calculada);
                venta.setEntrega(entrega);
                ventaRepository.save(venta);
            }
        } catch (Exception e) {
            log.warn("No se pudo enriquecer ruta real para venta {}: {}", venta.getCodigoVenta(), e.getMessage());
        }
    }

    private void actualizarRutaReal(Venta venta, boolean enRuta) {
        Map<String, Object> entrega = asegurarMapaEntrega(venta);
        if (rutaDespachoService == null) {
            return;
        }
        try {
            Map<String, Object> calculada = rutaDespachoService.calcularDatosEntrega(
                    venta.getDireccion(), venta.getComuna(), enRuta);
            if (calculada != null && !calculada.isEmpty()) {
                entrega.putAll(calculada);
            }
        } catch (Exception e) {
            log.warn("No se pudo calcular ruta real para venta {}: {}", venta.getCodigoVenta(), e.getMessage());
        }
        venta.setEntrega(entrega);
    }

    @Transactional
    public VentaResponse recalcularRuta(Long id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new VentaNoEncontradaException(id));
        boolean enRuta = venta.getEstadoVenta() == EstadoVenta.EN_RUTA;
        actualizarRutaReal(venta, enRuta);
        return ventaMapper.toResponse(ventaRepository.save(venta));
    }

    private Long extraerIdUsuarioDeMapa(Map<String, Object> usuarioToken) {
        Object raw = usuarioToken.get("idUsuario");
        if (raw instanceof Number n) {
            return n.longValue();
        }
        if (raw instanceof String s && !s.isBlank()) {
            try {
                return Long.parseLong(s.trim());
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    @Transactional
    public List<VentaResponse> obtenerMisPedidos(String authHeader) {
        Map<String, Object> usuarioToken = jwtAuthValidator.extraerUsuarioDesdeToken(authHeader);
        Long idUsuarioAuth = extraerIdUsuarioDeMapa(usuarioToken);
        String emailAuth = usuarioToken.get("email") != null ? String.valueOf(usuarioToken.get("email")) : "";
        return ventaMapper.toResponseList(buscarVentasDelUsuario(idUsuarioAuth, emailAuth));
    }

    @Transactional
    public Page<VentaResponse> obtenerMisPedidosPaginado(String authHeader, EstadoVenta estado, int page, int size) {
        Map<String, Object> usuarioToken = jwtAuthValidator.extraerUsuarioDesdeToken(authHeader);
        Long idUsuarioAuth = extraerIdUsuarioDeMapa(usuarioToken);
        String emailAuth = usuarioToken.get("email") != null ? String.valueOf(usuarioToken.get("email")) : "";

        List<Venta> propias = buscarVentasDelUsuario(idUsuarioAuth, emailAuth);
        if (estado != null) {
            propias = propias.stream()
                    .filter(v -> v.getEstadoVenta() == estado)
                    .toList();
        }

        int paginaSegura = Math.max(0, page);
        int tamanoSeguro = Math.min(Math.max(1, size), 50);
        Pageable pageable = PageRequest.of(paginaSegura, tamanoSeguro);
        int inicio = Math.min((int) pageable.getOffset(), propias.size());
        int fin = Math.min(inicio + tamanoSeguro, propias.size());
        List<VentaResponse> contenido = ventaMapper.toResponseList(propias.subList(inicio, fin));
        return new PageImpl<>(contenido, pageable, propias.size());
    }

    @Transactional(readOnly = true)
    public List<VentaResponse> obtenerPorUsuario(Long idUsuario) {
        return obtenerPorUsuario(idUsuario, null);
    }

    @Transactional(readOnly = true)
    public List<VentaResponse> obtenerPorUsuario(Long idUsuario, String authHeader) {
        String emailAuth = null;
        if (authHeader != null && !authHeader.isBlank()) {
            Map<String, Object> usuarioToken = jwtAuthValidator.extraerUsuarioDesdeToken(authHeader);
            Long idUsuarioAuth = extraerIdUsuarioDeMapa(usuarioToken);
            String rol = String.valueOf(usuarioToken.getOrDefault("rol", "CLIENTE"));
            boolean esPrivilegiado = "ADMIN".equalsIgnoreCase(rol) || "OPERADOR".equalsIgnoreCase(rol);
            if (!esPrivilegiado && idUsuarioAuth != null && !idUsuarioAuth.equals(idUsuario)) {
                throw new SecurityException("No tienes permiso para ver los pedidos de otro usuario");
            }
            if (idUsuarioAuth != null && idUsuarioAuth.equals(idUsuario)) {
                emailAuth = usuarioToken.get("email") != null ? String.valueOf(usuarioToken.get("email")) : null;
            }
        }
        return ventaMapper.toResponseList(buscarVentasDelUsuario(idUsuario, emailAuth));
    }

    @Transactional(readOnly = true)
    public Page<VentaResponse> obtenerPorUsuarioPaginado(Long idUsuario, EstadoVenta estado, int page, int size) {
        return obtenerPorUsuarioPaginado(idUsuario, estado, page, size, null);
    }

    @Transactional(readOnly = true)
    public Page<VentaResponse> obtenerPorUsuarioPaginado(
            Long idUsuario, EstadoVenta estado, int page, int size, String authHeader) {
        if (authHeader != null && !authHeader.isBlank()) {
            Map<String, Object> usuarioToken = jwtAuthValidator.extraerUsuarioDesdeToken(authHeader);
            Long idUsuarioAuth = extraerIdUsuarioDeMapa(usuarioToken);
            String rol = String.valueOf(usuarioToken.getOrDefault("rol", "CLIENTE"));
            boolean esPrivilegiado = "ADMIN".equalsIgnoreCase(rol) || "OPERADOR".equalsIgnoreCase(rol);
            if (!esPrivilegiado && idUsuarioAuth != null && !idUsuarioAuth.equals(idUsuario)) {
                throw new SecurityException("No tienes permiso para ver los pedidos de otro usuario");
            }
            if (idUsuarioAuth != null && idUsuarioAuth.equals(idUsuario)) {
                return obtenerMisPedidosPaginado(authHeader, estado, page, size);
            }
        }
        int paginaSegura = Math.max(0, page);
        int tamanoSeguro = Math.min(Math.max(1, size), 50);
        Pageable pageable = PageRequest.of(
                paginaSegura,
                tamanoSeguro,
                Sort.by(Sort.Order.desc("fechaVenta"), Sort.Order.desc("id"))
        );
        Page<Venta> paginaVentas = (estado != null)
                ? ventaRepository.findByIdUsuarioAndEstadoVenta(idUsuario, estado, pageable)
                : ventaRepository.findByIdUsuario(idUsuario, pageable);
        return paginaVentas.map(ventaMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<VentaResponse> obtenerTodasPaginado(EstadoVenta estado, int page, int size) {
        int paginaSegura = Math.max(0, page);
        int tamanoSeguro = Math.min(Math.max(1, size), 50);
        Pageable pageable = PageRequest.of(
                paginaSegura,
                tamanoSeguro,
                Sort.by(Sort.Order.desc("fechaVenta"), Sort.Order.desc("id"))
        );
        Page<Venta> paginaVentas = (estado != null)
                ? ventaRepository.findByEstadoVenta(estado, pageable)
                : ventaRepository.findAll(pageable);
        return paginaVentas.map(ventaMapper::toResponse);
    }

    private void registrarEventoAuditoria(Venta venta, String mensaje, String estado) {
        if (venta.getAuditoria() == null) {
            venta.setAuditoria(new ArrayList<>());
        }
        LocalDateTime ahoraChile = LocalDateTime.now(ZONA_CHILE);
        Map<String, Object> evento = new LinkedHashMap<>();
        evento.put("mensaje", mensaje);
        evento.put("estado", estado);
        evento.put("fecha", ahoraChile.toString());
        evento.put("fechaHoraChile", ahoraChile.format(FORMATO_HISTORIAL_CHILE));
        venta.getAuditoria().add(evento);
    }

    private Map<String, Object> asegurarMapaEntrega(Venta venta) {
        Map<String, Object> entrega = (venta.getEntrega() != null)
                ? new LinkedHashMap<>(venta.getEntrega())
                : new LinkedHashMap<>();
        String direccionCompleta = (venta.getDireccion() != null ? venta.getDireccion() : "")
                + ((venta.getComuna() != null && !venta.getComuna().isBlank()
                && (venta.getDireccion() == null || !venta.getDireccion().toLowerCase().contains(venta.getComuna().toLowerCase())))
                ? ", " + venta.getComuna()
                : "");
        entrega.putIfAbsent("direccion_entrega", direccionCompleta.trim());
        entrega.putIfAbsent("planta", (venta.getComuna() != null && !venta.getComuna().isBlank()) ? venta.getComuna() : "Puente Alto");
        venta.setEntrega(entrega);
        return entrega;
    }

    @Transactional(readOnly = true)
    public List<VentaResponse> obtenerPorEstado(EstadoVenta estado) {
        return ventaMapper.toResponseList(ventaRepository.findByEstadoVenta(estado));
    }

    @Transactional
    public VentaResponse crearVenta(VentaRequest request) {
        log.info("Generando nueva venta para cliente: {}", request.getCliente());

        if (request.getIdUsuario() != null) {
            try {
                authClient.validarUsuario(request.getIdUsuario());
            } catch (Exception e) {
                log.warn("Aviso al verificar usuario {} en ms-auth: {}", request.getIdUsuario(), e.getMessage());
            }
        }

        Venta venta = Venta.builder()
                .codigoVenta("EV-" + (100 + ventaRepository.count() + 1))
                .idUsuario(request.getIdUsuario())
                .cliente(request.getCliente())
                .rut(request.getRut())
                .email(request.getEmail())
                .telefono(request.getTelefono())
                .direccion(request.getDireccion())
                .comuna(request.getComuna())
                .observacion(request.getObservacion())
                .metodoPago(request.getMetodoPago())
                .estadoVenta(EstadoVenta.PENDIENTE)
                .estadoPago("PENDIENTE")
                .fechaVenta(LocalDateTime.now(ZONA_CHILE))
                .auditoria(new ArrayList<>())
                .items(new ArrayList<>())
                .build();

        actualizarRutaReal(venta, false);
        registrarEventoAuditoria(
                venta,
                "Pedido " + venta.getCodigoVenta() + " registrado por " + (venta.getCliente() != null ? venta.getCliente() : "Cliente"),
                "pendiente"
        );

        double totalVenta = 0.0;
        int cantidadTotalUnidades = 0;
        List<String> resumenes = new ArrayList<>();

        for (ItemVentaRequest itemReq : request.getItems()) {
            ProductoCatalogoExternoResponse producto;
            try {
                producto = catalogoClient.obtenerProductoPorCodigo(itemReq.getCodigoProducto());
            } catch (Exception e) {
                throw new IllegalArgumentException(
                        "Producto no encontrado en ms-catalogo con código: " + itemReq.getCodigoProducto());
            }

            if (producto.getStock() != null && producto.getStock() < itemReq.getCantidad()) {
                throw new IllegalArgumentException(
                        "Stock insuficiente para " + producto.getNombre() + ". Disponible: " + producto.getStock());
            }

            // Descontar stock en ms-inventario
            inventarioClient.descontarStock(
                    producto.getCodigo(),
                    itemReq.getCantidad(),
                    "Venta " + venta.getCodigoVenta() + " - Cliente: " + request.getCliente());

            double subtotal = producto.getPrecio() * itemReq.getCantidad();
            totalVenta += subtotal;
            cantidadTotalUnidades += itemReq.getCantidad();
            resumenes.add(producto.getNombre() + " x" + itemReq.getCantidad());

            DetalleVenta detalle = DetalleVenta.builder()
                    .venta(venta)
                    .codigoProducto(producto.getCodigo())
                    .nombreProducto(producto.getNombre())
                    .precioUnitario(producto.getPrecio())
                    .cantidad(itemReq.getCantidad())
                    .subtotal(subtotal)
                    .build();
            venta.getItems().add(detalle);
        }

        venta.setTotal(totalVenta);
        venta.setDetalle(cantidadTotalUnidades + " (" + String.join(", ", resumenes) + ")");

        Venta guardada = ventaRepository.save(venta);
        log.info("Venta creada exitosamente con ID: {} y código: {}", guardada.getId(), guardada.getCodigoVenta());
        return ventaMapper.toResponse(guardada);
    }

    @Transactional
    public VentaResponse confirmarPago(Long id, VentaPagoRequest request) {
        log.info("Confirmando pago ID {} para venta ID {}", request.getIdPago(), id);
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new VentaNoEncontradaException(id));

        venta.setIdPago(request.getIdPago());
        venta.setEstadoPago("PAGADO");
        registrarEventoAuditoria(venta, "Pago ID " + request.getIdPago() + " confirmado", "pagado");

        return ventaMapper.toResponse(ventaRepository.save(venta));
    }

    @Transactional
    public VentaResponse asignarRepartidor(Long id, String nombreRepartidor) {
        log.info("Asignando repartidor '{}' a la venta ID {}", nombreRepartidor, id);
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new VentaNoEncontradaException(id));

        if (venta.getEstadoVenta() == EstadoVenta.CANCELADA) {
            throw new IllegalStateException("No se puede asignar repartidor a una venta cancelada");
        }

        venta.setRepartidor(nombreRepartidor);
        venta.setEstadoVenta(EstadoVenta.EN_RUTA);
        actualizarRutaReal(venta, true);
        registrarEventoAuditoria(venta, "Estado de despacho actualizado a: en_camino", "en_camino");
        return ventaMapper.toResponse(ventaRepository.save(venta));
    }

    @Transactional
    public VentaResponse marcarEntregada(Long id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new VentaNoEncontradaException(id));

        venta.setEstadoVenta(EstadoVenta.ENTREGADO);
        venta.setEstadoPago("PAGADO");
        Map<String, Object> entrega = asegurarMapaEntrega(venta);
        entrega.put("tiempo_estimado_min", 0);
        entrega.put("distancia_km", 0.0);
        registrarEventoAuditoria(venta, "Estado de despacho actualizado a: entregado", "entregado");
        return ventaMapper.toResponse(ventaRepository.save(venta));
    }

    @Transactional
    public VentaResponse cancelarVenta(Long id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new VentaNoEncontradaException(id));

        if (venta.getEstadoVenta() == EstadoVenta.ENTREGADO) {
            throw new IllegalStateException("No se puede cancelar una venta ya entregada");
        }

        for (DetalleVenta item : venta.getItems()) {
            try {
                inventarioClient.reponerStock(
                        item.getCodigoProducto(),
                        item.getCantidad(),
                        "Reintegro por cancelación de venta " + venta.getCodigoVenta());
            } catch (Exception e) {
                log.warn("No se pudo reponer stock de {} al cancelar venta: {}",
                        item.getCodigoProducto(), e.getMessage());
            }
        }

        venta.setEstadoVenta(EstadoVenta.CANCELADA);
        registrarEventoAuditoria(venta, "Estado de despacho actualizado a: cancelada", "cancelada");
        return ventaMapper.toResponse(ventaRepository.save(venta));
    }

    @Transactional(readOnly = true)
    public VentaCompletaResponse obtenerVentaCompleta(Long id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new VentaNoEncontradaException(id));

        VentaCompletaResponse response = new VentaCompletaResponse();
        response.setVenta(ventaMapper.toResponse(venta));

        if (venta.getIdUsuario() != null) {
            try {
                response.setUsuario(usuarioClient.obtenerUsuarioPorId(venta.getIdUsuario()));
            } catch (Exception e) {
                log.warn("No se pudo obtener usuario para venta {}: {}", id, e.getMessage());
            }
        }

        if (venta.getIdPago() != null) {
            try {
                response.setPago(pagoClient.obtenerPagoPorId(venta.getIdPago()));
            } catch (Exception e) {
                log.warn("No se pudo obtener pago para venta {}: {}", id, e.getMessage());
            }
        }

        return response;
    }

    @Transactional
    public void eliminar(Long id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new VentaNoEncontradaException(id));
        ventaRepository.delete(venta);
    }
}
