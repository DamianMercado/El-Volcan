import { formatearFechaHoraChile } from '../../service/pedidoService.js'

const construirHistorial = (pedido) => {
  if (Array.isArray(pedido?.auditoria) && pedido.auditoria.length > 0) {
    return pedido.auditoria.map((ev, idx) => ({
      id: `aud-${idx}`,
      mensaje:
        ev.mensaje || ev.descripcion || ev.evento || 'Actualización del pedido',
      fechaHora:
        ev.fechaHoraChile ||
        formatearFechaHoraChile(ev.fecha) ||
        pedido.fechaHoraChile ||
        '',
    }))
  }

  const baseHora = pedido?.fechaHoraChile || pedido?.fecha || ''
  const eventos = [
    {
      id: 'ev-registro',
      mensaje: `Pedido ${pedido.codigo} registrado por ${pedido.cliente || 'Cliente'}`,
      fechaHora: baseHora,
    },
  ]

  if (String(pedido.estadoPago || '').toLowerCase() === 'pagado') {
    eventos.push({
      id: 'ev-pago',
      mensaje: pedido.idPago
        ? `Pago ID ${pedido.idPago} confirmado`
        : 'Pago confirmado',
      fechaHora: baseHora,
    })
  }

  const estadoNorm = String(pedido.estado || '').toLowerCase()
  if (estadoNorm === 'en ruta') {
    eventos.push({
      id: 'ev-en-camino',
      mensaje: 'Estado de despacho actualizado a: en_camino',
      fechaHora: '',
    })
  } else if (estadoNorm === 'entregado') {
    eventos.push({
      id: 'ev-entregado',
      mensaje: 'Estado de despacho actualizado a: entregado',
      fechaHora: '',
    })
  } else if (estadoNorm === 'cancelada') {
    eventos.push({
      id: 'ev-cancelada',
      mensaje: 'Estado de despacho actualizado a: cancelada',
      fechaHora: '',
    })
  }

  return eventos
}

export function HistorialPedidoSeguimiento({ pedido }) {
  if (!pedido) return null

  const eventos = construirHistorial(pedido)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="m-0 text-base font-extrabold text-[#0A2540]">
        Historial del Pedido (Hora Chile)
      </h2>

      <ul className="mt-3 list-none divide-y divide-slate-100 p-0">
        {eventos.map((ev) => (
          <li
            key={ev.id}
            className="flex items-start justify-between gap-3 py-2.5 text-sm"
          >
            <span className="text-slate-600">{ev.mensaje}</span>
            {ev.fechaHora && (
              <span className="shrink-0 font-mono text-xs text-slate-400">
                {ev.fechaHora}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default HistorialPedidoSeguimiento
