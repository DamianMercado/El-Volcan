import { InsigniaEstado } from '../ui/InsigniaEstado.jsx'
import { formatearPesos } from '../../utils/formato.js'

const obtenerVarianteEstado = (estado) => {
  const norm = String(estado || '').toLowerCase()
  if (norm === 'entregado') return 'pedido-entregado'
  if (norm === 'en ruta') return 'pedido-en-ruta'
  if (norm === 'cancelada') return 'pedido-cancelada'
  return 'pedido-pendiente'
}

const construirPaginasVisibles = (paginaActual, totalPaginas) => {
  if (totalPaginas <= 5) {
    return Array.from({ length: totalPaginas }, (_, i) => i + 1)
  }

  const paginas = new Set([1, totalPaginas, paginaActual])
  if (paginaActual > 1) paginas.add(paginaActual - 1)
  if (paginaActual < totalPaginas) paginas.add(paginaActual + 1)

  const ordenadas = Array.from(paginas).sort((a, b) => a - b)
  const resultado = []
  for (let i = 0; i < ordenadas.length; i++) {
    if (i > 0 && ordenadas[i] - ordenadas[i - 1] > 1) {
      resultado.push(`ellipsis-${i}`)
    }
    resultado.push(ordenadas[i])
  }
  return resultado
}

export function ListaPedidosPaginable({
  pedidos = [],
  pedidoSeleccionadoId = '',
  filtroEstado = 'Todos',
  busqueda = '',
  paginaActual = 1,
  tamanoPagina = 5,
  totalElementos = 0,
  totalPaginas = 1,
  alCambiarFiltro,
  alCambiarBusqueda,
  alCambiarPagina,
  alCambiarTamanoPagina,
  alSeleccionarPedido,
}) {
  const inicio =
    totalElementos === 0 ? 0 : (paginaActual - 1) * tamanoPagina + 1
  const fin = Math.min(paginaActual * tamanoPagina, totalElementos)
  const paginasVisibles = construirPaginasVisibles(paginaActual, totalPaginas)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="m-0 text-lg font-extrabold text-[#0A2540]">
            Mis Pedidos
          </h2>
          <p className="m-0 mt-0.5 text-xs text-slate-500">
            Selecciona cualquier pedido para ver su seguimiento y detalle en vivo
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-[#0A2540]">
          {totalElementos} {totalElementos === 1 ? 'pedido' : 'pedidos'}
        </span>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => alCambiarBusqueda(e.target.value)}
            placeholder="Buscar por código (EV-110), dirección o producto..."
            aria-label="Buscar pedidos"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 transition focus:border-[#2358b9] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            id="filtro-estado-seguimiento"
            aria-label="Filtrar pedidos por estado"
            value={filtroEstado}
            onChange={(e) => alCambiarFiltro(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-[#2358b9] focus:outline-none"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En ruta">En ruta</option>
            <option value="Entregado">Entregado</option>
            <option value="Cancelada">Cancelada</option>
          </select>

          <select
            id="tamano-pagina-seguimiento"
            aria-label="Pedidos por página"
            value={tamanoPagina}
            onChange={(e) => alCambiarTamanoPagina(Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-[#2358b9] focus:outline-none"
          >
            <option value={5}>5 por página</option>
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
          </select>
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-[#f7f9fc] text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-3.5 py-3">Pedido</th>
              <th className="px-3.5 py-3">Detalle y Dirección</th>
              <th className="px-3.5 py-3">Total</th>
              <th className="px-3.5 py-3">Estado</th>
              <th className="px-3.5 py-3 text-right">Seguimiento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pedidos.map((pedido) => {
              const seleccionado =
                String(pedido.id) === String(pedidoSeleccionadoId)
              const esPagado =
                String(pedido.estadoPago || '').toLowerCase() === 'pagado'

              return (
                <tr
                  key={pedido.id}
                  onClick={() => alSeleccionarPedido(pedido)}
                  className={`cursor-pointer transition ${
                    seleccionado
                      ? 'bg-[#f4f8ff]'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="px-3.5 py-3 align-top whitespace-nowrap">
                    <div className="font-extrabold text-[#0A2540]">
                      #{pedido.codigo}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-400">
                      {pedido.fechaHoraChile || pedido.fecha}
                    </div>
                  </td>

                  <td className="px-3.5 py-3 align-top">
                    <div className="font-medium text-slate-800">
                      {pedido.detalle ||
                        (pedido.items?.length > 0
                          ? pedido.items
                              .map(
                                (it) =>
                                  `${it.cantidad}x ${it.producto?.nombre || 'Producto'}`
                              )
                              .join(', ')
                          : 'Pedido de gas')}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {pedido.direccion}
                      {pedido.comuna &&
                      !String(pedido.direccion || '')
                        .toLowerCase()
                        .includes(String(pedido.comuna).toLowerCase())
                        ? `, ${pedido.comuna}`
                        : ''}
                    </div>
                  </td>

                  <td className="px-3.5 py-3 align-top whitespace-nowrap">
                    <div className="font-bold text-[#0A2540]">
                      {formatearPesos(pedido.total)}
                    </div>
                    <div
                      className={`mt-0.5 text-[11px] font-semibold ${
                        esPagado ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {esPagado ? 'Pagado' : 'Pendiente'}
                    </div>
                  </td>

                  <td className="px-3.5 py-3 align-top whitespace-nowrap">
                    <InsigniaEstado
                      variante={obtenerVarianteEstado(pedido.estado)}
                    >
                      {pedido.estado}
                    </InsigniaEstado>
                    {pedido.repartidor && (
                      <div className="mt-1 text-[11px] text-slate-500">
                        {pedido.repartidor}
                      </div>
                    )}
                  </td>

                  <td className="px-3.5 py-3 align-top text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        alSeleccionarPedido(pedido)
                      }}
                      className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        seleccionado
                          ? 'bg-[#2358b9] text-white'
                          : 'border border-slate-200 bg-white text-[#2358b9] hover:border-[#2358b9] hover:bg-blue-50'
                      }`}
                    >
                      {seleccionado ? 'Viendo' : 'Ver'}
                    </button>
                  </td>
                </tr>
              )
            })}

            {pedidos.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  No se encontraron pedidos con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de Paginación */}
      <nav
        aria-label="Paginación de pedidos"
        className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500"
      >
        <span>
          Mostrando <strong className="text-slate-700">{inicio}–{fin}</strong>{' '}
          de <strong className="text-slate-700">{totalElementos}</strong>{' '}
          pedidos
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={paginaActual <= 1}
            onClick={() => alCambiarPagina(paginaActual - 1)}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>

          {paginasVisibles.map((item) =>
            typeof item === 'string' ? (
              <span key={item} className="px-1.5 text-slate-400">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                aria-current={item === paginaActual ? 'page' : undefined}
                onClick={() => alCambiarPagina(item)}
                className={`min-w-[32px] cursor-pointer rounded-lg px-2.5 py-1.5 font-bold transition ${
                  item === paginaActual
                    ? 'bg-[#2358b9] text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            disabled={paginaActual >= totalPaginas}
            onClick={() => alCambiarPagina(paginaActual + 1)}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </nav>
    </section>
  )
}

export default ListaPedidosPaginable
