import { describe, it, expect, beforeEach } from "vitest";
import {
  crearNuevoPedido,
  obtenerPedidos,
  obtenerUltimoPedido,
  actualizarEstadoPago,
} from "../assets/data/pedidos.js";

describe("Pruebas Unitarias - Lógica de Negocio: Gestión de Pedidos", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("5. crearNuevoPedido genera un pedido con ID numérico secuencial, datos del cliente y estado inicial pendiente", () => {
    const datosPrueba = {
      cliente: "Carlos Valenzuela",
      telefono: "+56 9 8888 7777",
      rut: "18.345.678-9",
      email: "carlos@correo.cl",
      direccion: "Av. Las Perdices 123, Puente Alto",
      items: [
        {
          producto: { codigo: "CL002", nombre: "Cilindro 11 kg", precio: 23990 },
          cantidad: 2,
          subtotal: 47980,
        },
      ],
      total: 47980,
      metodoPago: "repartidor",
      subMetodoPago: "efectivo",
    };

    const pedido = crearNuevoPedido(datosPrueba);

    expect(pedido).toBeDefined();
    expect(Number(pedido.id)).toBeGreaterThan(0);
    expect(pedido.codigo).toBe(`EV-${pedido.id}`);
    expect(pedido.cliente).toBe("Carlos Valenzuela");
    expect(pedido.total).toBe(47980);
    expect(pedido.estado).toBe("Pendiente");
    expect(pedido.estadoPago).toBe("pendiente");

    const listaGuardada = obtenerPedidos();
    expect(listaGuardada.some((p) => String(p.id) === String(pedido.id))).toBe(true);
  });

  it("6. actualizarEstadoPago modifica el estado a 'pagado' y asigna códigos de transacción y autorización", () => {
    const datosPedido = {
      cliente: "Mariana Soto",
      total: 31990,
      metodoPago: "pagar_ahora",
      subMetodoPago: "webpay",
    };

    const nuevo = crearNuevoPedido(datosPedido);
    expect(nuevo.estadoPago).toBe("pendiente");

    const pedidoActualizado = actualizarEstadoPago(nuevo.id, {
      estadoPago: "pagado",
      subMetodoPago: "webpay_debito",
      codigoTransaccion: "TRX-TEST-999",
      codigoAutorizacion: "AUT-TEST-888",
    });

    expect(pedidoActualizado.estadoPago).toBe("pagado");
    expect(pedidoActualizado.subMetodoPago).toBe("webpay_debito");
    expect(pedidoActualizado.codigoTransaccion).toBe("TRX-TEST-999");
    expect(pedidoActualizado.codigoAutorizacion).toBe("AUT-TEST-888");
  });

  it("7. obtenerUltimoPedido retorna el último pedido registrado en la sesión", () => {
    crearNuevoPedido({ cliente: "Cliente 1", total: 10000 });
    const pedidoB = crearNuevoPedido({ cliente: "Cliente 2", total: 20000 });

    const ultimo = obtenerUltimoPedido();
    expect(ultimo).toBeDefined();
    expect(String(ultimo.id)).toBe(String(pedidoB.id));
    expect(ultimo.cliente).toBe("Cliente 2");
  });
});
