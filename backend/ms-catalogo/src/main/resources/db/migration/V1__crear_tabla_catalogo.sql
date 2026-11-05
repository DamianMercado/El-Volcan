CREATE TABLE IF NOT EXISTS producto_catalogo (
    id_producto BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(300),
    precio DOUBLE NOT NULL,
    categoria VARCHAR(60) NOT NULL,
    imagen VARCHAR(250) NOT NULL,
    estado VARCHAR(30) NOT NULL
);
