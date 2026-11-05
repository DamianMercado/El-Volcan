package com.elvolcan.ms_inventario.repository;

import com.elvolcan.ms_inventario.model.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Long> {

    Optional<Inventario> findByCodigoProductoIgnoreCase(String codigoProducto);

    boolean existsByCodigoProductoIgnoreCase(String codigoProducto);
}
