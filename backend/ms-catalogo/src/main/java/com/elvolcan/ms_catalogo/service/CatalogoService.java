package com.elvolcan.ms_catalogo.service;

import com.elvolcan.ms_catalogo.client.AuthClient;
import com.elvolcan.ms_catalogo.client.InventarioClient;
import com.elvolcan.ms_catalogo.dto.request.ProductoCatalogoRequest;
import com.elvolcan.ms_catalogo.dto.response.InventarioExternoResponse;
import com.elvolcan.ms_catalogo.dto.response.ProductoCatalogoResponse;
import com.elvolcan.ms_catalogo.enums.EstadoProducto;
import com.elvolcan.ms_catalogo.exception.ProductoCatalogoNoEncontradoException;
import com.elvolcan.ms_catalogo.mapper.CatalogoMapper;
import com.elvolcan.ms_catalogo.model.ProductoCatalogo;
import com.elvolcan.ms_catalogo.repository.ProductoCatalogoRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CatalogoService {

    private static final Logger log = LoggerFactory.getLogger(CatalogoService.class);

    private final ProductoCatalogoRepository catalogoRepository;
    private final CatalogoMapper catalogoMapper;
    private final InventarioClient inventarioClient;
    private final AuthClient authClient;

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

    private ProductoCatalogoResponse enriquecerConInventarioEImagen(ProductoCatalogo producto) {
        ProductoCatalogoResponse response = catalogoMapper.toResponse(producto);
        response.setImagenEndpoint("/api/v1/catalogo/imagenes/" + producto.getCodigo() + ".webp");

        try {
            InventarioExternoResponse inv = inventarioClient.obtenerStockPorCodigo(producto.getCodigo());
            if (inv != null) {
                response.setStock(inv.getStockActual());
                response.setMinimo(inv.getStockMinimo());
                response.setEstadoStock(inv.getEstadoStock());
            } else {
                response.setStock(0);
                response.setMinimo(0);
                response.setEstadoStock("SIN_STOCK");
            }
        } catch (Exception e) {
            log.warn("No se pudo consultar ms-inventario para el producto {}: {}", producto.getCodigo(), e.getMessage());
            response.setStock(0);
            response.setMinimo(0);
            response.setEstadoStock("SIN_CONEXION_INVENTARIO");
        }

        return response;
    }

    @Transactional(readOnly = true)
    public List<ProductoCatalogoResponse> obtenerTodos() {
        log.info("Obteniendo catálogo completo con stock desde ms-inventario e imágenes para el frontend");
        return catalogoRepository.findAll()
                .stream()
                .map(this::enriquecerConInventarioEImagen)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductoCatalogoResponse obtenerPorId(Long id) {
        ProductoCatalogo producto = catalogoRepository.findById(id)
                .orElseThrow(() -> new ProductoCatalogoNoEncontradoException(id));
        return enriquecerConInventarioEImagen(producto);
    }

    @Transactional(readOnly = true)
    public ProductoCatalogoResponse obtenerPorCodigo(String codigo) {
        ProductoCatalogo producto = catalogoRepository.findByCodigoIgnoreCase(codigo.trim())
                .orElseThrow(() -> new ProductoCatalogoNoEncontradoException(
                        "Producto no encontrado con código: " + codigo));
        return enriquecerConInventarioEImagen(producto);
    }

    @Transactional(readOnly = true)
    public List<ProductoCatalogoResponse> obtenerPorCategoria(String categoria) {
        return catalogoRepository.findByCategoriaIgnoreCase(categoria.trim())
                .stream()
                .map(this::enriquecerConInventarioEImagen)
                .toList();
    }

    @Transactional
    public ProductoCatalogoResponse crear(ProductoCatalogoRequest request) {
        if (catalogoRepository.existsByCodigoIgnoreCase(request.getCodigo().trim())) {
            throw new IllegalArgumentException("Ya existe un producto con el código: " + request.getCodigo());
        }

        ProductoCatalogo producto = catalogoMapper.toEntity(request);
        producto.setCodigo(request.getCodigo().toUpperCase().trim());
        if (producto.getEstado() == null) {
            producto.setEstado(EstadoProducto.ACTIVO);
        }

        ProductoCatalogo guardado = catalogoRepository.save(producto);
        return enriquecerConInventarioEImagen(guardado);
    }

    @Transactional
    public ProductoCatalogoResponse actualizar(Long id, ProductoCatalogoRequest request) {
        ProductoCatalogo producto = catalogoRepository.findById(id)
                .orElseThrow(() -> new ProductoCatalogoNoEncontradoException(id));

        producto.setCodigo(request.getCodigo().toUpperCase().trim());
        producto.setNombre(request.getNombre());
        producto.setDescripcion(request.getDescripcion());
        producto.setPrecio(request.getPrecio());
        producto.setCategoria(request.getCategoria());
        producto.setImagen(request.getImagen());
        if (request.getEstado() != null) {
            producto.setEstado(request.getEstado());
        }

        ProductoCatalogo actualizado = catalogoRepository.save(producto);
        return enriquecerConInventarioEImagen(actualizado);
    }

    @Transactional
    public ProductoCatalogoResponse actualizarImagen(Long id, String nuevaRutaImagen) {
        ProductoCatalogo producto = catalogoRepository.findById(id)
                .orElseThrow(() -> new ProductoCatalogoNoEncontradoException(id));
        producto.setImagen(nuevaRutaImagen);
        return enriquecerConInventarioEImagen(catalogoRepository.save(producto));
    }

    @Transactional
    public void eliminar(Long id) {
        ProductoCatalogo producto = catalogoRepository.findById(id)
                .orElseThrow(() -> new ProductoCatalogoNoEncontradoException(id));
        producto.setEstado(EstadoProducto.ELIMINADO);
        catalogoRepository.save(producto);
    }

    public Resource obtenerArchivoImagen(String nombreArchivo) {
        String archivoNormalizado = nombreArchivo.endsWith(".webp")
                ? nombreArchivo
                : nombreArchivo + ".webp";
        Resource resource = new ClassPathResource("static/imagenes/productos/" + archivoNormalizado);
        if (!resource.exists()) {
            throw new ProductoCatalogoNoEncontradoException("Imagen no encontrada: " + nombreArchivo);
        }
        return resource;
    }
}
