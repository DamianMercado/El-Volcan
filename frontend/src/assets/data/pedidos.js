// Gestión y persistencia de pedidos de clientes en localStorage
import { pedidosClientesIniciales } from "./administracion.js";
import { fechaDeHoy } from "./utilidades.js";

const CLAVE_PEDIDOS = "pedidos_clientes_registrados";
const CLAVE_ULTIMO_PEDIDO = "ultimo_pedido_creado";

/**
 * Obtiene la lista de pedidos (iniciales + creados por clientes).
 */
export function obtenerPedidos() {
  try {
    const guardados = localStorage.getItem(CLAVE_PEDIDOS);
    if (!guardados) {
      localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify(pedidosClientesIniciales));
      return [...pedidosClientesIniciales];
    }
    return JSON.parse(guardados);
  } catch {
    return [...pedidosClientesIniciales];
  }
}

/**
 * Guarda la lista completa de pedidos en localStorage.
 */
export function guardarListaPedidos(lista) {
  try {
    localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify(lista));
  } catch (error) {
    console.error("Error al guardar pedidos:", error);
  }
}

/**
 * Genera el siguiente ID numérico secuencial (ej: 110, 111, 112...)
 */
function calcularSiguienteId(pedidos) {
  const idsNumericos = pedidos
    .map((p) => parseInt(p.id, 10))
    .filter((n) => !isNaN(n));
  const maxId = idsNumericos.length > 0 ? Math.max(...idsNumericos) : 109;
  return String(maxId + 1);
}

/**
 * Genera el texto resumen para la columna "detalle" del panel de administración
 * Ej: "2 (Cilindro 15kg x1, Manguera x1)"
 */
function generarTextoDetalle(items) {
  if (!items || items.length === 0) return "Sin detalle";
  const cantidadTotal = items.reduce((sum, item) => sum + (item.cantidad || 1), 0);
  const nombresBreves = items
    .map((i) => {
      const nombreCorto = (i.producto?.nombre || "Producto")
        .replace("Cilindro gas licuado", "Cilindro")
        .replace("Cilindro GLP", "Cilindro");
      return `${nombreCorto} x${i.cantidad || 1}`;
    })
    .join(", ");
  return `${cantidadTotal} (${nombresBreves})`;
}

/**
 * Crea y guarda un nuevo pedido en la lista del sistema.
 */
export function crearNuevoPedido(datos) {
  const pedidosActuales = obtenerPedidos();
  const nuevoId = calcularSiguienteId(pedidosActuales);
  const now = new Date();
  const horaActual = now.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const fechaActual = fechaDeHoy();

  const nuevoPedido = {
    id: nuevoId,
    codigo: `EV-${nuevoId}`,
    cliente: datos.cliente || "Cliente Particular",
    telefono: datos.telefono || "",
    rut: datos.rut || "",
    email: datos.email || "",
    direccion: datos.direccion || "Dirección no informada",
    direccionDetalle: datos.direccionDetalle || null,
    detalle: generarTextoDetalle(datos.items),
    items: datos.items || [],
    total: datos.total || 0,
    metodoPago: datos.metodoPago || "efectivo", // "repartidor" o "pagar_ahora"
    subMetodoPago: datos.subMetodoPago || "efectivo", // "efectivo", "tarjeta", "webpay_debito", etc.
    montoPaga: datos.montoPaga || null,
    vuelto: datos.vuelto || 0,
    desgloseVuelto: datos.desgloseVuelto || null,
    estado: "Pendiente", // "Pendiente", "En ruta", "Entregado"
    estadoPago: datos.estadoPago || "pendiente", // "pendiente" o "pagado"
    repartidor: null,
    fecha: fechaActual,
    hora: horaActual,
    codigoTransaccion: datos.codigoTransaccion || null,
    codigoAutorizacion: datos.codigoAutorizacion || null,
    fechaCreacion: now.toISOString(),
  };

  const listaActualizada = [nuevoPedido, ...pedidosActuales];
  guardarListaPedidos(listaActualizada);

  try {
    localStorage.setItem(CLAVE_ULTIMO_PEDIDO, JSON.stringify(nuevoPedido));
  } catch (error) {
    console.error("Error al guardar último pedido:", error);
  }

  return nuevoPedido;
}

/**
 * Actualiza el estado de pago de un pedido existente (para el flujo de "Pagar Ahora").
 */
export function actualizarEstadoPago(id, datosPago = {}) {
  const pedidos = obtenerPedidos();
  let pedidoActualizado = null;

  const listaActualizada = pedidos.map((p) => {
    if (String(p.id) === String(id)) {
      pedidoActualizado = {
        ...p,
        email: datosPago.email || p.email,
        cliente: datosPago.cliente || p.cliente,
        estadoPago: datosPago.estadoPago || "pagado",
        subMetodoPago: datosPago.subMetodoPago || p.subMetodoPago || "webpay",
        codigoTransaccion:
          datosPago.codigoTransaccion ||
          p.codigoTransaccion ||
          `TRX-${Math.floor(100000 + Math.random() * 900000)}`,
        codigoAutorizacion:
          datosPago.codigoAutorizacion ||
          p.codigoAutorizacion ||
          `AUT-${Math.floor(100000 + Math.random() * 900000)}`,
        tarjetaTerminacion: datosPago.tarjetaTerminacion || p.tarjetaTerminacion || "0001",
        fechaPago: new Date().toISOString(),
      };
      return pedidoActualizado;
    }
    return p;
  });

  if (pedidoActualizado) {
    guardarListaPedidos(listaActualizada);
    try {
      localStorage.setItem(CLAVE_ULTIMO_PEDIDO, JSON.stringify(pedidoActualizado));
    } catch {
      // Ignorar error de almacenamiento
    }
  }

  return pedidoActualizado;
}

/**
 * Obtiene el último pedido creado desde localStorage.
 */
export function obtenerUltimoPedido() {
  try {
    const guardado = localStorage.getItem(CLAVE_ULTIMO_PEDIDO);
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

/**
 * Asigna un repartidor a un pedido en el sistema.
 */
export function asignarRepartidorPedido(idPedido, nombreRepartidor) {
  const pedidos = obtenerPedidos();
  const actualizados = pedidos.map((p) =>
    String(p.id) === String(idPedido)
      ? { ...p, repartidor: nombreRepartidor, estado: "En ruta" }
      : p
  );
  guardarListaPedidos(actualizados);
  return actualizados;
}

