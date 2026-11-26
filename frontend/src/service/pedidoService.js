import { Variables } from '../config/variables'
import {
  Rutas,
  realizarPeticion,
  obtenerMensaje,
} from './endpoints'
import { fechaDeHoy } from '../utils/formato'

const CLAVE_ULTIMO_PEDIDO = 'ultimo_pedido_creado'

const obtenerHeadersAuth = (conJson = false) => {
  const token = localStorage.getItem(Variables.tokenKey)
  const headers = { Accept: 'application/json' }
  if (conJson) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

const formatearEstadoVenta = (estadoVenta) => {
  const norm = String(estadoVenta || '').toUpperCase()
  if (norm === 'ENTREGADO') return 'Entregado'
  if (norm === 'EN_RUTA' || norm === 'EN_CAMINO') return 'En ruta'
  if (norm === 'CANCELADA' || norm === 'CANCELADO') return 'Cancelada'
  return 'Pendiente'
}

const mapearEstadoHaciaBackend = (estadoUi) => {
  const norm = String(estadoUi || '').trim().toLowerCase()
  if (norm === 'pendiente') return 'PENDIENTE'
  if (norm === 'en ruta' || norm === 'en_ruta' || norm === 'en_camino') return 'EN_RUTA'
  if (norm === 'entregado') return 'ENTREGADO'
  if (norm === 'cancelada' || norm === 'cancelado') return 'CANCELADA'
  return ''
}

export const formatearFechaHoraChile = (valorFecha) => {
  if (!valorFecha) return ''
  const fechaObj = valorFecha instanceof Date ? valorFecha : new Date(valorFecha)
  if (Number.isNaN(fechaObj.getTime())) return String(valorFecha)

  const partesFecha = new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
    .format(fechaObj)
    .replaceAll('-', '/')

  const partesHora = new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(fechaObj)

  return `${partesFecha} ${partesHora}`
}

const ordenarPedidosRecientes = (lista) => {
  return [...lista].sort((a, b) => {
    const tiempoA = a.fechaVenta ? new Date(a.fechaVenta).getTime() : 0
    const tiempoB = b.fechaVenta ? new Date(b.fechaVenta).getTime() : 0
    if (tiempoB !== tiempoA) return tiempoB - tiempoA
    return Number(b.id || 0) - Number(a.id || 0)
  })
}

const normalizarVenta = (v) => {
  const fechaObj = v.fechaVenta ? new Date(v.fechaVenta) : new Date()
  const fechaValida = !Number.isNaN(fechaObj.getTime())
  const fechaFormateada = fechaValida
    ? new Intl.DateTimeFormat('es-CL', {
        timeZone: 'America/Santiago',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
        .format(fechaObj)
        .replaceAll('-', '/')
    : fechaDeHoy()
  const horaFormateada = fechaValida
    ? new Intl.DateTimeFormat('es-CL', {
        timeZone: 'America/Santiago',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(fechaObj)
    : ''

  return {
    id: String(v.id ?? ''),
    codigo: v.codigoVenta || v.codigo || `EV-${v.id}`,
    idUsuario: v.idUsuario ?? null,
    idPago: v.idPago ?? null,
    cliente: v.cliente || 'Cliente Particular',
    rut: v.rut || '',
    email: v.email || '',
    telefono: v.telefono || '',
    direccion: v.direccion || '',
    comuna: v.comuna || '',
    observacion: v.observacion || '',
    direccionDetalle: {
      direccion1: v.direccion || '',
      direccion2: '',
      comuna: v.comuna || '',
      observacion: v.observacion || '',
    },
    detalle: v.detalle || '',
    items: Array.isArray(v.items)
      ? v.items.map((it) => ({
          producto: {
            codigo: it.codigoProducto || it.producto?.codigo,
            nombre: it.nombreProducto || it.producto?.nombre,
            precio: Number(it.precioUnitario ?? it.producto?.precio ?? 0),
          },
          cantidad: Number(it.cantidad ?? 1),
          subtotal: Number(it.subtotal ?? 0),
        }))
      : [],
    total: Number(v.total ?? 0),
    metodoPago: v.metodoPago || 'efectivo',
    subMetodoPago:
      v.subMetodoPago || (v.metodoPago === 'pagar_ahora' ? 'webpay' : 'efectivo'),
    estado: v.estado && !v.estadoVenta ? v.estado : formatearEstadoVenta(v.estadoVenta),
    estadoPago: String(v.estadoPago || 'pendiente').toLowerCase(),
    repartidor: v.repartidor || null,
    fechaVenta: v.fechaVenta || (fechaValida ? fechaObj.toISOString() : null),
    fecha: fechaFormateada,
    hora: horaFormateada,
    fechaHoraChile: horaFormateada
      ? `${fechaFormateada} ${horaFormateada}`
      : fechaFormateada,
    entrega: v.entrega || null,
    auditoria: Array.isArray(v.auditoria) ? v.auditoria : [],
    codigoTransaccion: v.codigoTransaccion || null,
    codigoAutorizacion: v.codigoAutorizacion || null,
  }
}

export async function ListarPedidosServicio() {
  const respuesta = await realizarPeticion(Rutas.ventas, {
    method: 'GET',
    headers: obtenerHeadersAuth(false),
  })

  const datos = await respuesta.json().catch(() => null)
  if (!respuesta.ok || !Array.isArray(datos)) {
    throw new Error(
      obtenerMensaje(
        datos?.mensaje || datos?.message,
        'No pudimos cargar la lista de pedidos en este momento.',
      ),
    )
  }

  return ordenarPedidosRecientes(datos.map(normalizarVenta))
}

export function esPedidoDelUsuario(pedido, usuario) {
  if (!pedido || !usuario) return false

  const idUsuarioReal = usuario.idUsuario ?? usuario.id ?? null
  const emailUsuario = String(usuario.email || usuario.correo || '')
    .trim()
    .toLowerCase()
  const emailPedido = String(pedido.email || '').trim().toLowerCase()

  if (emailPedido && emailUsuario) {
    return emailPedido === emailUsuario
  }

  if (idUsuarioReal != null && pedido.idUsuario != null) {
    return String(pedido.idUsuario) === String(idUsuarioReal)
  }

  return false
}

export async function ListarMisPedidos(usuario) {
  if (!usuario) return []

  try {
    const respuesta = await realizarPeticion(Rutas.misPedidos, {
      method: 'GET',
      headers: obtenerHeadersAuth(false),
    })

    const datos = await respuesta.json().catch(() => null)
    if (respuesta.ok && Array.isArray(datos)) {
      return ordenarPedidosRecientes(
        datos.map(normalizarVenta).filter((p) => esPedidoDelUsuario(p, usuario))
      )
    }
  } catch {
    // Respaldo si el backend aún corre una versión anterior sin /mis-pedidos
  }

  const idUsuarioReal = usuario.idUsuario ?? usuario.id ?? null
  if (!idUsuarioReal) return []

  const pedidosUsuario = await ListarPedidosUsuario(idUsuarioReal)
  return pedidosUsuario.filter((p) => esPedidoDelUsuario(p, usuario))
}

export async function ListarPedidosUsuario(idUsuario) {
  const respuesta = await realizarPeticion(Rutas.ventasUsuario(idUsuario), {
    method: 'GET',
    headers: obtenerHeadersAuth(false),
  })

  const datos = await respuesta.json().catch(() => null)
  if (!respuesta.ok || !Array.isArray(datos)) {
    throw new Error(
      obtenerMensaje(
        datos?.mensaje || datos?.message,
        'No pudimos cargar tus pedidos en este momento.',
      ),
    )
  }

  return ordenarPedidosRecientes(datos.map(normalizarVenta))
}

export async function ObtenerPedidoPorId(id) {
  const respuesta = await realizarPeticion(Rutas.venta(id), {
    method: 'GET',
    headers: obtenerHeadersAuth(false),
  })

  const datos = await respuesta.json().catch(() => null)
  if (!respuesta.ok || !datos) {
    throw new Error(
      obtenerMensaje(
        datos?.mensaje || datos?.message,
        'No pudimos encontrar el pedido solicitado.',
      ),
    )
  }

  return normalizarVenta(datos)
}

export async function ListarPedidosPaginados({
  idUsuario = null,
  esAdmin = false,
  page = 0,
  size = 5,
  estado = '',
} = {}) {
  const estadoBackend = mapearEstadoHaciaBackend(estado)
  const urlPaginada = esAdmin
    ? Rutas.ventasPaginado({ page, size, estado: estadoBackend })
    : Rutas.ventasUsuarioPaginado(idUsuario, { page, size, estado: estadoBackend })

  try {
    const respuesta = await realizarPeticion(urlPaginada, {
      method: 'GET',
      headers: obtenerHeadersAuth(false),
    })

    const datos = await respuesta.json().catch(() => null)
    if (respuesta.ok && datos && Array.isArray(datos.content)) {
      return {
        content: datos.content.map(normalizarVenta),
        totalElements: Number(datos.totalElements ?? datos.content.length),
        totalPages: Math.max(1, Number(datos.totalPages ?? 1)),
        number: Number(datos.number ?? page),
        size: Number(datos.size ?? size),
      }
    }
  } catch {
    // Fallback a paginación local si el backend aún no expone /paginado
  }

  const todos = esAdmin
    ? await ListarPedidosServicio()
    : await ListarPedidosUsuario(idUsuario)

  const filtrados = estado && estado !== 'Todos'
    ? todos.filter((p) => p.estado.toLowerCase() === estado.toLowerCase())
    : todos

  const totalElements = filtrados.length
  const totalPages = Math.max(1, Math.ceil(totalElements / size))
  const paginaSegura = Math.min(Math.max(0, page), totalPages - 1)
  const inicio = paginaSegura * size

  return {
    content: filtrados.slice(inicio, inicio + size),
    totalElements,
    totalPages,
    number: paginaSegura,
    size,
  }
}

export const obtenerPedidos = ListarPedidosServicio

export async function crearNuevoPedido(datos) {
  const payload = {
    idUsuario: datos.idUsuario ?? null,
    cliente: datos.cliente || 'Cliente Particular',
    rut: datos.rut || '',
    email: datos.email || '',
    telefono: datos.telefono || '+56 9 0000 0000',
    direccion: datos.direccion || 'Dirección no informada',
    comuna: datos.direccionDetalle?.comuna || datos.comuna || '',
    observacion: datos.direccionDetalle?.observacion || datos.observacion || '',
    metodoPago: datos.metodoPago || 'repartidor',
    items: (datos.items || []).map((it) => ({
      codigoProducto: it.producto?.codigo || it.codigoProducto,
      cantidad: Number(it.cantidad || 1),
    })),
  }

  const respuesta = await realizarPeticion(Rutas.ventas, {
    method: 'POST',
    headers: obtenerHeadersAuth(true),
    body: JSON.stringify(payload),
  })

  const resultado = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    throw new Error(
      obtenerMensaje(
        resultado.mensaje || resultado.message,
        'No pudimos registrar tu pedido en este momento. Por favor, inténtalo nuevamente.',
      ),
    )
  }

  const pedidoNormalizado = {
    ...normalizarVenta(resultado),
    direccionDetalle: datos.direccionDetalle || {
      direccion1: datos.direccion || '',
      direccion2: '',
      comuna: datos.comuna || '',
      observacion: datos.observacion || '',
    },
    subMetodoPago: datos.subMetodoPago || 'efectivo',
    montoPaga: datos.montoPaga ?? datos.total ?? resultado.total,
    vuelto: datos.vuelto ?? 0,
    desgloseVuelto: datos.desgloseVuelto ?? null,
  }

  try {
    localStorage.setItem(CLAVE_ULTIMO_PEDIDO, JSON.stringify(pedidoNormalizado))
  } catch {
    // Ignorar error de almacenamiento
  }

  return pedidoNormalizado
}

export async function actualizarEstadoPago(id, datosPago = {}) {
  const payload = {
    idVenta: Number(id),
    montoPago: Number(datosPago.montoPago || datosPago.total || 1),
    metodoPago: datosPago.subMetodoPago || 'webpay_debito',
    tarjetaTerminacion: datosPago.tarjetaTerminacion || '0001',
    emailComprobante: datosPago.email || '',
    nombreTitular: datosPago.cliente || '',
    aprobarInmediatamente: true,
  }

  const respuesta = await realizarPeticion(Rutas.pagos, {
    method: 'POST',
    headers: obtenerHeadersAuth(true),
    body: JSON.stringify(payload),
  })

  const pago = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    throw new Error(
      obtenerMensaje(
        pago.mensaje || pago.message,
        'No pudimos completar tu pago en este momento. No se ha realizado ningún cargo; por favor inténtalo nuevamente.',
      ),
    )
  }

  const previo = obtenerUltimoPedido() || {}
  const pedidoActualizado = {
    ...previo,
    id: String(id),
    email: datosPago.email || previo.email || '',
    cliente: datosPago.cliente || previo.cliente || '',
    estadoPago: 'pagado',
    subMetodoPago: datosPago.subMetodoPago || 'webpay_debito',
    codigoTransaccion: pago.codigoTransaccion || datosPago.codigoTransaccion,
    codigoAutorizacion: pago.codigoAutorizacion || datosPago.codigoAutorizacion,
    tarjetaTerminacion:
      pago.tarjetaTerminacion || datosPago.tarjetaTerminacion || '0001',
    fechaPago: pago.fechaPago || new Date().toISOString(),
  }

  try {
    localStorage.setItem(CLAVE_ULTIMO_PEDIDO, JSON.stringify(pedidoActualizado))
  } catch {
    // Ignorar error de almacenamiento
  }

  return pedidoActualizado
}

export function obtenerUltimoPedido() {
  try {
    const guardado = localStorage.getItem(CLAVE_ULTIMO_PEDIDO)
    return guardado ? JSON.parse(guardado) : null
  } catch {
    return null
  }
}

export async function asignarRepartidorPedido(idPedido, nombreRepartidor) {
  const respuesta = await realizarPeticion(
    Rutas.ventaRepartidor(idPedido, nombreRepartidor),
    {
      method: 'PUT',
      headers: obtenerHeadersAuth(false),
    },
  )

  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    throw new Error(
      obtenerMensaje(
        datos.mensaje || datos.message,
        'No pudimos asignar el repartidor en este momento. Inténtalo nuevamente.',
      ),
    )
  }

  return normalizarVenta(datos)
}
