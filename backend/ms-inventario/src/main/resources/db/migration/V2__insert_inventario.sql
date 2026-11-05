INSERT INTO inventario (codigo_producto, nombre_producto, stock_actual, stock_minimo, ubicacion_bodega, estado_stock, fecha_actualizacion)
VALUES
    ('AC001', 'Carro porta cilindro 11/15kg', 57, 10, 'Bodega Central - Sector Accesorios', 'OK', '2026-10-15 10:00:00'),
    ('AC002', 'Tapa protectora para válvula', 59, 25, 'Bodega Central - Sector Accesorios', 'OK', '2026-10-15 10:00:00'),
    ('AC003', 'Detector de gas a batería', 8, 20, 'Bodega Central - Sector Accesorios', 'CRITICO', '2026-10-15 10:00:00'),
    ('CL001', 'Cilindro gas licuado 5 kg', 39, 40, 'Patio Cilindros - Zona 5kg', 'BAJO', '2026-10-15 10:00:00'),
    ('CL002', 'Cilindro gas licuado 11 kg', 60, 50, 'Patio Cilindros - Zona 11kg', 'OK', '2026-10-15 10:00:00'),
    ('CL003', 'Cilindro gas licuado 15 kg', 25, 25, 'Patio Cilindros - Zona 15kg', 'OK', '2026-10-15 10:00:00'),
    ('CL004', 'Cilindro gas licuado 45 kg', 30, 20, 'Patio Cilindros - Zona 45kg', 'OK', '2026-10-15 10:00:00'),
    ('KC004', 'Kit conexión completo', 25, 15, 'Bodega Central - Sector Kits', 'OK', '2026-10-15 10:00:00'),
    ('MG001', 'Manguera gas 1.5 m', 77, 30, 'Bodega Central - Sector Mangueras', 'OK', '2026-10-15 10:00:00'),
    ('MG002', 'Manguera gas 3 m', 50, 20, 'Bodega Central - Sector Mangueras', 'OK', '2026-10-15 10:00:00'),
    ('MG003', 'Abrazadera metálica', 200, 80, 'Bodega Central - Sector Accesorios', 'OK', '2026-10-15 10:00:00'),
    ('RG001', 'Regulador doméstico estándar', 45, 20, 'Bodega Central - Sector Reguladores', 'OK', '2026-10-15 10:00:00'),
    ('RG002', 'Regulador de alta presión', 12, 15, 'Bodega Central - Sector Reguladores', 'BAJO', '2026-10-15 10:00:00'),
    ('RG003', 'Regulador dual (2 salidas)', 18, 15, 'Bodega Central - Sector Reguladores', 'OK', '2026-10-15 10:00:00');

INSERT INTO movimiento_inventario (id_inventario, codigo_producto, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, observacion, estado_movimiento, fecha_movimiento)
VALUES
    (3, 'AC003', 'SOLICITUD_REPOSICION', 30, 8, 8, 'Proveedor habitual', 'PENDIENTE', '2026-10-15 12:00:00'),
    (7, 'CL004', 'ENTRADA', 20, 10, 30, 'Reposición recibida de planta GLP', 'COMPLETADO', '2026-10-10 09:30:00');
