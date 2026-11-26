export function BarraInferiorRepartidor({
  tabActiva,
  alCambiarTab,
  contadores = { en_ruta: 0, disponibles: 0, entregados: 0 },
}) {
  const tabs = [
    {
      id: 'en_ruta',
      etiqueta: 'Mis Rutas',
      cantidad: contadores.en_ruta,
      icono: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
          />
        </svg>
      ),
    },
    {
      id: 'disponibles',
      etiqueta: 'Por Tomar',
      cantidad: contadores.disponibles,
      icono: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
        </svg>
      ),
    },
    {
      id: 'entregados',
      etiqueta: 'Entregados',
      cantidad: contadores.entregados,
      icono: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ]

  return (
    <nav
      aria-label="Navegación de repartidor"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white shadow-[0_-4px_16px_rgba(10,37,64,0.06)]"
    >
      <div className="mx-auto grid max-w-2xl grid-cols-3">
        {tabs.map((tab) => {
          const activa = tabActiva === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => alCambiarTab(tab.id)}
              aria-current={activa ? 'page' : undefined}
              className={`relative flex min-h-[60px] cursor-pointer flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-bold transition ${
                activa
                  ? 'text-[#2358b9]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {activa && (
                <span className="absolute top-0 h-0.5 w-12 rounded-b-full bg-[#2358b9]" />
              )}
              <div className="relative flex items-center justify-center">
                {tab.icono}
                {tab.cantidad > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-3.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-extrabold ${
                      activa
                        ? 'bg-[#FF4500] text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.cantidad}
                  </span>
                )}
              </div>
              <span>{tab.etiqueta}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BarraInferiorRepartidor
