export function AccionesUsuarioNav({
  usuario,
  alIrA,
  alCerrarSesion,
  esMovil = false,
}) {
  const nombreVisible = usuario
    ? `${usuario.nombres || usuario.nombre || ''} ${usuario.apellidos || ''}`.trim()
    : ''
  const esAdmin =
    String(usuario?.rol || usuario?.perfil || '').toLowerCase() === 'admin'

  if (esMovil) {
    return (
      <div className="flex flex-col gap-2 border-t border-white/15 pt-3">
        {usuario ? (
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-0.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00A8E8]">
                Cliente:
              </span>
              <strong className="text-sm font-bold text-white">
                {nombreVisible}
              </strong>
            </div>
            {esAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => alIrA('/administradora')}
                  className="w-full cursor-pointer rounded-lg border border-[#00A8E8]/40 bg-[#00A8E8]/15 px-3.5 py-2.5 text-left text-sm font-semibold text-[#00A8E8] transition hover:bg-[#00A8E8]/30 hover:text-white"
                >
                  Panel Administrador
                </button>
                <button
                  type="button"
                  onClick={() => alIrA('/administradora/productos')}
                  className="w-full cursor-pointer rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-left text-sm font-medium text-white/90 transition hover:bg-white/10"
                >
                  Gestionar Productos
                </button>
              </>
            )}
            <button
              type="button"
              onClick={alCerrarSesion}
              className="w-full cursor-pointer rounded-lg border border-white/20 bg-white/5 py-2.5 text-center text-sm font-semibold text-white/85 transition hover:border-red-400/50 hover:bg-red-500/20 hover:text-red-200"
            >
              Salir
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => alIrA('/login')}
              className="w-full cursor-pointer rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={() => alIrA('/register')}
              className="w-full cursor-pointer rounded-lg bg-[#FF4500] py-2.5 text-center text-sm font-semibold text-white shadow transition hover:bg-[#e03d00]"
            >
              Registrarse
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2.5 border-l border-white/15 pl-3">
      {usuario ? (
        <div className="flex items-center gap-2.5">
          <span
            className="max-w-[180px] truncate rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white select-none"
            title={usuario.email || usuario.correo || 'Cliente'}
          >
            {nombreVisible}
          </span>
          {esAdmin && (
            <>
              <button
                type="button"
                onClick={() => alIrA('/administradora')}
                className="cursor-pointer rounded-lg border border-[#00A8E8]/40 bg-[#00A8E8]/15 px-3.5 py-2 text-sm font-semibold text-[#00A8E8] transition hover:bg-[#00A8E8]/30 hover:text-white"
              >
                Panel Admin
              </button>
              <button
                type="button"
                onClick={() => alIrA('/administradora/productos')}
                className="cursor-pointer rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Catálogo Admin
              </button>
            </>
          )}
          <button
            type="button"
            onClick={alCerrarSesion}
            className="cursor-pointer rounded-lg border border-white/20 bg-white/5 px-3.5 py-1.5 text-sm font-semibold text-white/85 transition hover:border-red-400/50 hover:bg-red-500/20 hover:text-red-300"
            title="Cerrar sesión"
          >
            Salir
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => alIrA('/login')}
            className="cursor-pointer rounded-lg px-3.5 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            Ingresar
          </button>
          <button
            type="button"
            onClick={() => alIrA('/register')}
            className="cursor-pointer rounded-lg bg-[#FF4500] px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#e03d00]"
          >
            Registrarse
          </button>
        </>
      )}
    </div>
  )
}

export default AccionesUsuarioNav
