INSERT INTO venta (codigo_venta, id_usuario, cliente, rut, email, telefono, direccion, comuna, observacion, detalle, total, metodo_pago, estado_venta, estado_pago, id_pago, repartidor, fecha_venta)
VALUES
    ('EV-101', 4, 'Maria Gomez', '12345678-1', 'maria.gomez@gmail.com', '+56 9 9111 2222', 'Calle Las Flores #23', 'Puente Alto', 'Casa esquina', '2 (5kg x1, 11kg x1)', 36980, 'pagar_ahora', 'EN_RUTA', 'PAGADO', 1, 'Carlos Ruiz', '2026-10-20 10:15:00'),
    ('EV-102', 4, 'Juan Perez', '13456789-2', 'juan.perez@gmail.com', '+56 9 9222 3333', 'Av. Central #45', 'Puente Alto', 'Tocar timbre 2', '1 (15kg x1)', 31990, 'repartidor', 'EN_RUTA', 'PENDIENTE', NULL, 'Carlos Ruiz', '2026-10-20 11:00:00'),
    ('EV-103', 4, 'Ana Torres', '14567890-3', 'ana.torres@gmail.com', '+56 9 9333 4444', 'Barrio San Jose #10', 'La Florida', '', '3 (5kg x2, 11kg x1)', 49970, 'pagar_ahora', 'ENTREGADO', 'PAGADO', 2, 'Carlos Ruiz', '2026-10-19 16:30:00'),
    ('EV-104', 4, 'Panadería El Sol', '76123456-7', 'contacto@panaderiaelsol.cl', '+56 9 9444 1111', 'Calle Lagos 980', 'La Florida', 'Entregar por acceso lateral', '3 (45kg x3)', 135000, 'pagar_ahora', 'ENTREGADO', 'PAGADO', 3, 'Diego Fuentes', '2026-10-19 14:20:00'),
    ('EV-105', 4, 'Restaurante La Picada', '77654321-8', 'administracion@lapicada.cl', '+56 9 9555 2222', 'Av. O''Higgins 1520', 'La Florida', 'Cocina principal', '2 (45kg x1, regulador alta presión x1)', 63990, 'repartidor', 'EN_RUTA', 'PENDIENTE', NULL, 'Diego Fuentes', '2026-10-20 11:45:00'),
    ('EV-106', 4, 'Jorge Soto', '15678901-4', 'jorge.soto@gmail.com', '+56 9 9444 5555', 'Pasaje Los Robles 45', 'Puente Alto', 'Reja blanca', '2 (11kg x2)', 47980, 'repartidor', 'PENDIENTE', 'PENDIENTE', NULL, NULL, '2026-10-20 12:30:00'),
    ('EV-107', 4, 'Camila Reyes', '16789012-5', 'camila.reyes@gmail.com', '+56 9 9666 7777', 'Av. Central #120', 'Puente Alto', 'Depto 204', '1 (detector de gas x1)', 19990, 'repartidor', 'PENDIENTE', 'PENDIENTE', NULL, NULL, '2026-10-20 13:10:00'),
    ('EV-108', 4, 'Pedro Salinas', '17890123-6', 'pedro.salinas@gmail.com', '+56 9 9777 8888', 'Pasaje Los Aromos #5', 'Puente Alto', 'Portón de madera', '1 (11kg x1)', 23990, 'pagar_ahora', 'ENTREGADO', 'PAGADO', 4, 'Valentina Soto', '2026-10-19 17:45:00'),
    ('EV-109', 4, 'Almacén Don Luis', '78901234-9', 'donluis.almacen@gmail.com', '+56 9 9888 9999', 'Calle Maipón 340', 'Puente Alto', 'Local comercial esquina', '4 (15kg x4)', 127960, 'repartidor', 'EN_RUTA', 'PENDIENTE', NULL, 'Valentina Soto', '2026-10-20 12:05:00');

INSERT INTO detalle_venta (id_venta, codigo_producto, nombre_producto, precio_unitario, cantidad, subtotal)
VALUES
    (1, 'CL001', 'Cilindro gas licuado 5 kg', 12990, 1, 12990),
    (1, 'CL002', 'Cilindro gas licuado 11 kg', 23990, 1, 23990),
    (2, 'CL003', 'Cilindro gas licuado 15 kg', 31990, 1, 31990),
    (3, 'CL001', 'Cilindro gas licuado 5 kg', 12990, 2, 25980),
    (3, 'CL002', 'Cilindro gas licuado 11 kg', 23990, 1, 23990),
    (4, 'CL004', 'Cilindro gas licuado 45 kg', 45000, 3, 135000),
    (5, 'CL004', 'Cilindro gas licuado 45 kg', 45000, 1, 45000),
    (5, 'RG002', 'Regulador de alta presión', 18990, 1, 18990),
    (6, 'CL002', 'Cilindro gas licuado 11 kg', 23990, 2, 47980),
    (7, 'AC003', 'Detector de gas a batería', 19990, 1, 19990),
    (8, 'CL002', 'Cilindro gas licuado 11 kg', 23990, 1, 23990),
    (9, 'CL003', 'Cilindro gas licuado 15 kg', 31990, 4, 127960);
