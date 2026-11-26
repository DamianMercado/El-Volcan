package com.elvolcan.ms_venta.repository;

import com.elvolcan.ms_venta.enums.EstadoVenta;
import com.elvolcan.ms_venta.model.Venta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VentaRepository extends MongoRepository<Venta, Long> {

    Optional<Venta> findByCodigoVenta(String codigoVenta);

    List<Venta> findByIdUsuario(Long idUsuario);

    List<Venta> findByEmailIgnoreCase(String email);

    Page<Venta> findByIdUsuario(Long idUsuario, Pageable pageable);

    Page<Venta> findByIdUsuarioAndEstadoVenta(Long idUsuario, EstadoVenta estadoVenta, Pageable pageable);

    List<Venta> findByEstadoVenta(EstadoVenta estadoVenta);

    Page<Venta> findByEstadoVenta(EstadoVenta estadoVenta, Pageable pageable);
}
