const resolverDatosRepartidor = (pedido, repartidores = []) => {
  const nombre = pedido?.repartidor ? String(pedido.repartidor).trim() : ''
  if (!nombre) return null

  const clave = nombre.toLowerCase()
  const coincidenciaApi = repartidores.find(
    (r) => String(r.nombre || '').trim().toLowerCase() === clave
  )

  return {
    nombre,
    patente:
      coincidenciaApi?.patenteCamion ||
      pedido?.entrega?.patente_camion ||
      '',
    planta:
      pedido?.entrega?.planta ||
      coincidenciaApi?.comuna ||
      pedido?.comuna ||
      '',
    telefono: coincidenciaApi?.telefono || '',
    vehiculo: 'Camión Reparto Gas El Volcán',
  }
}

export function TarjetaRepartidorSeguimiento({ pedido, repartidores = [] }) {
  const info = resolverDatosRepartidor(pedido, repartidores)
  const telefonoHref = info?.telefono
    ? `tel:${info.telefono.replace(/[^\d+]/g, '')}`
    : null

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="m-0 text-xs font-bold uppercase tracking-wider text-slate-400">
        REPARTIDOR ASIGNADO
      </p>

      <div className="mt-4 flex items-center gap-3.5">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0A2540] text-white"
          aria-hidden="true"
        >
          <svg
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.5-1.632z"
            />
          </svg>
        </div>

        <div className="min-w-0">
          <h2 className="m-0 text-lg font-extrabold text-[#0A2540]">
            {info ? info.nombre : 'Por asignar'}
          </h2>

          {info ? (
            <p className="m-0 mt-1 text-xs text-slate-500">{info.vehiculo}</p>
          ) : (
            <p className="m-0 mt-1 text-xs text-slate-500">
              Aún no hay repartidor asignado a este pedido
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs sm:text-sm">
        <span className="text-slate-500">
          Patente:{' '}
          <strong className="font-bold text-[#0A2540]">
            {info ? info.patente || 'No informada' : 'Por asignar'}
          </strong>
        </span>
        <span className="text-slate-500">
          Planta:{' '}
          <strong className="font-bold text-[#0A2540]">
            {(info && info.planta) || pedido?.comuna || 'No informada'}
          </strong>
        </span>
      </div>

      {info && telefonoHref ? (
        <a
          href={telefonoHref}
          title={`Llamar a ${info.nombre} (${info.telefono})`}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2358b9] px-4 py-3 text-sm font-bold text-white no-underline shadow-sm transition hover:bg-[#1b4592]"
        >
          <svg
            className="h-4 w-4"
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
          <span>Llamar al Repartidor</span>
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="mt-4 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-500"
        >
          Llamar al Repartidor
        </button>
      )}
    </section>
  )
}

export default TarjetaRepartidorSeguimiento
