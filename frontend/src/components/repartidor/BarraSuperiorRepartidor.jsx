const logoVolcan =
  'https://res.cloudinary.com/hsr9lgyw/image/upload/elVolcan.svg'

export function BarraSuperiorRepartidor({
  nombreRepartidor,
  patente,
  actualizando = false,
  alActualizar,
  alCerrarSesion,
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#0A2540] text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-between gap-2 px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src={logoVolcan}
            alt="El Volcán"
            className="h-9 w-9 shrink-0 object-contain brightness-0 invert"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-extrabold tracking-wide text-white">
                {nombreRepartidor || 'Repartidor'}
              </span>
              {patente && (
                <span className="shrink-0 rounded-md bg-white/15 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[#00A8E8]">
                  {patente}
                </span>
              )}
            </div>
            <p className="m-0 text-[11px] font-medium text-white/70">
              App Repartidor · El Volcán
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={alActualizar}
            disabled={actualizando}
            aria-label="Actualizar pedidos"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-white/10 text-white transition active:scale-95 hover:bg-white/20 disabled:opacity-50"
          >
            <svg
              className={`h-5 w-5 ${actualizando ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={alCerrarSesion}
            className="flex h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-white/10 px-3 text-xs font-bold text-white/90 transition active:scale-95 hover:bg-red-500/25 hover:text-red-200"
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
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            <span>Salir</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default BarraSuperiorRepartidor
