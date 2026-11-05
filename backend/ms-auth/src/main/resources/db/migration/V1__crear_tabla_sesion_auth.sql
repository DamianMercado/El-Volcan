CREATE TABLE IF NOT EXISTS sesion_auth (
    id_sesion BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    nombre_usuario VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL,
    rol VARCHAR(30) NOT NULL,
    token VARCHAR(512) NOT NULL UNIQUE,
    fecha_inicio DATETIME NOT NULL,
    fecha_expiracion DATETIME NOT NULL,
    estado VARCHAR(30) NOT NULL
);
