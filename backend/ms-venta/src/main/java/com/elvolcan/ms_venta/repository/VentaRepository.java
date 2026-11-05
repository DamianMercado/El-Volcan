package com.elvolcan.ms_venta.repository;

import com.elvolcan.ms_venta.enums.EstadoVenta;
import com.elvolcan.ms_venta.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {

    Optional<Venta> findByCodigoVenta(String codigoVenta);

    List<Venta> findByIdUsuario(Long idUsuario);

    List<Venta> findByEstadoVenta(EstadoVenta estadoVenta);
}
