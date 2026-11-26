const obtenerDireccionCompleta = (pedido) => {
  const dir = String(pedido?.direccion || '').trim()
  const comuna = String(pedido?.comuna || pedido?.direccionDetalle?.comuna || '').trim()
  if (!dir && !comuna) return 'Dirección por confirmar'
  if (!comuna) return dir
  if (dir.toLowerCase().includes(comuna.toLowerCase())) return dir
  return dir ? `${dir}, ${comuna}` : comuna
}

const obtenerInfoEstadoPrincipal = (pedido) => {
  const estado = String(pedido?.estado || 'Pendiente').toLowerCase()
  const entrega = pedido?.entrega || {}

  if (estado === 'entregado') {
    return {
      titulo: 'Tu pedido fue entregado',
      tiempoValor: 'Entregado',
      tiempoDetalle: 'Despacho completado',
      pasoActual: 4,
      esCancelada: false,
    }
  }

  if (estado === 'cancelada') {
    return {
      titulo: 'Este pedido fue cancelado',
      tiempoValor: 'Cancelado',
      tiempoDetalle: 'Despacho anulado',
      pasoActual: 0,
      esCancelada: true,
    }
  }

  if (estado === 'en ruta') {
    const tieneMin = entrega.tiempo_estimado_min != null
    const tieneDist = entrega.distancia_km != null
    return {
      titulo: 'Tu cilindro de gas está en camino',
      tiempoValor: tieneMin ? `~${entrega.tiempo_estimado_min} min` : 'En ruta',
      tiempoDetalle: tieneDist
        ? `A ${entrega.distancia_km} km de distancia`
        : 'Repartidor en camino',
      pasoActual: 3,
      esCancelada: false,
    }
  }

  const tieneMin = entrega.tiempo_estimado_min != null
  const tieneDist = entrega.distancia_km != null
  return {
    titulo: 'Tu pedido ha sido recibido',
    tiempoValor: tieneMin ? `~${entrega.tiempo_estimado_min} min` : 'Pendiente',
    tiempoDetalle: tieneDist
      ? `A ${entrega.distancia_km} km de distancia`
      : 'En preparación en planta',
    pasoActual: pedido?.repartidor ? 2 : 1,
    esCancelada: false,
  }
}

export function CabeceraSeguimiento({ pedido }) {
  if (!pedido) return null

  const direccionCompleta = obtenerDireccionCompleta(pedido)
  const info = obtenerInfoEstadoPrincipal(pedido)
  const esPagado = String(pedido.estadoPago || '').toLowerCase() === 'pagado'
  const tieneRepartidor = Boolean(pedido.repartidor)

  const pasos = [
    {
      numero: 1,
      titulo: 'Pedido Recibido',
      subtitulo: esPagado
        ? 'Pago confirmado'
        : pedido.metodoPago === 'repartidor'
          ? 'Pago al repartidor'
          : 'Pago pendiente',
      estado: info.esCancelada ? 'cancelado' : 'completado',
      esActual: info.esCancelada,
    },
    {
      numero: 2,
      titulo: 'Pedido Cargado',
      subtitulo: tieneRepartidor || info.pasoActual >= 3
        ? 'Repartidor asignado'
        : 'Asignando repartidor',
      estado: info.esCancelada
        ? 'pendiente'
        : info.pasoActual >= 3
          ? 'completado'
          : 'activo',
      esActual: !info.esCancelada && info.pasoActual < 3,
    },
    {
      numero: 3,
      titulo: 'En Camino',
      subtitulo:
        info.pasoActual === 3
          ? 'Repartidor en ruta'
          : info.pasoActual >= 4
            ? 'Recorrido finalizado'
            : 'Pendiente de salida',
      estado: info.esCancelada
        ? 'pendiente'
        : info.pasoActual >= 4
          ? 'completado'
          : info.pasoActual === 3
            ? 'activo'
            : 'pendiente',
      esActual: !info.esCancelada && info.pasoActual === 3,
    },
    {
      numero: 4,
      titulo: 'Entregado',
      subtitulo:
        info.pasoActual >= 4 ? 'Entrega completada' : 'Pendiente de entrega',
      estado: info.esCancelada
        ? 'pendiente'
        : info.pasoActual >= 4
          ? 'completado'
          : 'pendiente',
      esActual: !info.esCancelada && info.pasoActual >= 4,
    },
  ]

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              SEGUIMIENTO DE DESPACHO EN VIVO
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-bold text-[#0A2540]">
              Pedido #{pedido.codigo}
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0A2540] sm:text-3xl">
            {info.titulo}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Dirección de entrega:{' '}
            <strong className="font-semibold text-slate-800">
              {direccionCompleta}
            </strong>
            {pedido.fechaHoraChile && (
              <>
                {' '}
                • Registrado: {pedido.fechaHoraChile} (Hora Chile)
              </>
            )}
          </p>
        </div>

        {/* Tarjeta Tiempo Estimado */}
        <div className="flex shrink-0 items-center gap-3.5 rounded-2xl border border-blue-100 bg-[#f4f8ff] px-5 py-3.5">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2358b9] text-white shadow-sm"
            aria-hidden="true"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
            </svg>
          </div>
          <div>
            <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              TIEMPO ESTIMADO
            </p>
            <p className="m-0 text-2xl font-extrabold leading-tight text-[#1e4bb8]">
              {info.tiempoValor}
            </p>
            <p className="m-0 text-xs font-medium text-[#2358b9]">
              {info.tiempoDetalle}
            </p>
          </div>
        </div>
      </div>

      {/* Stepper de 4 Etapas */}
      <div
        className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Progreso del despacho"
      >
        {pasos.map((paso) => {
          const esCompletado = paso.estado === 'completado'
          const esActivo = paso.estado === 'activo'
          const esCancelado = paso.estado === 'cancelado'

          const claseCirculo = esCompletado
            ? `bg-emerald-500 text-white${paso.esActual ? ' animacion-respiracion-verde' : ''}`
            : esActivo
              ? 'bg-[#2358b9] text-white animacion-respiracion-azul'
              : esCancelado
                ? 'bg-red-600 text-white animacion-respiracion-rojo'
                : 'bg-slate-200/80 text-slate-500'

          const claseSubtitulo = esActivo
            ? 'font-medium text-[#2358b9]'
            : esCompletado && paso.esActual
              ? 'font-medium text-emerald-600'
              : esCancelado
                ? 'font-medium text-red-600'
                : 'text-slate-400'

          return (
            <div key={paso.numero} className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${claseCirculo}`}
              >
                {esCompletado ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  paso.numero
                )}
              </div>
              <div className="min-w-0">
                <p className="m-0 text-sm font-bold text-[#0A2540]">
                  {paso.titulo}
                </p>
                <p className={`m-0 text-xs ${claseSubtitulo}`}>
                  {paso.subtitulo}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default CabeceraSeguimiento
