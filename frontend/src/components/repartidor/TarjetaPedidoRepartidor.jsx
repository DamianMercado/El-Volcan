import { InsigniaEstado } from '../ui/InsigniaEstado.jsx'
import { formatearPesos } from '../../utils/formato.js'

const obtenerDireccionCompleta = (pedido) => {
  const dir = String(pedido?.direccion || '').trim()
  const comuna = String(pedido?.comuna || '').trim()
  if (!dir) return comuna || 'Dirección no informada'
  if (!comuna || dir.toLowerCase().includes(comuna.toLowerCase())) return dir
  return `${dir}, ${comuna}`
}

const obtenerVarianteEstado = (estado) => {
  const norm = String(estado || '').toLowerCase()
  if (norm === 'entregado') return 'pedido-entregado'
  if (norm === 'en ruta') return 'pedido-en-ruta'
  return 'pedido-pendiente'
}

export function TarjetaPedidoRepartidor({ pedido, alSeleccionar }) {
  const direccion = obtenerDireccionCompleta(pedido)
  const esPagado = String(pedido.estadoPago || '').toLowerCase() === 'pagado'
  const entrega = pedido.entrega || {}
  const tieneDistancia = entrega.distancia_km != null
  const tieneTiempo = entrega.tiempo_estimado_min != null && pedido.estado !== 'Entregado'

  const resumenProductos =
    Array.isArray(pedido.items) && pedido.items.length > 0
      ? pedido.items
          .map((it) => `${it.cantidad}x ${it.producto?.nombre || 'Producto'}`)
          .join(' · ')
      : pedido.detalle || 'Pedido de gas licuado'

  return (
    <button
      type="button"
      onClick={() => alSeleccionar(pedido)}
      className="group w-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xs transition active:scale-[0.99] hover:border-[#2358b9] hover:shadow-md focus:border-[#2358b9] focus:outline-none"
    >
      {/* Fila superior: código, estado y ETA/distancia */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-[#0A2540] px-2.5 py-1 text-xs font-extrabold tracking-wide text-white">
            #{pedido.codigo}
          </span>
          <InsigniaEstado variante={obtenerVarianteEstado(pedido.estado)}>
            {pedido.estado}
          </InsigniaEstado>
        </div>

        {(tieneTiempo || tieneDistancia) && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-[#2358b9]">
            {tieneTiempo && `~${entrega.tiempo_estimado_min} min`}
            {tieneTiempo && tieneDistancia && ' · '}
            {tieneDistancia && `${entrega.distancia_km} km`}
          </span>
        )}
      </div>

      {/* Dirección destacada para lectura rápida en terreno */}
      <h3 className="m-0 mt-3 text-base font-extrabold leading-snug text-[#0A2540]">
        {direccion}
      </h3>

      <p className="m-0 mt-1 text-xs font-medium text-slate-500">
        {pedido.cliente}
        {pedido.hora ? ` · ${pedido.fecha} ${pedido.hora}` : ''}
      </p>

      {/* Carga */}
      <p className="m-0 mt-2.5 line-clamp-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
        {resumenProductos}
      </p>

      {/* Nota del cliente si existe */}
      {pedido.observacion && (
        <p className="m-0 mt-2 truncate rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-medium text-amber-900">
          Nota: {pedido.observacion}
        </p>
      )}

      {/* Pie: Cobro vs Pagado + CTA */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        {esPagado ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
            ✓ Pagado ({formatearPesos(pedido.total)})
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-900">
            Cobrar: {formatearPesos(pedido.total)}
          </span>
        )}

        <span className="text-xs font-bold text-[#2358b9] transition group-hover:translate-x-0.5">
          Ver pedido y ruta →
        </span>
      </div>
    </button>
  )
}

export default TarjetaPedidoRepartidor
