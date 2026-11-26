import { useState } from 'react'
import { InsigniaEstado } from '../ui/InsigniaEstado.jsx'
import { formatearPesos } from '../../utils/formato.js'

const obtenerDireccionCompleta = (pedido) => {
  const dir = String(pedido?.direccion || '').trim()
  const comuna = String(pedido?.comuna || '').trim()
  if (!dir) return comuna || 'Dirección no informada'
  if (!comuna || dir.toLowerCase().includes(comuna.toLowerCase())) return dir
  return `${dir}, ${comuna}`
}

const construirEnlacesNavegacion = (pedido) => {
  const direccion = obtenerDireccionCompleta(pedido)
  const consultaDireccion = encodeURIComponent(`${direccion}, Chile`)
  const coords = pedido?.entrega?.ubicacion?.coordinates

  if (
    Array.isArray(coords) &&
    coords.length === 2 &&
    Number.isFinite(Number(coords[0])) &&
    Number.isFinite(Number(coords[1]))
  ) {
    const lon = Number(coords[0])
    const lat = Number(coords[1])
    if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      return {
        googleMaps: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`,
        waze: `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`,
        tieneCoordenadas: true,
      }
    }
  }

  return {
    googleMaps: `https://www.google.com/maps/dir/?api=1&destination=${consultaDireccion}&travelmode=driving`,
    waze: `https://waze.com/ul?q=${consultaDireccion}&navigate=yes`,
    tieneCoordenadas: false,
  }
}

const construirEnlaceWhatsApp = (pedido, nombreRepartidor) => {
  const soloDigitos = String(pedido?.telefono || '').replace(/\D/g, '')
  if (!soloDigitos) return null
  const numeroChile =
    soloDigitos.length === 9 && soloDigitos.startsWith('9')
      ? `56${soloDigitos}`
      : soloDigitos
  const mensaje = `Hola ${pedido.cliente || ''}, soy ${
    nombreRepartidor || 'tu repartidor'
  } de Gas El Volcán. Voy en camino con tu pedido #${pedido.codigo}.`
  return `https://wa.me/${numeroChile}?text=${encodeURIComponent(mensaje)}`
}

const obtenerVarianteEstado = (estado) => {
  const norm = String(estado || '').toLowerCase()
  if (norm === 'entregado') return 'pedido-entregado'
  if (norm === 'en ruta') return 'pedido-en-ruta'
  return 'pedido-pendiente'
}

export function DetallePedidoRepartidor({
  pedido,
  nombreRepartidor,
  procesando = false,
  alVolver,
  alTomarPedido,
  alCompletarEntrega,
}) {
  const [confirmandoEntrega, setConfirmandoEntrega] = useState(false)

  if (!pedido) return null

  const direccion = obtenerDireccionCompleta(pedido)
  const enlacesRuta = construirEnlacesNavegacion(pedido)
  const whatsappUrl = construirEnlaceWhatsApp(pedido, nombreRepartidor)
  const telefonoHref = pedido.telefono
    ? `tel:${String(pedido.telefono).replace(/[^\d+]/g, '')}`
    : null

  const esPagado = String(pedido.estadoPago || '').toLowerCase() === 'pagado'
  const esPendiente = String(pedido.estado || '').toLowerCase() === 'pendiente'
  const esEnRuta = String(pedido.estado || '').toLowerCase() === 'en ruta'
  const esEntregado = String(pedido.estado || '').toLowerCase() === 'entregado'
  const items = Array.isArray(pedido.items) ? pedido.items : []
  const entrega = pedido.entrega || {}

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pt-4 pb-32">
      {/* Cabecera de retorno sticky */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={alVolver}
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-[#0A2540] shadow-xs transition active:scale-95 hover:border-[#2358b9]"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          <span>Volver a pedidos</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-[#0A2540] px-2.5 py-1 text-xs font-extrabold text-white">
            #{pedido.codigo}
          </span>
          <InsigniaEstado variante={obtenerVarianteEstado(pedido.estado)}>
            {pedido.estado}
          </InsigniaEstado>
        </div>
      </div>

      {/* Tarjeta 1: Dirección + Botones de Navegación (Google Maps & Waze) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            DESTINO DE ENTREGA
          </span>
          {(entrega.distancia_km != null ||
            (entrega.tiempo_estimado_min != null && !esEntregado)) && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#2358b9]">
              {entrega.tiempo_estimado_min != null && !esEntregado
                ? `~${entrega.tiempo_estimado_min} min`
                : ''}
              {entrega.tiempo_estimado_min != null &&
              !esEntregado &&
              entrega.distancia_km != null
                ? ' · '
                : ''}
              {entrega.distancia_km != null ? `${entrega.distancia_km} km` : ''}
            </span>
          )}
        </div>

        <h1 className="m-0 mt-2 text-xl font-extrabold leading-snug text-[#0A2540]">
          {direccion}
        </h1>

        {entrega.planta && (
          <p className="m-0 mt-1 text-xs text-slate-500">
            Salida desde Planta{' '}
            <strong className="font-semibold text-slate-700">
              {entrega.planta}
            </strong>
          </p>
        )}

        {pedido.observacion && (
          <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3">
            <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-amber-800">
              Indicaciones del cliente
            </p>
            <p className="m-0 mt-0.5 text-sm font-semibold text-amber-950">
              {pedido.observacion}
            </p>
          </div>
        )}

        {/* Botones 1-tap de Apps de Ruta (Mobile-First min-h 52px) */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <a
            href={enlacesRuta.googleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[#2358b9] px-3 py-3 text-sm font-extrabold text-white no-underline shadow-sm transition active:scale-[0.98] hover:bg-[#1b4592]"
          >
            <svg
              className="h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            <span>Google Maps</span>
          </a>

          <a
            href={enlacesRuta.waze}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[#00A8E8] px-3 py-3 text-sm font-extrabold text-white no-underline shadow-sm transition active:scale-[0.98] hover:bg-[#008ec5]"
          >
            <svg
              className="h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
            <span>Abrir Waze</span>
          </a>
        </div>
      </section>

      {/* Tarjeta 2: Datos del Cliente y Contacto Rápido */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          DATOS DEL CLIENTE
        </span>

        <div className="mt-2.5 flex items-center justify-between gap-3">
          <div>
            <p className="m-0 text-base font-extrabold text-[#0A2540]">
              {pedido.cliente}
            </p>
            {pedido.telefono && (
              <p className="m-0 mt-0.5 text-sm font-medium text-slate-600">
                {pedido.telefono}
              </p>
            )}
            {pedido.rut && (
              <p className="m-0 mt-0.5 text-xs text-slate-400">
                RUT: {pedido.rut}
              </p>
            )}
          </div>
          {pedido.fechaHoraChile && (
            <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-500">
              {pedido.fechaHoraChile}
            </span>
          )}
        </div>

        {(telefonoHref || whatsappUrl) && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {telefonoHref && (
              <a
                href={telefonoHref}
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-[#0A2540] no-underline transition active:scale-[0.98] hover:border-[#2358b9] hover:bg-blue-50"
              >
                <svg
                  className="h-4 w-4 text-[#2358b9]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  />
                </svg>
                <span>Llamar</span>
              </a>
            )}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-bold text-emerald-800 no-underline transition active:scale-[0.98] hover:bg-emerald-100"
              >
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        )}
      </section>

      {/* Tarjeta 3: Productos a Entregar */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          PRODUCTOS A ENTREGAR
        </span>

        <ul className="mt-3 list-none divide-y divide-slate-100 p-0">
          {items.length > 0 ? (
            items.map((it, idx) => (
              <li
                key={`${it.producto?.codigo || idx}-${idx}`}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 min-w-[36px] items-center justify-center rounded-lg bg-[#0A2540] px-2 text-sm font-extrabold text-white">
                    {it.cantidad}x
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {it.producto?.nombre || 'Producto El Volcán'}
                  </span>
                </div>
                <span className="shrink-0 text-sm font-bold text-[#0A2540]">
                  {formatearPesos(
                    Number(it.subtotal) ||
                      Number(it.producto?.precio ?? 0) * Number(it.cantidad ?? 1)
                  )}
                </span>
              </li>
            ))
          ) : (
            <li className="py-2 text-sm font-semibold text-slate-700">
              {pedido.detalle || 'Pedido de gas licuado'}
            </li>
          )}
        </ul>

        {/* Resumen de Pago / Cobro */}
        <div
          className={`mt-4 flex items-center justify-between rounded-xl p-3.5 ${
            esPagado
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border border-amber-300 bg-amber-50 text-amber-950'
          }`}
        >
          <div>
            <p className="m-0 text-xs font-extrabold uppercase tracking-wide">
              {esPagado ? 'Pagado en línea' : 'Cobrar al entregar'}
            </p>
            <p className="m-0 mt-0.5 text-xs opacity-80">
              {esPagado
                ? 'No requiere cobro al cliente'
                : 'Efectivo o tarjeta con repartidor'}
            </p>
          </div>
          <strong className="text-xl font-extrabold">
            {formatearPesos(pedido.total)}
          </strong>
        </div>
      </section>

      {/* Barra fija inferior de acción principal (Thumb Zone móvil) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto max-w-2xl">
          {esPendiente && (
            <button
              type="button"
              disabled={procesando}
              onClick={() => alTomarPedido(pedido)}
              className="flex min-h-[54px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#FF4500] px-5 py-3.5 text-base font-extrabold text-white shadow-lg transition active:scale-[0.98] hover:bg-[#e03d00] disabled:opacity-60"
            >
              {procesando
                ? 'Asignando pedido...'
                : 'Tomar pedido e iniciar ruta'}
            </button>
          )}

          {esEnRuta && !confirmandoEntrega && (
            <button
              type="button"
              disabled={procesando}
              onClick={() => setConfirmandoEntrega(true)}
              className="flex min-h-[54px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-base font-extrabold text-white shadow-lg transition active:scale-[0.98] hover:bg-emerald-700 disabled:opacity-60"
            >
              ✓ Completar entrega
            </button>
          )}

          {esEnRuta && confirmandoEntrega && (
            <div className="flex flex-col gap-2.5">
              <p className="m-0 text-center text-xs font-bold text-[#0A2540]">
                {esPagado
                  ? `¿Confirmas que entregaste el pedido #${pedido.codigo}?`
                  : `¿Confirmas entrega y cobro de ${formatearPesos(pedido.total)} del pedido #${pedido.codigo}?`}
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={procesando}
                  onClick={() => setConfirmandoEntrega(false)}
                  className="min-h-[48px] cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={procesando}
                  onClick={async () => {
                    await alCompletarEntrega(pedido)
                    setConfirmandoEntrega(false)
                  }}
                  className="min-h-[48px] cursor-pointer rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {procesando ? 'Guardando...' : 'Sí, marcar Entregado'}
                </button>
              </div>
            </div>
          )}

          {esEntregado && (
            <div className="flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-sm font-extrabold text-emerald-700">
              ✓ Entrega completada
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DetallePedidoRepartidor
