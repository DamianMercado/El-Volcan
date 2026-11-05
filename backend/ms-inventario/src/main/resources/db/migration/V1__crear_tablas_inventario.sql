CREATE TABLE IF NOT EXISTS inventario (
    id_inventario BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo_producto VARCHAR(30) NOT NULL UNIQUE,
    nombre_producto VARCHAR(150) NOT NULL,
    stock_actual INT NOT NULL,
    stock_minimo INT NOT NULL,
    ubicacion_bodega VARCHAR(100),
    estado_stock VARCHAR(30) NOT NULL,
    fecha_actualizacion DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS movimiento_inventario (
    id_movimiento BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_inventario BIGINT NOT NULL,
    codigo_producto VARCHAR(30) NOT NULL,
    tipo_movimiento VARCHAR(40) NOT NULL,
    cantidad INT NOT NULL,
    stock_anterior INT NOT NULL,
    stock_nuevo INT NOT NULL,
    observacion VARCHAR(250),
    estado_movimiento VARCHAR(30) NOT NULL,
    fecha_movimiento DATETIME NOT NULL
);
