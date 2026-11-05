INSERT INTO sesion_auth (id_usuario, nombre_usuario, email, rol, token, fecha_inicio, fecha_expiracion, estado)
VALUES
    (1, 'Andrea Muñoz', 'admin@el-volcan.com', 'ADMIN', 'EV-TOKEN-ADMIN-001', '2026-01-01 08:00:00', '2027-12-31 23:59:59', 'ACTIVA'),
    (2, 'Operador Empleado', 'operador@el-volcan.com', 'OPERADOR', 'EV-TOKEN-OPERADOR-002', '2026-01-01 08:00:00', '2027-12-31 23:59:59', 'ACTIVA'),
    (3, 'Carlos Ruiz', 'repartidor@el-volcan.com', 'REPARTIDOR', 'EV-TOKEN-REPARTIDOR-003', '2026-01-01 08:00:00', '2027-12-31 23:59:59', 'ACTIVA'),
    (4, 'Cliente Usuario', 'cliente@el-volcan.com', 'CLIENTE', 'EV-TOKEN-CLIENTE-004', '2026-01-01 08:00:00', '2027-12-31 23:59:59', 'ACTIVA');
