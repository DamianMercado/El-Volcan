package com.elvolcan.ms_catalogo.client;

import com.elvolcan.ms_catalogo.dto.response.InventarioExternoResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "ms-inventario")
public interface InventarioClient {

    @GetMapping("/api/v1/inventario/codigo/{codigoProducto}")
    InventarioExternoResponse obtenerStockPorCodigo(@PathVariable("codigoProducto") String codigoProducto);
}
