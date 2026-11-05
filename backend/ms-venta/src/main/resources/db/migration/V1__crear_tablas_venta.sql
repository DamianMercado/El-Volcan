CREATE TABLE IF NOT EXISTS venta (
    id_venta BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo_venta VARCHAR(30) NOT NULL UNIQUE,
    id_usuario BIGINT,
    cliente VARCHAR(150) NOT NULL,
    rut VARCHAR(20),
    email VARCHAR(100),
    telefono VARCHAR(30),
    direccion VARCHAR(250) NOT NULL,
    comuna VARCHAR(100),
    observacion VARCHAR(250),
    detalle VARCHAR(300),
    total DOUBLE NOT NULL,
    metodo_pago VARCHAR(40) NOT NULL,
    estado_venta VARCHAR(30) NOT NULL,
    estado_pago VARCHAR(30) NOT NULL,
    id_pago BIGINT,
    repartidor VARCHAR(100),
    fecha_venta DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS detalle_venta (
    id_detalle BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_venta BIGINT NOT NULL,
    codigo_producto VARCHAR(30) NOT NULL,
    nombre_producto VARCHAR(150) NOT NULL,
    precio_unitario DOUBLE NOT NULL,
    cantidad INT NOT NULL,
    subtotal DOUBLE NOT NULL,
    CONSTRAINT fk_detalle_venta FOREIGN KEY (id_venta) REFERENCES venta (id_venta) ON DELETE CASCADE
);
