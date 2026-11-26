import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useSesion } from '../context/Sesion.jsx'
import {
  ListarMisPedidos,
  esPedidoDelUsuario,
} from '../service/pedidoService.js'
import { ListarRepartidores } from '../service/inventarioService.js'
import { CabeceraSeguimiento } from '../components/seguimiento/CabeceraSeguimiento.jsx'
import { TarjetaRepartidorSeguimiento } from '../components/seguimiento/TarjetaRepartidorSeguimiento.jsx'
import { DetallePedidoSeguimiento } from '../components/seguimiento/DetallePedidoSeguimiento.jsx'
import { HistorialPedidoSeguimiento } from '../components/seguimiento/HistorialPedidoSeguimiento.jsx'
import { ListaPedidosPaginable } from '../components/seguimiento/ListaPedidosPaginable.jsx'
import { EstadoVacio } from '../components/ui/EstadoVacio.jsx'
import { BannerAlerta } from '../components/ui/BannerAlerta.jsx'
import {
  EsqueletoSeguimiento,
  esperarEsqueleto,
} from '../components/ui/Esqueleto.jsx'

export function SeguimientoPedido() {
  const { id: idRuta } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { usuario } = useSesion()

  const [pedidos, setPedidos] = useState([])
  const [repartidores, setRepartidores] = useState([])
  const [pedidoSeleccionadoId, setPedidoSeleccionadoId] = useState(
    () => idRuta || location.state?.pedido?.id || ''
  )
  const [cargando, setCargando] = useState(() => Boolean(usuario))
  const [actualizando, setActualizando] = useState(false)
  const [error, setError] = useState('')

  // Filtros y paginación de la lista de pedidos
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [tamanoPagina, setTamanoPagina] = useState(5)

  const obtenerDatosSeguimiento = useCallback(async () => {
    if (!usuario) {
      return { listaFinal: [], listaRepartidores: [] }
    }

    const [listaPedidosPropios, listaRepartidores] = await Promise.all([
      ListarMisPedidos(usuario),
      ListarRepartidores().catch(() => []),
    ])

    const listaFinal = listaPedidosPropios.filter((p) =>
      esPedidoDelUsuario(p, usuario)
    )

    return {
      listaFinal,
      listaRepartidores: Array.isArray(listaRepartidores)
        ? listaRepartidores
        : [],
    }
  }, [usuario])

  useEffect(() => {
    if (!usuario) {
      return
    }

    let montado = true

    Promise.all([obtenerDatosSeguimiento(), esperarEsqueleto()])
      .then(([{ listaFinal, listaRepartidores }]) => {
        if (!montado) return
        setError('')
        setPedidos(listaFinal)
        setRepartidores(listaRepartidores)
        if (listaFinal.length > 0) {
          setPedidoSeleccionadoId((prevId) => {
            const buscado = idRuta || prevId
            const encontrado = listaFinal.find(
              (p) =>
                String(p.id) === String(buscado) ||
                String(p.codigo).toLowerCase() === String(buscado).toLowerCase()
            )
            return encontrado ? String(encontrado.id) : String(listaFinal[0].id)
          })
        } else {
          setPedidoSeleccionadoId('')
        }
      })
      .catch(async (err) => {
        await esperarEsqueleto()
        if (!montado) return
        setPedidos([])
        setPedidoSeleccionadoId('')
        setError(
          err?.message ||
            'No pudimos cargar el seguimiento de tus pedidos desde el servidor.'
        )
      })
      .finally(() => {
        if (montado) setCargando(false)
      })

    return () => {
      montado = false
    }
  }, [usuario, obtenerDatosSeguimiento, idRuta])

  const actualizarEstado = async () => {
    setActualizando(true)
    setError('')
    try {
      const { listaFinal, listaRepartidores } = await obtenerDatosSeguimiento()
      setPedidos(listaFinal)
      setRepartidores(listaRepartidores)
    } catch (err) {
      setError(
        err?.message ||
          'No pudimos actualizar el estado del pedido en este momento.'
      )
    } finally {
      setActualizando(false)
    }
  }

  const pedidosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return pedidos.filter((p) => {
      if (
        filtroEstado !== 'Todos' &&
        String(p.estado || '').toLowerCase() !== filtroEstado.toLowerCase()
      ) {
        return false
      }
      if (!texto) return true
      const itemsTexto = Array.isArray(p.items)
        ? p.items.map((it) => it.producto?.nombre || '').join(' ')
        : ''
      const campos = [
        p.codigo,
        p.id,
        p.direccion,
        p.comuna,
        p.detalle,
        p.repartidor,
        itemsTexto,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return campos.includes(texto)
    })
  }, [pedidos, filtroEstado, busqueda])

  const totalElementos = pedidosFiltrados.length
  const totalPaginas = Math.max(1, Math.ceil(totalElementos / tamanoPagina))
  const paginaSegura = Math.min(Math.max(1, paginaActual), totalPaginas)

  const pedidosPaginados = useMemo(() => {
    const inicio = (paginaSegura - 1) * tamanoPagina
    return pedidosFiltrados.slice(inicio, inicio + tamanoPagina)
  }, [pedidosFiltrados, paginaSegura, tamanoPagina])

  const pedidoActivo = useMemo(() => {
    if (pedidos.length === 0) return null
    const buscado = idRuta || pedidoSeleccionadoId
    return (
      pedidos.find(
        (p) =>
          String(p.id) === String(buscado) ||
          String(p.codigo).toLowerCase() === String(buscado).toLowerCase()
      ) || pedidos[0]
    )
  }, [pedidos, idRuta, pedidoSeleccionadoId])

  const seleccionarPedido = (pedido) => {
    if (!pedido) return
    setPedidoSeleccionadoId(String(pedido.id))
    navigate(`/seguimiento/${pedido.id}`, { replace: true })
  }

  const cambiarFiltroEstado = (nuevoEstado) => {
    setFiltroEstado(nuevoEstado)
    setPaginaActual(1)
  }

  const cambiarBusqueda = (nuevoTexto) => {
    setBusqueda(nuevoTexto)
    setPaginaActual(1)
  }

  const cambiarTamanoPagina = (nuevoTamano) => {
    setTamanoPagina(nuevoTamano)
    setPaginaActual(1)
  }

  if (usuario && cargando) {
    return (
      <main className="min-h-[calc(100vh-140px)] bg-[#f4f7fb] px-4 py-7 md:px-6">
        <EsqueletoSeguimiento />
      </main>
    )
  }

  if (!usuario || !pedidoActivo) {
    return (
      <main className="flex min-h-[calc(100vh-140px)] items-center justify-center bg-[#f4f7fb] p-6">
        <div className="w-full max-w-md">
          {error && <BannerAlerta mensaje={error} tipo="error" className="mb-4" />}
          <EstadoVacio
            titulo={
              usuario
                ? 'Aún no tienes pedidos registrados'
                : 'Inicia sesión para ver tus pedidos'
            }
            descripcion={
              usuario
                ? 'Cuando realices un pedido de gas o accesorios, podrás seguir su despacho en vivo desde aquí.'
                : 'Ingresa con tu cuenta de cliente para consultar el estado y seguimiento de tus despachos.'
            }
            textoBoton={usuario ? 'Ir al Catálogo de Productos' : 'Iniciar Sesión'}
            alAccionar={() => navigate(usuario ? '/productos' : '/login')}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-140px)] bg-[#f4f7fb] pb-10">
      {/* Barra superior con selector "Tus pedidos:" */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={actualizarEstado}
              disabled={actualizando}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#2358b9] hover:text-[#2358b9] disabled:opacity-60"
            >
              <svg
                className={`h-3.5 w-3.5 ${actualizando ? 'animate-spin' : ''}`}
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
              <span>{actualizando ? 'Actualizando...' : 'Actualizar estado'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <label
              htmlFor="selector-tus-pedidos"
              className="text-sm font-medium text-slate-500"
            >
              Tus pedidos:
            </label>
            <select
              id="selector-tus-pedidos"
              value={String(pedidoActivo.id)}
              onChange={(e) => {
                const elegido = pedidos.find(
                  (p) => String(p.id) === e.target.value
                )
                if (elegido) seleccionarPedido(elegido)
              }}
              className="min-w-[250px] cursor-pointer rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-[#0A2540] shadow-xs transition focus:border-[#2358b9] focus:outline-none"
            >
              {pedidos.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {`${p.codigo} — ${p.estado} (${p.fecha})`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-6 md:px-6">
        {error && <BannerAlerta mensaje={error} tipo="error" />}

        {/* Tarjeta superior de Seguimiento en vivo + 4 pasos */}
        <CabeceraSeguimiento pedido={pedidoActivo} />

        {/* Grilla inferior: Lista paginable + Tarjetas laterales de detalle */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 xl:col-span-8">
            <ListaPedidosPaginable
              pedidos={pedidosPaginados}
              pedidoSeleccionadoId={pedidoActivo.id}
              filtroEstado={filtroEstado}
              busqueda={busqueda}
              paginaActual={paginaSegura}
              tamanoPagina={tamanoPagina}
              totalElementos={totalElementos}
              totalPaginas={totalPaginas}
              alCambiarFiltro={cambiarFiltroEstado}
              alCambiarBusqueda={cambiarBusqueda}
              alCambiarPagina={setPaginaActual}
              alCambiarTamanoPagina={cambiarTamanoPagina}
              alSeleccionarPedido={seleccionarPedido}
            />
          </div>

          <aside className="flex flex-col gap-5 lg:col-span-5 xl:col-span-4">
            <TarjetaRepartidorSeguimiento
              pedido={pedidoActivo}
              repartidores={repartidores}
            />
            <DetallePedidoSeguimiento pedido={pedidoActivo} />
            <HistorialPedidoSeguimiento pedido={pedidoActivo} />
          </aside>
        </div>
      </div>
    </main>
  )
}

export default SeguimientoPedido
