CREATE TABLE IF NOT EXISTS pago (
    id_pago BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_venta BIGINT NOT NULL,
    monto_pago DOUBLE NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    estado_pago VARCHAR(30) NOT NULL,
    codigo_transaccion VARCHAR(50) NOT NULL,
    codigo_autorizacion VARCHAR(50) NOT NULL,
    tarjeta_terminacion VARCHAR(10),
    email_comprobante VARCHAR(100),
    nombre_titular VARCHAR(150),
    fecha_pago DATETIME NOT NULL
);
