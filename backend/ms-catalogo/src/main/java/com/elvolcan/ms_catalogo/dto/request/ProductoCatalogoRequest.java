package com.elvolcan.ms_catalogo.dto.request;

import com.elvolcan.ms_catalogo.enums.EstadoProducto;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Datos para crear o actualizar un producto en el catálogo")
public class ProductoCatalogoRequest {

    @NotBlank(message = "El código es obligatorio")
    @Schema(example = "CL001")
    private String codigo;

    @NotBlank(message = "El nombre es obligatorio")
    @Schema(example = "Cilindro gas licuado 5 kg")
    private String nombre;

    @Schema(example = "Cilindro portátil de gas licuado ideal para estufas y cocinillas")
    private String descripcion;

    @NotNull(message = "El precio es obligatorio")
    @Min(value = 1, message = "El precio debe ser mayor a 0")
    @Schema(example = "12990")
    private Double precio;

    @NotBlank(message = "La categoría es obligatoria")
    @Schema(example = "Cilindros")
    private String categoria;

    @NotBlank(message = "La ruta o URL de la imagen es obligatoria")
    @Schema(example = "/src/assets/img/productos/CL001.webp")
    private String imagen;

    @Schema(example = "ACTIVO")
    private EstadoProducto estado;
}
