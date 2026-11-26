package com.elvolcan.ms_venta.service;

import com.elvolcan.ms_venta.client.*;
import com.elvolcan.ms_venta.dto.response.VentaResponse;
import com.elvolcan.ms_venta.enums.EstadoVenta;
import com.elvolcan.ms_venta.mapper.VentaMapper;
import com.elvolcan.ms_venta.model.Venta;
import com.elvolcan.ms_venta.repository.VentaRepository;
import com.elvolcan.ms_venta.security.JwtAuthValidator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VentaServiceTest {

    @Mock
    private VentaRepository ventaRepository;

    @Mock
    private VentaMapper ventaMapper;

    @Mock
    private JwtAuthValidator jwtAuthValidator;

    @Mock
    private RutaDespachoService rutaDespachoService;

    @Mock
    private AuthClient authClient;

    @Mock
    private UsuarioClient usuarioClient;

    @Mock
    private CatalogoClient catalogoClient;

    @Mock
    private InventarioClient inventarioClient;

    @Mock
    private PagoClient pagoClient;

    @InjectMocks
    private VentaService ventaService;

    @Test
    void obtenerPorId_debeRetornarVenta() {
        Venta v = Venta.builder().id(1L).codigoVenta("EV-101").estadoVenta(EstadoVenta.EN_RUTA).build();
        VentaResponse r = VentaResponse.builder().id(1L).codigoVenta("EV-101").estadoVenta(EstadoVenta.EN_RUTA).build();

        when(ventaRepository.findById(1L)).thenReturn(Optional.of(v));
        when(ventaMapper.toResponse(v)).thenReturn(r);

        VentaResponse res = ventaService.obtenerPorId(1L);
        assertEquals("EV-101", res.getCodigoVenta());
    }

    @Test
    void obtenerPorUsuarioPaginado_debeRetornarPaginaDeVentas() {
        Venta v1 = Venta.builder().id(10L).codigoVenta("EV-110").idUsuario(4L).estadoVenta(EstadoVenta.EN_RUTA).build();
        VentaResponse r1 = VentaResponse.builder().id(10L).codigoVenta("EV-110").idUsuario(4L).estadoVenta(EstadoVenta.EN_RUTA).build();
        Page<Venta> pagina = new PageImpl<>(List.of(v1));

        when(ventaRepository.findByIdUsuario(eq(4L), any(Pageable.class))).thenReturn(pagina);
        when(ventaMapper.toResponse(v1)).thenReturn(r1);

        Page<VentaResponse> res = ventaService.obtenerPorUsuarioPaginado(4L, null, 0, 5);
        assertEquals(1, res.getTotalElements());
        assertEquals("EV-110", res.getContent().get(0).getCodigoVenta());
    }

    @Test
    void obtenerMisPedidos_soloRetornaPedidosDelUsuarioAutenticado() {
        Venta propia = Venta.builder().id(10L).codigoVenta("EV-110").idUsuario(4L).email("cliente@el-volcan.com").estadoVenta(EstadoVenta.EN_RUTA).build();
        Venta ajena = Venta.builder().id(1L).codigoVenta("EV-101").idUsuario(4L).email("maria.gomez@gmail.com").estadoVenta(EstadoVenta.EN_RUTA).build();
        VentaResponse rPropia = VentaResponse.builder().id(10L).codigoVenta("EV-110").idUsuario(4L).email("cliente@el-volcan.com").build();

        when(jwtAuthValidator.extraerUsuarioDesdeToken("Bearer token-valido"))
                .thenReturn(Map.of("idUsuario", 4L, "email", "cliente@el-volcan.com", "rol", "CLIENTE"));
        when(ventaRepository.findByIdUsuario(4L)).thenReturn(List.of(propia, ajena));
        when(ventaRepository.findByEmailIgnoreCase("cliente@el-volcan.com")).thenReturn(List.of(propia));
        when(ventaMapper.toResponseList(List.of(propia))).thenReturn(List.of(rPropia));

        List<VentaResponse> res = ventaService.obtenerMisPedidos("Bearer token-valido");
        assertEquals(1, res.size());
        assertEquals("EV-110", res.get(0).getCodigoVenta());
    }
}
