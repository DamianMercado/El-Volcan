package com.elvolcan.ms_catalogo.repository;

import com.elvolcan.ms_catalogo.enums.EstadoProducto;
import com.elvolcan.ms_catalogo.model.ProductoCatalogo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoCatalogoRepository extends JpaRepository<ProductoCatalogo, Long> {

    Optional<ProductoCatalogo> findByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCase(String codigo);

    List<ProductoCatalogo> findByCategoriaIgnoreCase(String categoria);

    List<ProductoCatalogo> findByEstado(EstadoProducto estado);
}
