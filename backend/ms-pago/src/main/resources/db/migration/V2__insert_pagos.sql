INSERT INTO pago (id_venta, monto_pago, metodo_pago, estado_pago, codigo_transaccion, codigo_autorizacion, tarjeta_terminacion, email_comprobante, nombre_titular, fecha_pago)
VALUES
    (1, 36980, 'webpay_debito', 'PAGADO', 'TRX-582910', 'AUT-194022', '0001', 'maria.gomez@gmail.com', 'MARIA GOMEZ', '2026-10-20 10:16:00'),
    (3, 49970, 'webpay_credito', 'PAGADO', 'TRX-748201', 'AUT-839201', '0001', 'ana.torres@gmail.com', 'ANA TORRES', '2026-10-19 16:32:00'),
    (4, 135000, 'webpay_debito', 'PAGADO', 'TRX-639104', 'AUT-512098', '0001', 'contacto@panaderiaelsol.cl', 'PANADERIA EL SOL', '2026-10-19 14:22:00'),
    (8, 23990, 'webpay_debito', 'PAGADO', 'TRX-918273', 'AUT-384756', '0001', 'pedro.salinas@gmail.com', 'PEDRO SALINAS', '2026-10-19 17:46:00');
